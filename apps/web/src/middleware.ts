import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_PATHS = ['/form', '/my-requests', '/admin', '/confirmation'];

// Admin-only routes
const ADMIN_PATHS = ['/admin'];

// Public routes that should redirect if authenticated
const AUTH_PATHS = ['/login', '/signup', '/reset-password'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Check if path is protected
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // Check if path is admin-only
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  // Check if path is auth-related
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Handle protected routes
  if (isProtectedPath && !session) {
    // Store intended destination for redirect after login
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle admin routes
  if (isAdminPath && session) {
    try {
      // Check user role from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        // Redirect non-admin users to their requests page
        return NextResponse.redirect(new URL('/my-requests', req.url));
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      return NextResponse.redirect(new URL('/my-requests', req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && session) {
    // Get redirect parameter or default to my-requests
    const redirect = req.nextUrl.searchParams.get('redirect') || '/my-requests';
    return NextResponse.redirect(new URL(redirect, req.url));
  }

  // Session refresh and expiry handling
  if (session) {
    const expiresAt = new Date(session.expires_at || 0);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Refresh session if less than 10 minutes until expiry
    if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh failed:', error);
          // If refresh fails and on protected route, redirect to login
          if (isProtectedPath) {
            const redirectUrl = new URL('/login', req.url);
            redirectUrl.searchParams.set('redirect', pathname);
            redirectUrl.searchParams.set('error', 'session_expired');
            return NextResponse.redirect(redirectUrl);
          }
        } else if (data.session) {
          // Update response with new session
          res.headers.set('X-Session-Refreshed', 'true');
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    }

    // Add session expiry information to response headers
    res.headers.set('X-Session-Expires', expiresAt.toISOString());
    res.headers.set(
      'X-Session-Expires-In',
      Math.max(0, Math.floor(timeUntilExpiry / 1000)).toString()
    );
  }

  // CSRF Protection for API routes
  if (pathname.startsWith('/api/') && req.method !== 'GET') {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    if (origin && host) {
      const originUrl = new URL(origin);
      const expectedOrigin = `${
        process.env.NODE_ENV === 'production' ? 'https' : 'http'
      }://${host}`;

      if (origin !== expectedOrigin) {
        return new NextResponse('CSRF validation failed', { status: 403 });
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/health (health check endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/health).*)',
  ],
};