'use client';

import { Loader2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { PanelIcon } from './PanelIcon';

/**
 * Shared content-panel card for the admin/oversight dashboard. White surface,
 * gray-200 border, and the `#76B900` icon chip — the same look as the developer
 * dashboard cards — so the oversight health panels render to one style gate.
 * Handles the common loading / error / empty states so panels don't re-implement
 * them. (The developer-dashboard pages still inline their own chrome today; they
 * can migrate onto this later.)
 */
export function PanelCard({
  icon,
  title,
  isLoading = false,
  error = null,
  loadingLabel = 'Loading…',
  isEmpty = false,
  emptyIcon: EmptyIcon,
  emptyLabel = 'Nothing here yet',
  className = '',
  children,
}: {
  icon: LucideIcon;
  title: string;
  isLoading?: boolean;
  error?: string | null;
  loadingLabel?: string;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`bg-white border-2 border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <PanelIcon icon={icon} />
        <h2 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">{title}</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#76B900]" />
            <p className="text-sm text-gray-500 font-rajdhani">{loadingLabel}</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 font-rajdhani">{error}</p>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-12">
          {EmptyIcon ? <EmptyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" /> : null}
          <p className="text-gray-500 font-rajdhani">{emptyLabel}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
