'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { demoAuth, isDemoMode } from '@/lib/demo/auth';

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    if (isDemoMode()) {
      // In demo mode, sync sessionStorage with cookies
      const user = demoAuth.getUser();
      if (user.data.user) {
        // Set cookie for server-side auth checks
        document.cookie = `demo_user=${JSON.stringify({
          id: user.data.user.id,
          email: user.data.user.email,
          name: 'Li Rong',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })}; path=/`;
      }
    }
  }, []);

  const signOut = async () => {
    if (isDemoMode()) {
      await demoAuth.signOut();
      document.cookie = 'demo_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      router.push('/login');
    } else {
      // Handle Supabase signout
      router.push('/api/auth/signout');
    }
  };

  return { signOut };
} 