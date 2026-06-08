import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OversightShell } from './components/OversightShell';

/**
 * Shell for the entire /oversight/* (owner) area — owner-role gate + the same
 * shared dashboard chrome as the developer dashboard (via OversightShell).
 */
export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="owner">
      <OversightShell>{children}</OversightShell>
    </ProtectedRoute>
  );
}
