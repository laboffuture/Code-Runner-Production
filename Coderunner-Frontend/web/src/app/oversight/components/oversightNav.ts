import { LayoutGrid, Radar, Activity, ShieldCheck } from 'lucide-react';
import type { NavGroup, DashboardBrand } from '@/components/dashboard/dashboard-nav';

/** Owner oversight tier — same clean shell as the developer dashboard. */
export const OWNER_BRAND: DashboardBrand = {
  title: 'OVERSIGHT',
  subtitle: 'owner',
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
