'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as signOutHelper,
  signInWithGoogle,
  signInWithMicrosoft,
  getCurrentUser,
  getCurrentSession,
  resetPassword,
  subscribeToAuthChanges,
  refreshSession,
} from '@/lib/auth/auth-helpers';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, string | number | boolean>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMicrosoft: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
const SESSION_REFRESH_TIME = 10 * 60 * 1000; // 10 minutes before expiry

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const currentSession = await getCurrentSession();
        const currentUser = await getCurrentUser();

        if (mounted) {
          setSession(currentSession);
          setUser(currentUser);
        }
      } catch (err) {
        if (mounted) {
          console.error('Auth initialization error:', err);
          setError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth changes
    const subscription = subscribeToAuthChanges((user, session) => {
      if (mounted) {
        setUser(user);
        setSession(session);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshSessionHandler = useCallback(async () => {
    try {
      const { data, error } = await refreshSession();

      if (error) {
        throw error;
      }

      if (data) {
        setSession(data.session);
        setUser(data.user);
      }
    } catch (err: unknown) {
      console.error('Session refresh failed:', err);
      setError('Session refresh failed');
    }
  }, []);

  // Session refresh and expiry warning
  useEffect(() => {
    if (!session) return;

    const checkSession = () => {
      const expiresAt = new Date(session.expires_at || 0);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();

      // Show warning when 5 minutes left
      if (timeUntilExpiry <= SESSION_WARNING_TIME && timeUntilExpiry > 0) {
        console.warn(
          `Session expiring in ${Math.round(timeUntilExpiry / 1000)} seconds`
        );
      }

      // Auto-refresh when 10 minutes left
      if (timeUntilExpiry <= SESSION_REFRESH_TIME && timeUntilExpiry > 0) {
        refreshSessionHandler();
      }
    };

    // Check immediately
    checkSession();

    // Check every minute
    const interval = setInterval(checkSession, 60 * 1000);

    return () => clearInterval(interval);
  }, [session, refreshSessionHandler]);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        throw error;
      }

      if (data) {
        setUser(data.user);
        setSession(data.session);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: Record<string, string | number | boolean>
    ) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await signUpWithEmail(email, password, metadata);

        if (error) {
          throw error;
        }

        if (data?.user && data?.session) {
          setUser(data.user);
          setSession(data.session);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to sign up';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signOutHelper();

      if (error) {
        throw error;
      }

      setUser(null);
      setSession(null);

      // Broadcast logout to all tabs
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('supabase.auth.logout', Date.now().toString());
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const microsoftSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithMicrosoft();

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Microsoft';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const passwordReset = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send password reset email';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen for logout events from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.logout' && e.newValue) {
        setUser(null);
        setSession(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      signInWithGoogle: googleSignIn,
      signInWithMicrosoft: microsoftSignIn,
      resetPassword: passwordReset,
      refreshSession: refreshSessionHandler,
      clearError,
    }),
    [
      user,
      session,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      googleSignIn,
      microsoftSignIn,
      passwordReset,
      refreshSessionHandler,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};