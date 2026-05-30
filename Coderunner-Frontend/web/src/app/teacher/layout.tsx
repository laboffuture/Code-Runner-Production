import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TeacherShell } from '@/components/teacher/TeacherShell';

export const metadata: Metadata = {
  title: 'Classroom | Code Runner',
  description: 'Teacher classroom insight (teacher access only)',
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole teacher area to teacher-role accounts, inside the shared
  // sidebar shell.
  return (
    <ProtectedRoute requireRole="teacher">
      <TeacherShell>{children}</TeacherShell>
    </ProtectedRoute>
  );
}
