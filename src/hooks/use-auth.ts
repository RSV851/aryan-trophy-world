'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

export function useAuth({ requireAuth = true }: { requireAuth?: boolean } = {}) {
  const { user, profile, isLoading, isAuthenticated, error, fetchSession, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check session on mount if not loaded
    fetchSession().then((authenticated) => {
      if (!authenticated && requireAuth) {
        router.push('/admin/login');
      }
    });
  }, [fetchSession, requireAuth, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    error,
    logout: handleLogout,
    refreshSession: fetchSession,
  };
}
