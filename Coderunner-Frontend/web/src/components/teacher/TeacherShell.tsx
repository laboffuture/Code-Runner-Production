'use client';

import { TeacherSidebar } from './TeacherSidebar';
import { TeacherTopbar } from './TeacherTopbar';

/**
 * Teacher-area chrome — a dedicated cream-toned shell (not the shared
 * developer/oversight DashboardLayout). Kept separate deliberately: this
 * palette and layout are specific to the teacher redesign and shouldn't
 * change how /admin or /oversight look.
 */
export function TeacherShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F3E9]">
      <TeacherSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TeacherTopbar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
