import { LayoutGrid, Radar, Activity, ShieldCheck } from 'lucide-react';
import type { NavGroup, DashboardBrand } from '@/components/dashboard/dashboard-nav';

/**
 * Admin tier (role: 'admin') — the top oversight tier; same clean shell as the
 * developer dashboard. Developer and Admin are two separate tiers.
 */
export const ADMIN_BRAND: DashboardBrand = {
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
