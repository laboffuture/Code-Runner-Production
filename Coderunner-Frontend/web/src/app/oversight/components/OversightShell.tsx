'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OVERSIGHT_NAV, OWNER_BRAND } from './oversightNav';

/**
 * Client boundary for the oversight (owner) dashboard chrome — mirrors AdminShell
 * so the nav icons are imported on the client side, not passed across the
 * Server→Client boundary.
 */
export function OversightShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout brand={OWNER_BRAND} groups={OVERSIGHT_NAV} rootLabel="Oversight">
      {children}
    </DashboardLayout>
  );
}
