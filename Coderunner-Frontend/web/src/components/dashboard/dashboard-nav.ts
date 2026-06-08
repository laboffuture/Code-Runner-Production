import type { LucideIcon } from 'lucide-react';

/** One destination in a dashboard sidebar. */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path, not nested routes. Use for a bare-root href
   *  (e.g. "/teacher") that is a string-prefix of every sibling page and would
   *  otherwise highlight on all of them. */
  exact?: boolean;
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
 * Whether `href` is the active route for `pathname`: an exact match, or (unless
 * `exact`) a parent of a nested route — segment-boundary aware, so `/admin/api`
 * does NOT match `/admin/apikeys`. Shared by the sidebar and the topbar so their
 * active-state logic can never diverge.
 */
export function isActive(href: string, pathname: string, exact = false): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

/**
 * Resolve the nav item for the current path — exact match first, then the
 * longest matching prefix so nested routes still highlight their parent.
 * (Items flagged `exact` match only their own path.) Returns undefined when
 * nothing matches (e.g. a detail page with no nav entry).
 */
export function findNavItem(groups: NavGroup[], pathname: string): NavItem | undefined {
  const all = groups.flatMap((g) => g.items);
  return (
    all.find((i) => i.href === pathname) ??
    all
      .filter((i) => isActive(i.href, pathname, i.exact))
      .sort((a, b) => b.href.length - a.href.length)[0]
  );
}
