import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  // Allow access to public routes
  const publicPaths = ['/', '/login', '/signup'];
  const pathname = request.nextUrl.pathname;
  
  console.log(`[Middleware] Processing request for: ${pathname}`);
  
  if (publicPaths.includes(pathname)) {
    console.log(`[Middleware] ${pathname} is a public path, allowing access`);
    return NextResponse.next();
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log(`[Middleware] Error getting user:`, error);
    }

    if (!user) {
      console.log(`[Middleware] No user found, redirecting to login from: ${pathname}`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log(`[Middleware] User found: ${user.email}`);

    // Check if trying to access admin routes
    if (pathname.startsWith('/admin')) {
      if (user.user_metadata?.role !== 'admin') {
        console.log(`[Middleware] User ${user.email} is not admin, redirecting to dashboard`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error(`[Middleware] Unexpected error:`, error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 