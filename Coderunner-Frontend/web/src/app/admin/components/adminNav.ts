// Developer-dashboard navigation + brand. Consumed by the shared DashboardLayout
// (DashboardSidebar + DashboardTopbar) through the /admin layout. Add a page once
// here and it appears in both the sidebar and the topbar breadcrumb.

import {
  LayoutDashboard, Database, HardDrive, Package, Cpu, ListChecks,
  Network, Activity, Globe, Cloud, AlertTriangle, Ticket, Store, Terminal, Settings,
} from 'lucide-react';
import type { NavGroup, DashboardBrand } from '@/components/dashboard/dashboard-nav';

export const DEV_BRAND: DashboardBrand = {
  title: 'DEVELOPER',
  subtitle: 'console',
  icon: Terminal,
  href: '/admin/dashboard',
};

export const ADMIN_NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { href: '/admin/mongodb', label: 'MongoDB', icon: Database },
      { href: '/admin/redis', label: 'Redis', icon: HardDrive },
      { href: '/admin/docker', label: 'Docker', icon: Package },
      { href: '/admin/runners', label: 'Runners', icon: Cpu },
      { href: '/admin/queues', label: 'Queues', icon: ListChecks },
      { href: '/admin/nginx', label: 'Nginx', icon: Network },
    ],
  },
  {
    label: 'Application',
    items: [
      { href: '/admin/api', label: 'API', icon: Activity },
      { href: '/admin/frontend', label: 'Frontend', icon: Globe },
      { href: '/admin/cloudinary', label: 'Cloudinary', icon: Cloud },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/errors', label: 'Errors', icon: AlertTriangle },
      { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
      // Previously orphaned (no nav entry) — restored here.
      { href: '/admin/store', label: 'Store', icon: Store },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];
