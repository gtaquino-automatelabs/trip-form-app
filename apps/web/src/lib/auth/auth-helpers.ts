import { supabase } from '@/lib/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse<{ user: User; session: Session }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email profile',
    },
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signInWithMicrosoft(): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email profile',
    },
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updatePassword(
  newPassword: string
): Promise<AuthResponse<User>> {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { data: null, error };
  }

  return { data: data.user, error: null };
}

export async function refreshSession(): Promise<
  AuthResponse<{ session: Session | null; user: User | null }>
> {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export function subscribeToAuthChanges(
  callback: (user: User | null, session: Session | null) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });

  return subscription;
}