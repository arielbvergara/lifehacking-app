import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes
 * 
 * This middleware intercepts requests to /admin/* routes and verifies:
 * 1. User is authenticated (has session cookie)
 * 2. User has admin privileges (verified via backend API)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    console.log('[Middleware] Protecting admin route:', pathname);
    
    // Check if user is authenticated
    const session = request.cookies.get('session');
    
    if (!session) {
      console.log('[Middleware] No session cookie found - redirecting to 404');
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    console.log('[Middleware] Session cookie found, verifying with backend...');
    
    // Verify admin status via backend API
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me`;
      console.log('[Middleware] Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: { 
          Authorization: `Bearer ${session.value}`,
        },
      });
      
      console.log('[Middleware] API response status:', response.status);
      
      if (!response.ok) {
        console.log('[Middleware] API call failed - redirecting to 404');
        return NextResponse.redirect(new URL('/404', request.url));
      }
      
      const user = await response.json();
      console.log('[Middleware] User data:', { role: user.role });
      
      // Check if user has Admin role
      if (user.role !== 'Admin') {
        console.log('[Middleware] User is not admin (role:', user.role, ') - redirecting to 404');
        return NextResponse.redirect(new URL('/404', request.url));
      }
      
      console.log('[Middleware] Admin verified - allowing access');
    } catch (error) {
      // Error calling backend API - redirect to 404
      console.error('[Middleware] Error verifying admin status:', error);
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
