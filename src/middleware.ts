import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for the site access cookie
    const hasAccess = request.cookies.has('site-access-token');

    // Define paths that do not require authentication
    const isPublicPath =
        pathname === '/welcome' ||
        pathname === '/api/verify-access' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.'); // files with extensions (images, etc)

    if (hasAccess) {
        // If user has access and tries to go to welcome page, redirect to home
        if (pathname === '/welcome') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // If user has no access and is trying to access a protected path, redirect to welcome
    if (!isPublicPath) {
        return NextResponse.redirect(new URL('/welcome', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/verify-access (handled in logic, but good to keep broad matcher)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
