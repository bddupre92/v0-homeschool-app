'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AuthGuard({ 
  children,
  requireAuth = true,
  redirectTo = '/login',
  redirectIfAuthenticated = false,
  redirectAuthenticatedTo = '/dashboard',
}: { 
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  redirectAuthenticatedTo?: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    } else if (redirectIfAuthenticated && isAuthenticated) {
      router.push(redirectAuthenticatedTo);
    }
  }, [
    isAuthenticated, 
    isLoading, 
    requireAuth, 
    redirectIfAuthenticated, 
    redirectTo, 
    redirectAuthenticatedTo, 
    router
  ]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
