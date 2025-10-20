'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader } from '@/components/loader';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallbackPath = '/login',
}: AuthGuardProps) {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuthorization() {
      // Wait for auth to initialize
      if (loading) {
        return;
      }

      // Check authentication requirement
      if (requireAuth && !session) {
        const redirectUrl = new URL(fallbackPath, window.location.origin);
        redirectUrl.searchParams.set('redirect', pathname);
        router.push(redirectUrl.toString());
        return;
      }

      // Check admin requirement
      if (requireAdmin && session) {
        try {
          const response = await fetch('/api/auth/check-role');
          const data = await response.json();

          if (data.role !== 'admin') {
            router.push('/my-requests');
            return;
          }
        } catch (error) {
          console.error('Failed to check admin role:', error);
          router.push('/my-requests');
          return;
        }
      }

      setIsAuthorized(true);
      setIsChecking(false);
    }

    checkAuthorization();
  }, [user, session, loading, requireAuth, requireAdmin, router, pathname, fallbackPath]);

  // Show session expiry countdown if less than 5 minutes
  useEffect(() => {
    if (!session) return;

    const checkExpiry = () => {
      const expiresAt = new Date(session.expires_at || 0);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      const minutesLeft = Math.floor(timeUntilExpiry / (1000 * 60));

      if (minutesLeft <= 5 && minutesLeft > 0) {
        // You could show a toast or modal here
        console.warn(`Session expiring in ${minutesLeft} minutes`);
      }
    };

    // Check immediately
    checkExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkExpiry, 30 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-sm text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}