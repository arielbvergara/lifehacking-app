import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from './proxy';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:8080');

describe('Proxy - Security Headers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set X-Content-Type-Options header', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    const response = await proxy(request);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('should set X-Frame-Options header to DENY', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    const response = await proxy(request);
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('should set Referrer-Policy header', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    const response = await proxy(request);
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('should set Permissions-Policy header', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    const response = await proxy(request);
    expect(response.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()'
    );
  });

  it('should set Strict-Transport-Security header', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    const response = await proxy(request);
    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('should set X-DNS-Prefetch-Control header', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    const response = await proxy(request);
    expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('off');
  });

  it('should set security headers on admin routes for authenticated admins', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/admin/dashboard'));
    request.cookies.set('session', 'valid-token');
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ role: 'Admin' }),
    } as Response);

    const response = await proxy(request);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('should set security headers on admin redirect responses', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/admin/dashboard'));
    // No session cookie — triggers redirect

    const response = await proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });
});

describe('Proxy - Admin Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Admin Route Protection', () => {
    it('Middleware_ShouldAllowAccess_WhenAuthenticatedAdmin', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      // Mock session cookie
      mockRequest.cookies.set('session', 'valid-token');

      // Mock successful backend verification
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'Admin' }),
      } as Response);

      const response = await proxy(mockRequest);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307); // Not a redirect
    });

    it('Middleware_ShouldRedirectTo404_WhenNoSessionCookie', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      // No session cookie set

      const response = await proxy(mockRequest);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toContain('/404');
    });

    it('Middleware_ShouldRedirectTo404_WhenBackendReturnsNonAdmin', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      // Mock backend returning non-admin user
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'User' }),
      } as Response);

      const response = await proxy(mockRequest);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toContain('/404');
    });

    it('Middleware_ShouldRedirectTo404_WhenBackendReturns401', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'invalid-token');

      // Mock backend returning 401
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const response = await proxy(mockRequest);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toContain('/404');
    });

    it('Middleware_ShouldRedirectTo404_WhenBackendReturns403', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      // Mock backend returning 403
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      const response = await proxy(mockRequest);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toContain('/404');
    });

    it('Middleware_ShouldRedirectTo404_WhenBackendThrowsError', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      // Mock backend throwing network error
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const response = await proxy(mockRequest);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect
      expect(response.headers.get('location')).toContain('/404');
    });

    it('Middleware_ShouldCallBackendAPI_WithCorrectEndpoint', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'Admin' }),
      } as Response);

      await proxy(mockRequest);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/user/me',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
      );
    });

    it('Middleware_ShouldIncludeAuthorizationHeader_WhenCallingBackend', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      const testToken = 'test-firebase-token';
      
      mockRequest.cookies.set('session', testToken);

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'Admin' }),
      } as Response);

      await proxy(mockRequest);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${testToken}`,
          },
        })
      );
    });
  });

  describe('Route Matching', () => {
    it('Middleware_ShouldProtectAdminRoutes_WhenPathStartsWithAdmin', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/dashboard');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'Admin' }),
      } as Response);

      await proxy(mockRequest);

      expect(fetch).toHaveBeenCalled();
    });

    it('Middleware_ShouldProtectNestedAdminRoutes_WhenPathIsNested', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'Admin' }),
      } as Response);

      await proxy(mockRequest);

      expect(fetch).toHaveBeenCalled();
    });

    it('Middleware_ShouldNotProtectNonAdminRoutes_WhenPathDoesNotStartWithAdmin', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/categories');

      const response = await proxy(mockRequest);

      expect(fetch).not.toHaveBeenCalled();
      expect(response.status).not.toBe(307); // Not a redirect
    });

    it('Middleware_ShouldNotProtectHomePage_WhenPathIsRoot', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/');

      const response = await proxy(mockRequest);

      expect(fetch).not.toHaveBeenCalled();
      expect(response.status).not.toBe(307);
    });

    it('Middleware_ShouldNotProtectPublicRoutes_WhenPathIsPublic', async () => {
      const publicRoutes = [
        'http://localhost:3000/login',
        'http://localhost:3000/signup',
        'http://localhost:3000/about',
        'http://localhost:3000/search',
        'http://localhost:3000/tips/popular',
      ];

      for (const url of publicRoutes) {
        const mockRequest = new NextRequest(url);
        const response = await proxy(mockRequest);

        expect(fetch).not.toHaveBeenCalled();
        expect(response.status).not.toBe(307);
      }
    });
  });

  describe('Role Verification', () => {
    it('RoleVerification_ShouldAllowAccess_WhenRoleIsAdmin', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'Admin' }),
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).not.toBe(307);
    });

    it('RoleVerification_ShouldDenyAccess_WhenRoleIsUser', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'User' }),
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });

    it('RoleVerification_ShouldDenyAccess_WhenRoleIsMissing', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });

    it('RoleVerification_ShouldDenyAccess_WhenRoleIsNull', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: null }),
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });

    it('RoleVerification_ShouldBeCaseSensitive_WhenCheckingRole', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      // Role is lowercase 'admin' instead of 'Admin'
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'admin' }),
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });
  });

  describe('Error Handling', () => {
    it('ErrorHandling_ShouldHandleNetworkError_WhenBackendUnreachable', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockRejectedValue(new Error('ECONNREFUSED'));

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });

    it('ErrorHandling_ShouldHandleTimeout_WhenBackendSlow', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockRejectedValue(new Error('Timeout'));

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });

    it('ErrorHandling_ShouldHandleInvalidJSON_WhenBackendReturnsInvalidResponse', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });

    it('ErrorHandling_ShouldHandleEmptyResponse_WhenBackendReturnsEmpty', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => null,
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });
  });

  describe('Security', () => {
    it('Security_ShouldNotExposeTokenInURL_WhenRedirecting', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'secret-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const response = await proxy(mockRequest);

      const location = response.headers.get('location');
      expect(location).not.toContain('secret-token');
    });

    it('Security_ShouldValidateToken_BeforeAllowingAccess', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'valid-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ role: 'Admin' }),
      } as Response);

      await proxy(mockRequest);

      // Verify that backend was called to validate token
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    it('Security_ShouldRejectExpiredToken_WhenBackendReturns401', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'expired-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });

    it('Security_ShouldRejectTamperedToken_WhenBackendReturns403', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      mockRequest.cookies.set('session', 'tampered-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      const response = await proxy(mockRequest);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/404');
    });
  });

  describe('Redirect Behavior', () => {
    it('Redirect_ShouldRedirectTo404_NotLogin', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      // No session cookie

      const response = await proxy(mockRequest);

      expect(response.headers.get('location')).toContain('/404');
      expect(response.headers.get('location')).not.toContain('/login');
    });

    it('Redirect_ShouldPreserveProtocol_WhenRedirecting', async () => {
      const mockRequest = new NextRequest('https://example.com/admin/categories/create');
      
      // No session cookie

      const response = await proxy(mockRequest);

      const location = response.headers.get('location');
      expect(location).toContain('https://');
    });

    it('Redirect_ShouldUseCorrectDomain_WhenRedirecting', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/admin/categories/create');
      
      // No session cookie

      const response = await proxy(mockRequest);

      const location = response.headers.get('location');
      expect(location).toContain('localhost:3000');
    });
  });
});
