
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // First-time users must finish onboarding (character selection) before
      // entering the app, otherwise they land with no character chosen.
      if (user && !user.onboardingComplete) {
        router.push('/onboarding');
        return;
      }

      // User is authenticated - check if they've booted this session
      const sessionBooted = sessionStorage.getItem('sessionBooted');
      if (sessionBooted) {
        // Already booted this session, go straight to home
        router.push('/home');
      } else {
        // Need to boot first
        router.push('/boot');
      }
    } else {
      // Not authenticated, go to login
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-green-400 text-center font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
      </div>
    </div>
  );
}
