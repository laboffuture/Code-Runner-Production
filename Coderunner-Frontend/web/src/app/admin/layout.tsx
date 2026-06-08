import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminShell } from './components/AdminShell';

export const metadata: Metadata = {
  title: 'Developer Dashboard | Code Runner',
  description: 'Infrastructure monitoring and metrics (developer access only)',
};

/**
 * Shell for the entire /admin/* (developer) area: developer-role gate + the
 * shared dashboard chrome (rendered via the AdminShell client boundary).
 */
export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireRole="developer">
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
