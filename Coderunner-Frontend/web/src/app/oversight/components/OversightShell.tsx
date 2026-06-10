'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useEmbedded } from '@/components/dashboard/useEmbedded';
import { OVERSIGHT_NAV, ADMIN_BRAND } from './oversightNav';

/**
 * Client boundary for the oversight (owner) dashboard chrome — mirrors AdminShell
 * so the nav icons are imported on the client side, not passed across the
 * Server→Client boundary.
 *
 * Embedded mode: when shown inside the ADMIN-LINK hub iframe (or with ?embed=1),
 * the shared sidebar/topbar are dropped and only the page content renders. Unlike
 * the developer pages, the oversight pages don't carry their own full-height
 * background, so the embedded branch supplies one (the chrome's `min-h-screen
 * bg-gray-50`) — otherwise the framed content would render with no backdrop.
 */
export function OversightShell({ children }: { children: React.ReactNode }) {
  const embedded = useEmbedded();

  if (embedded) return <div className="min-h-screen bg-gray-50">{children}</div>;

  return (
    <DashboardLayout brand={ADMIN_BRAND} groups={OVERSIGHT_NAV} rootLabel="Admin">
      {children}
    </DashboardLayout>
  );
}
