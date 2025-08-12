import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resetPasswordRateLimiter } from '@/lib/auth/rate-limiter';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting by email
    if (!resetPasswordRateLimiter.check(email)) {
      const retryAfter = Math.ceil(resetPasswordRateLimiter.getTimeUntilReset(email) / 1000);
      return NextResponse.json(
        { 
          error: 'Too many reset attempts. Please try again later.',
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.headers.get('origin')}/reset-password`,
    });

    if (error) {
      // Don't reveal if email exists or not
      console.error('Password reset error:', error);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}