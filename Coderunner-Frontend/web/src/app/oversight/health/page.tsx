import { StudentHealthPanel } from '../components/StudentHealthPanel';
import { TeacherHealthPanel } from '../components/TeacherHealthPanel';
import { DeveloperHealthPanel } from '../components/DeveloperHealthPanel';

// The /oversight layout gates this subtree to owner-role accounts, so no
// ProtectedRoute wrapper is needed here.
export default function OversightHealthPage() {
  return (
    <div className="p-6 space-y-6">
      <StudentHealthPanel />
      <TeacherHealthPanel />
      <DeveloperHealthPanel />
    </div>
  );
}
