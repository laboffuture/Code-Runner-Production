'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Restrict to a specific role (e.g. 'developer' for the monitoring
   *  dashboard, 'teacher' for the classroom area). Omit for any logged-in user. */
  requireRole?: 'student' | 'teacher' | 'developer';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const roleOk = !requireRole || user?.role === requireRole;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not authenticated - redirect to login
      router.push(redirectTo);
    } else if (!isLoading && !roleOk) {
      // Authenticated but wrong role for this area — send to the root router, which
      // dispatches by role (developer→/admin/dashboard, teacher→/teacher, student→
      // student flow). Hardcoding /home dumped staff into the student app.
      router.push('/');
    }
  }, [isAuthenticated, isLoading, roleOk, redirectTo, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#011C40]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#91D2D9]"></div>
          <p className="mt-4 text-[#91D2D9] font-orbitron">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or insufficient permissions
  if (!isAuthenticated || !roleOk) {
    return null;
  }

  // Authenticated and authorized
  return <>{children}</>;
}
