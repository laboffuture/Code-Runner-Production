import { ChangePasswordCard } from '@/components/account/ChangePasswordCard';

// The /admin layout gates this subtree to developer-role accounts and provides
// the shell, so this page only renders content.
export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <ChangePasswordCard />
    </div>
  );
}
