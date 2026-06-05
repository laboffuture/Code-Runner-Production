import { GroupsOverviewPanel } from '../components/GroupsOverviewPanel';

// The /oversight layout gates this subtree to owner-role accounts, so no
// ProtectedRoute wrapper is needed here.
export default function OversightDashboardPage() {
  return (
    <div className="p-6">
      <GroupsOverviewPanel />
    </div>
  );
}
