'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutGrid, BookOpen, Inbox, Hash } from 'lucide-react';
import { api } from '@/lib/api-client';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import type { NavGroup, DashboardBrand } from '@/components/dashboard/dashboard-nav';

const TEACHER_BRAND: DashboardBrand = {
  title: 'CLASSROOM',
  subtitle: 'teacher',
  icon: GraduationCap,
  href: '/teacher',
};

/**
 * Teacher-area chrome. Same shared white DashboardLayout as the developer/admin
 * dashboards (green #76B900 accent), but the nav is dynamic — it lists the
 * teacher's classrooms under a "Classes" group, refreshed on navigation.
 */
export function TeacherShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    api.teacher
      .getClassrooms()
      .then((d: any) => setClasses((d.classrooms || []).map((c: any) => ({ id: c.id, name: c.name }))))
      .catch(() => {});
  }, [pathname]);

  const groups: NavGroup[] = [
    {
      items: [
        // "/teacher" is exact: it's a prefix of every teacher page, so without
        // this it would stay highlighted on curriculum/inbox/classroom pages.
        { href: '/teacher', label: 'My Classrooms', icon: LayoutGrid, exact: true },
        { href: '/teacher/curriculum', label: 'Answer Guide', icon: BookOpen },
        { href: '/teacher/inbox', label: 'Inbox', icon: Inbox },
      ],
    },
    ...(classes.length > 0
      ? [
          {
            label: 'Classes',
            items: classes.map((c) => ({
              href: `/teacher/classrooms/${c.id}`,
              label: c.name,
              icon: Hash,
            })),
          },
        ]
      : []),
  ];

  return (
    <DashboardLayout brand={TEACHER_BRAND} groups={groups} rootLabel="Classroom">
      {children}
    </DashboardLayout>
  );
}
