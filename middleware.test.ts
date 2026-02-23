/**
 * Security Headers Middleware Tests
 *
 * Validates that the middleware sets all required security headers
 * and integrates admin route protection.
 * Covers OWASP A05:2021 Security Misconfiguration
 * and OWASP A01:2021 Broken Access Control mitigations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

// Mock the proxy module
vi.mock('./proxy', () => ({
  proxy: vi.fn(),
}));

import { proxy } from './proxy';

describe('Security Headers Middleware', () => {
  let request: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    request = new NextRequest(new URL('http://localhost:3000/'));
    // Default: proxy allows the request through
    vi.mocked(proxy).mockResolvedValue({
      status: 200,
      headers: new Headers(),
    } as unknown as ReturnType<typeof proxy> extends Promise<infer T> ? T : never);
  });

  it('should set X-Content-Type-Options header', async () => {
    const response = await middleware(request);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('should set X-Frame-Options header to DENY', async () => {
    const response = await middleware(request);
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('should set Referrer-Policy header', async () => {
    const response = await middleware(request);
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('should set Permissions-Policy header', async () => {
    const response = await middleware(request);
    expect(response.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()'
    );
  });

  it('should set Strict-Transport-Security header', async () => {
    const response = await middleware(request);
    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('should set X-DNS-Prefetch-Control header', async () => {
    const response = await middleware(request);
    expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('off');
  });

  it('should return proxy redirect for unauthorized admin routes', async () => {
    const adminRequest = new NextRequest(new URL('http://localhost:3000/admin/dashboard'));
    const redirectResponse = {
      status: 307,
      headers: new Headers({ location: '/404' }),
    };
    vi.mocked(proxy).mockResolvedValue(redirectResponse as unknown as ReturnType<typeof proxy> extends Promise<infer T> ? T : never);

    const response = await middleware(adminRequest);
    expect(response.status).toBe(307);
    expect(proxy).toHaveBeenCalledWith(adminRequest);
  });

  it('should call proxy for every request', async () => {
    await middleware(request);
    expect(proxy).toHaveBeenCalledWith(request);
  });
});
