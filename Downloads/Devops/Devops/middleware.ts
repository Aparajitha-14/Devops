import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only run this middleware on /admin and its subpaths
  // Exclude /admin/login from the protection
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      // Redirect to login if no token is found
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Call the Python backend to verify the token
      const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/";
      const res = await fetch(`${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // Token is invalid or expired
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        // Clear the invalid cookie
        response.cookies.delete('admin_token');
        return response;
      }
      
      // Token is valid, proceed
      return NextResponse.next();
    } catch (error) {
      console.error('Error verifying token with backend:', error);
      // In case the backend is down, we might want to redirect to login or show an error
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the paths where this middleware should run
export const config = {
  matcher: ['/admin/:path*'],
};
