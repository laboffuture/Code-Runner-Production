'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, LayoutGrid, Radar, LogOut } from 'lucide-react';

const NAV = [
  { href: '/oversight/dashboard', label: 'Groups', icon: LayoutGrid },
  { href: '/oversight/tickets', label: 'Accountability', icon: Radar },
];

function navCls(active: boolean) {
  return `flex items-center gap-3 px-5 py-2.5 text-sm font-rajdhani transition-colors ${
    active ? 'bg-indigo-500/15 text-white border-r-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
  }`;
}

export function OverviewShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-60 bg-[#0b1020] flex flex-col z-40">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span className="font-orbitron font-black tracking-wider text-white">OVERSIGHT</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={navCls(pathname === href)}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="text-xs font-rajdhani text-gray-400 mb-2 truncate">{user?.username || 'Owner'}</div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-300 hover:bg-red-500/10 font-orbitron text-xs tracking-wider transition-colors"
          >
            <LogOut className="w-4 h-4" /> LOGOUT
          </button>
        </div>
      </aside>

      <div className="ml-60 min-w-0">{children}</div>
    </div>
  );
}
