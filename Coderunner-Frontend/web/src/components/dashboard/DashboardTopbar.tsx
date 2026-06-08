'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { findNavItem, type NavGroup } from './dashboard-nav';

/**
 * Shared slim top bar: a breadcrumb that names the current page (resolved from
 * the nav config) plus an access indicator. Page content renders below it.
 */
export function DashboardTopbar({
  groups,
  rootLabel,
}: {
  groups: NavGroup[];
  rootLabel: string;
}) {
  const pathname = usePathname();
  const current = findNavItem(groups, pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b-2 border-gray-200 bg-white/90 px-6 backdrop-blur">
      <div className="flex items-center gap-1.5 text-sm">
        {/* Matched route: "Root › Page". Unmatched route (e.g. a detail page
            with no nav entry): just the root label, instead of "… › Console". */}
        <span
          className={`font-orbitron font-bold uppercase tracking-wider ${
            current ? 'text-gray-400' : 'text-gray-900'
          }`}
        >
          {rootLabel}
        </span>
        {current && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="font-orbitron font-bold uppercase tracking-wider text-gray-900">
              {current.label}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#76B900] animate-pulse" />
        <span className="font-orbitron text-[11px] font-bold uppercase tracking-widest text-gray-500">
          {rootLabel} Access
        </span>
      </div>
    </header>
  );
}
