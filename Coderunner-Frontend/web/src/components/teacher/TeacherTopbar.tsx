'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const LABELS: Record<string, string> = {
  '/teacher': 'My Classrooms',
  '/teacher/curriculum': 'Answer Guide',
  '/teacher/inbox': 'Inbox',
  '/teacher/settings': 'Settings',
};

/** Best-effort label for routes not in the static map (classroom/student detail pages). */
function resolveLabel(pathname: string): string {
  if (LABELS[pathname]) return LABELS[pathname];
  if (pathname.startsWith('/teacher/classrooms/')) return 'Classroom';
  if (pathname.startsWith('/teacher/students/')) return 'Student';
  return 'My Classrooms';
}

export function TeacherTopbar() {
  const pathname = usePathname();
  const label = resolveLabel(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E7DFCF] bg-white/90 px-6 backdrop-blur">
      <div className="flex items-center gap-1.5 text-sm">
        <span className="font-orbitron font-bold uppercase tracking-wider text-gray-400">Classroom</span>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <span className="font-orbitron font-bold uppercase tracking-wider text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#0F766E] animate-pulse" />
        <span className="font-orbitron text-[11px] font-bold uppercase tracking-widest text-gray-500">Classroom Access</span>
      </div>
    </header>
  );
}
