import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Classroom | Code Runner',
  description: 'Teacher classroom insight (teacher access only)',
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole teacher area to teacher-role accounts (matches the
  // teacher-gated backend routes).
  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedRoute requireRole="teacher">{children}</ProtectedRoute>
    </div>
  );
}
