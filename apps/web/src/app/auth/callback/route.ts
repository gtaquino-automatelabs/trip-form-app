import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/my-requests';

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    const redirectUrl = new URL('/login', requestUrl.origin);
    redirectUrl.searchParams.set('error', error);
    if (error_description) {
      redirectUrl.searchParams.set('error_description', error_description);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    try {
      // Get cookies properly with await for Next.js 15+
      const cookieStore = await cookies();
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                });
              } catch (error) {
                // This can be ignored in Server Components
                console.log('Cookie setting error (can be ignored):', error);
              }
            },
          },
        }
      );
      
      // Exchange code for session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        const redirectUrl = new URL('/login', requestUrl.origin);
        redirectUrl.searchParams.set('error', 'session_error');
        redirectUrl.searchParams.set('error_description', sessionError.message);
        return NextResponse.redirect(redirectUrl);
      }

      // Log successful OAuth login for debugging
      if (data?.session) {
        console.log('OAuth login successful:', {
          provider: data.session.user.app_metadata?.provider,
          email: data.session.user.email,
          userId: data.session.user.id,
        });
      }

      // Redirect to intended destination or dashboard
      const redirectUrl = new URL(next, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      const redirectUrl = new URL('/login', requestUrl.origin);
      redirectUrl.searchParams.set('error', 'callback_error');
      return NextResponse.redirect(redirectUrl);
    }
  }

  // No code parameter, redirect to login
  const redirectUrl = new URL('/login', requestUrl.origin);
  redirectUrl.searchParams.set('error', 'no_code');
  return NextResponse.redirect(redirectUrl);
}