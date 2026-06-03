'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LayoutGrid, LogOut, Hash, BookOpen } from 'lucide-react';

function navCls(active: boolean) {
  return `flex items-center gap-3 px-5 py-2.5 text-sm font-rajdhani transition-colors ${
    active ? 'bg-indigo-500/15 text-white border-r-2 border-indigo-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
  }`;
}

export function TeacherShell({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-60 bg-[#0b1020] flex flex-col z-40">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <GraduationCap className="w-6 h-6 text-indigo-400" />
          <span className="font-orbitron font-black tracking-wider text-white">CLASSROOM</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <Link href="/teacher" className={navCls(pathname === '/teacher')}>
            <LayoutGrid className="w-4 h-4" /> My Classrooms
          </Link>

          <Link href="/teacher/curriculum" className={navCls(pathname === '/teacher/curriculum')}>
            <BookOpen className="w-4 h-4" /> Answer Guide
          </Link>

          {classes.length > 0 && (
            <div className="px-5 mt-5 mb-2 text-[10px] font-orbitron tracking-[0.2em] text-gray-500">CLASSES</div>
          )}
          {classes.map((c) => (
            <Link key={c.id} href={`/teacher/classrooms/${c.id}`} className={navCls(!!pathname?.includes(c.id))}>
              <Hash className="w-4 h-4 shrink-0" /> <span className="truncate">{c.name}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="text-xs font-rajdhani text-gray-400 mb-2 truncate">{user?.username || 'Teacher'}</div>
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
