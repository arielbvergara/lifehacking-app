import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to add security headers to all responses.
 *
 * Mitigates:
 * - Clickjacking (X-Frame-Options, CSP frame-ancestors)
 * - MIME-type sniffing (X-Content-Type-Options)
 * - Information leakage via Referrer (Referrer-Policy)
 * - Unwanted browser features (Permissions-Policy)
 * - Man-in-the-middle downgrade attacks (Strict-Transport-Security)
 *
 * References:
 * - OWASP A05:2021 Security Misconfiguration
 * - MITRE ATT&CK T1189 Drive-by Compromise
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

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
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
