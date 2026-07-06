import { ChangePasswordCard } from '@/components/account/ChangePasswordCard';

// The /teacher layout gates this subtree to teacher-role accounts and provides
// the shell, so this page only renders content.
export default function TeacherSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <ChangePasswordCard />
    </div>
  );
}
