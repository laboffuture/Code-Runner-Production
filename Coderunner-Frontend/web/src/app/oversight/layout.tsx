import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OverviewShell } from './components/OverviewShell';

export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="owner">
      <OverviewShell>{children}</OverviewShell>
    </ProtectedRoute>
  );
}
