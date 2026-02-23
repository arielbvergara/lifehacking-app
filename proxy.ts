import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Applies security headers to the response.
 *
 * Mitigates:
 * - Clickjacking (X-Frame-Options)
 * - MIME-type sniffing (X-Content-Type-Options)
 * - Information leakage via Referrer (Referrer-Policy)
 * - Unwanted browser features (Permissions-Policy)
 * - Man-in-the-middle downgrade attacks (Strict-Transport-Security)
 *
 * References:
 * - OWASP A05:2021 Security Misconfiguration
 * - MITRE ATT&CK T1189 Drive-by Compromise
 */
function applySecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  response.headers.set('X-DNS-Prefetch-Control', 'off');
}

/**
 * Proxy to protect admin routes and enforce security headers
 *
 * This proxy intercepts requests to /admin/* routes and verifies:
 * 1. User is authenticated (has session cookie)
 * 2. User has admin privileges (verified via backend API)
 *
 * It also sets security headers on all responses.
 *
 * References:
 * - OWASP A01:2021 Broken Access Control
 * - MITRE ATT&CK T1078 Valid Accounts
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response: NextResponse;

  // Only protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    response = await verifyAdminAccess(request);
  } else {
    response = NextResponse.next();
  }

  applySecurityHeaders(response);
  return response;
}

async function verifyAdminAccess(request: NextRequest): Promise<NextResponse> {
  // Check if user is authenticated
  const session = request.cookies.get('session');

  if (!session) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // Verify admin status via backend API
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${session.value}`,
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    const user = await response.json();

    // Check if user has Admin role
    if (user.role !== 'Admin') {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  } catch {
    // Error calling backend API - redirect to 404
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}
