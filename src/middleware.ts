import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  // Allow access to public routes
  const publicPaths = ['/', '/login', '/signup'];
  const pathname = request.nextUrl.pathname;
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log(`No user found, redirecting to login from: ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if trying to access admin routes
  if (pathname.startsWith('/admin')) {
    if (user.user_metadata?.role !== 'admin') {
      console.log(`User ${user.email} is not admin, redirecting to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
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