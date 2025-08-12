import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { signupRateLimiter } from '@/lib/auth/rate-limiter';

export async function POST(request: Request) {
  try {
    const { email, password, metadata } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting by IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    if (!signupRateLimiter.check(ip)) {
      const retryAfter = Math.ceil(signupRateLimiter.getTimeUntilReset(ip) / 1000);
      return NextResponse.json(
        { 
          error: 'Too many signup attempts. Please try again later.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return NextResponse.json({
        user: data.user,
        message: 'Please check your email to confirm your account',
        requiresEmailConfirmation: true,
      });
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}