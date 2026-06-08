'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ADMIN_NAV, DEV_BRAND } from './adminNav';

/**
 * Client boundary for the developer-dashboard chrome. Owns the nav-config import
 * so the lucide icon components never cross a Server→Client boundary as props
 * (which Next.js forbids). The server layout renders this around the page.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout brand={DEV_BRAND} groups={ADMIN_NAV} rootLabel="Developer">
      {children}
    </DashboardLayout>
  );
}
