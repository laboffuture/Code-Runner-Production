import type { LucideIcon } from 'lucide-react';

/** One destination in a dashboard sidebar. */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** A labelled group of destinations. Omit `label` for a flat (ungrouped) list. */
export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/** Brand shown at the top of the sidebar. */
export interface DashboardBrand {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Where clicking the brand navigates (usually the dashboard home). */
  href: string;
}

/**
 * Whether `href` is the active route for `pathname`: an exact match, or a
 * parent of a nested route (segment-boundary aware, so `/admin/api` does NOT
 * match `/admin/apikeys`). Shared by the sidebar and the topbar so their
 * active-state logic can never diverge.
 */
export function isActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Resolve the nav item for the current path — exact match first, then the
 * longest matching prefix so nested routes still highlight their parent.
 */
export function findNavItem(groups: NavGroup[], pathname: string): NavItem | undefined {
  const all = groups.flatMap((g) => g.items);
  return (
    all.find((i) => i.href === pathname) ??
    all
      .filter((i) => isActive(i.href, pathname))
      .sort((a, b) => b.href.length - a.href.length)[0]
  );
}
