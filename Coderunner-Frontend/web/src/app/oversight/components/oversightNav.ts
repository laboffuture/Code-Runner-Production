import { LayoutGrid, Radar, Activity, ShieldCheck } from 'lucide-react';
import type { NavGroup, DashboardBrand } from '@/components/dashboard/dashboard-nav';

/**
 * Admin tier — the same clean shell as the developer dashboard.
 * NOTE: this is a VISIBLE LABEL only. The underlying role string stays 'owner'
 * (auth identity + the `requireRole="owner"` route gate); we only display it as
 * "Admin". Developer and Admin are two separate tiers.
 */
export const OWNER_BRAND: DashboardBrand = {
  title: 'ADMIN',
  subtitle: 'console',
  icon: ShieldCheck,
  href: '/oversight/dashboard',
};

export const OVERSIGHT_NAV: NavGroup[] = [
  {
    items: [
      { href: '/oversight/dashboard', label: 'Groups', icon: LayoutGrid },
      { href: '/oversight/tickets', label: 'Accountability', icon: Radar },
      { href: '/oversight/health', label: 'Health', icon: Activity },
    ],
  },
];
