import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { proxy } from './proxy';

/**
 * Middleware to enforce security headers on all responses
 * and protect admin routes via server-side auth verification.
 *
 * Mitigates:
 * - Clickjacking (X-Frame-Options, CSP frame-ancestors)
 * - MIME-type sniffing (X-Content-Type-Options)
 * - Information leakage via Referrer (Referrer-Policy)
 * - Unwanted browser features (Permissions-Policy)
 * - Man-in-the-middle downgrade attacks (Strict-Transport-Security)
 * - Unauthorized admin access (proxy auth check)
 *
 * References:
 * - OWASP A01:2021 Broken Access Control
 * - OWASP A05:2021 Security Misconfiguration
 * - MITRE ATT&CK T1078 Valid Accounts
 * - MITRE ATT&CK T1189 Drive-by Compromise
 */
export async function middleware(request: NextRequest) {
  // Check admin route protection first — may redirect before headers
  const proxyResponse = await proxy(request);
  if (proxyResponse.status !== 200) {
    return proxyResponse;
  }

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
  response.headers.set('X-DNS-Prefetch-Control', 'off');

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
