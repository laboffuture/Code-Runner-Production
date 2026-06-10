'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useEmbedded } from '@/components/dashboard/useEmbedded';
import { ADMIN_NAV, DEV_BRAND } from './adminNav';

/**
 * Client boundary for the developer-dashboard chrome. Owns the nav-config import
 * so the lucide icon components never cross a Server→Client boundary as props
 * (which Next.js forbids). The server layout renders this around the page.
 *
 * Embedded mode: when shown inside the ADMIN-LINK hub iframe (or with ?embed=1),
 * the shared sidebar/topbar are dropped and only the page content renders — each
 * admin page provides its own min-h-screen background, so it stands alone. The
 * non-embedded render is unchanged.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const embedded = useEmbedded();

  if (embedded) return <>{children}</>;

  return (
    <DashboardLayout brand={DEV_BRAND} groups={ADMIN_NAV} rootLabel="Developer">
      {children}
    </DashboardLayout>
  );
}
