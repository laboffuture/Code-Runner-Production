'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isActive, type NavGroup, type DashboardBrand } from './dashboard-nav';

/**
 * Shared dashboard sidebar (developer + oversight). Grouped vertical nav driven
 * by props, brand on top, logout pinned to the bottom. The active item is
 * marked with the dashboard `#76B900` accent.
 */
export function DashboardSidebar({
  brand,
  groups,
}: {
  brand: DashboardBrand;
  groups: NavGroup[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const BrandIcon = brand.icon;

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r-2 border-gray-200 bg-white">
      {/* Brand */}
      <Link
        href={brand.href}
        className="flex items-center gap-3 border-b-2 border-gray-200 px-5 py-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#76B900]/10 ring-1 ring-[#76B900]/20">
          <BrandIcon className="h-5 w-5 text-[#76B900]" />
        </div>
        <div className="leading-tight">
          <p className="font-orbitron text-sm font-black tracking-wider text-gray-900">{brand.title}</p>
          <p className="font-fira text-[11px] text-gray-500">{brand.subtitle}</p>
        </div>
      </Link>

      {/* Grouped navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} className="mb-5">
            {group.label && (
              <p className="px-3 pb-2 font-orbitron text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#76B900]/10 text-[#76B900]'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-[#76B900]" />
                      )}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-[#76B900]' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t-2 border-gray-200 p-3">
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
