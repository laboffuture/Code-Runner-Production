'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, BookOpen, Inbox, Settings, Hash, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api-client';
import { isActive } from '@/components/dashboard/dashboard-nav';

const NAV_ITEMS = [
  { href: '/teacher', label: 'Teacher Dashboard', icon: LayoutGrid, exact: true },
  { href: '/teacher/curriculum', label: 'Answer Guide', icon: BookOpen },
  { href: '/teacher/inbox', label: 'Inbox', icon: Inbox },
  { href: '/teacher/settings', label: 'Settings', icon: Settings },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    api.teacher
      .getClassrooms()
      .then((d: any) => setClasses((d.classrooms || []).map((c: any) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, [pathname]);

  const initial = (user?.username || 'T').charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#E7DFCF] bg-white">
      {/* Brand */}
      <Link href="/teacher" className="flex items-center gap-3 border-b border-[#E7DFCF] px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F766E]/10 font-orbitron text-sm font-bold text-[#0F766E] ring-1 ring-[#0F766E]/20">
          {initial}
        </div>
        <div className="leading-tight">
          <p className="font-orbitron text-sm font-black tracking-wider text-gray-900">CLASSROOM</p>
          <p className="font-fira text-[11px] capitalize text-gray-500">{user?.role || 'Teacher'}</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, pathname, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#0F766E]' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {classes.length > 0 && (
          <div className="mt-6">
            <p className="px-3 pb-2 font-orbitron text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Classes</p>
            <ul className="space-y-1">
              {classes.map((c) => {
                const href = `/teacher/classrooms/${c.id}`;
                const active = isActive(href, pathname);
                return (
                  <li key={c.id}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active ? 'bg-[#0F766E]/10 text-[#0F766E]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Hash className={`h-4 w-4 shrink-0 ${active ? 'text-[#0F766E]' : 'text-gray-400'}`} />
                      <span className="truncate">{c.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-[#E7DFCF] p-3">
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
