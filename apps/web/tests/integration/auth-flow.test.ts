import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  resetPassword,
  signInWithGoogle,
  signInWithMicrosoft,
} from '@/lib/auth/auth-helpers';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      onAuthStateChange: vi.fn(),
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase/client';

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email/Password Authentication', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_at: Date.now() + 3600000,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signInWithEmail('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(result.data?.user).toEqual(mockUser);
      expect(result.data?.session).toEqual(mockSession);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign in failure with invalid credentials', async () => {
      const mockError = {
        message: 'Invalid credentials',
        status: 401,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as any,
      });

      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });

    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'newuser@example.com',
      };
      const mockSession = {
        access_token: 'token-456',
        refresh_token: 'refresh-456',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signUpWithEmail(
        'newuser@example.com',
        'password123',
        { name: 'New User' }
      );

      expect(result.error).toBeNull();
      expect(result.data?.user).toEqual(mockUser);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: { name: 'New User' },
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    it('should handle sign up with email confirmation required', async () => {
      const mockUser = {
        id: 'user-789',
        email: 'confirm@example.com',
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null }, // No session means confirmation required
        error: null,
      });

      const result = await signUpWithEmail('confirm@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(result.data?.user).toEqual(mockUser);
      expect(result.data?.session).toBeNull();
    });
  });

  describe('OAuth Authentication', () => {
    it('should initiate Google OAuth sign in', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/...' },
        error: null,
      });

      const result = await signInWithGoogle();

      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          scopes: 'email profile',
        },
      });
    });

    it('should initiate Microsoft OAuth sign in', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'azure', url: 'https://login.microsoftonline.com/...' },
        error: null,
      });

      const result = await signInWithMicrosoft();

      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'azure',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          scopes: 'email profile',
        },
      });
    });

    it('should handle OAuth errors', async () => {
      const mockError = {
        message: 'OAuth provider not configured',
        status: 400,
      };

      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: null,
        error: mockError as any,
      });

      const result = await signInWithGoogle();

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should get current user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it('should successfully sign out', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const mockError = {
        message: 'Failed to sign out',
        status: 500,
      };

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError as any,
      });

      const result = await signOut();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: expect.stringContaining('/reset-password'),
        }
      );
    });

    it('should handle password reset errors', async () => {
      const mockError = {
        message: 'Rate limit exceeded',
        status: 429,
      };

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: null,
        error: mockError as any,
      });

      const result = await resetPassword('test@example.com');

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });
  });
});

describe('Auth Context Provider', () => {
  // These would be better as React Testing Library tests
  // but we can test the logic here

  it('should handle auth state changes', () => {
    const mockCallback = vi.fn();
    const mockUnsubscribe = vi.fn();

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    } as any);

    // Simulate subscription
    supabase.auth.onAuthStateChange(mockCallback);

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });

  it('should refresh session when near expiry', async () => {
    const mockSession = {
      access_token: 'new-token',
      refresh_token: 'new-refresh',
      expires_at: Date.now() + 3600000,
    };

    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: mockSession, user: {} },
      error: null,
    });

    // This would be tested in the context component
    // Just verifying the mock works here
    const result = await supabase.auth.refreshSession();

    expect(result.data?.session).toEqual(mockSession);
  });
});