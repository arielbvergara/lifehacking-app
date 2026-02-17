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
    } catch (error) {
      // Error calling backend API - redirect to 404
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
