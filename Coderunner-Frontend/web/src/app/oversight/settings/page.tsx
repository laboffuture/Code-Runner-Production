import { ChangePasswordCard } from '@/components/account/ChangePasswordCard';

// The /oversight layout gates this subtree to admin-role accounts and provides
// the shell, so this page only renders content.
export default function OversightSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <ChangePasswordCard />
    </div>
  );
}
