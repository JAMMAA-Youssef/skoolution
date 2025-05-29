import { NextResponse } from 'next/server';

export function middleware(request) {
    const isAuthenticated = request.cookies.get('token');
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register');

    // If trying to access auth pages while logged in, redirect to dashboard
    if (isAuthPage && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If trying to access protected pages while not logged in, redirect to login
    if (!isAuthPage && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// Configure which routes to protect
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/profile/:path*',
        '/courses/:path*',
        '/login',
        '/register'
    ]
}; 