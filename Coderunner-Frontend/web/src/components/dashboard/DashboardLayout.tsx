'use client';

import type { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import type { NavGroup, DashboardBrand } from './dashboard-nav';

/**
 * Shared shell for the developer (/admin) and oversight (/owner) dashboards:
 * sidebar + topbar defined once, page content slotted into <main>. Rendered from
 * each area's client shell (AdminShell / OversightShell), which supplies the
 * brand + nav groups — so the lucide icon components stay on the client side and
 * never cross a Server→Client boundary as props.
 */
export function DashboardLayout({
  brand,
  groups,
  rootLabel,
  children,
}: {
  brand: DashboardBrand;
  groups: NavGroup[];
  rootLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar brand={brand} groups={groups} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar groups={groups} rootLabel={rootLabel} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
