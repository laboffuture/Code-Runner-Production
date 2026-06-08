'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * The dashboard's `#76B900` icon chip — a green-tinted rounded square holding a
 * lucide icon. Matches the developer dashboard's header icon treatment; shared
 * so PanelCard and the multi-column panels render an identical chip.
 */
export function PanelIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#76B900]/10 ring-1 ring-[#76B900]/20">
      <Icon className="h-5 w-5 text-[#76B900]" />
    </div>
  );
}
