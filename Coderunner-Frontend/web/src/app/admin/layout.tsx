import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Developer Dashboard | Code Runner',
  description: 'Infrastructure monitoring and metrics (developer access only)',
};

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the entire monitoring area to developer-role accounts. This is the
  // single front-end access control for all /admin/* pages (the matching
  // backend routes are also developer-gated).
  return (
    <div className="min-h-screen bg-white">
      <ProtectedRoute requireRole="developer">{children}</ProtectedRoute>
    </div>
  );
}
