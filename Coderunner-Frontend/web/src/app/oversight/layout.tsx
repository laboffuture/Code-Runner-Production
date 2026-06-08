import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OversightShell } from './components/OversightShell';

/**
 * Shell for the entire /oversight/* (admin) area — admin-role gate + the same
 * shared dashboard chrome as the developer dashboard (via OversightShell).
 */
export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="admin">
      <OversightShell>{children}</OversightShell>
    </ProtectedRoute>
  );
}
