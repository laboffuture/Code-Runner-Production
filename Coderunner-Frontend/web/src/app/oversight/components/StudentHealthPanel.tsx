'use client';

import { useEffect, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { api } from '@/lib/api-client';
import { formatAcceptanceRate } from '@/lib/format';
import { PanelCard } from '@/components/dashboard/PanelCard';
import { StatChip } from '@/components/dashboard/StatChip';

interface StudentRow {
  id: string;
  username: string;
  classroom: string | null;
  lastActive: string | null;
  bucket: 'active' | 'quiet' | 'silent';
  totalSolved: number;
  acceptanceRate: number;
}

interface Buckets {
  active: number;
  quiet: number;
  silent: number;
}

const BUCKET_COLOR: Record<StudentRow['bucket'], string> = {
  active: '#16a34a',
  quiet: '#d97706',
  silent: '#dc2626',
};

function BucketChip({ bucket }: { bucket: StudentRow['bucket'] }) {
  const color = BUCKET_COLOR[bucket];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-orbitron font-bold"
      style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
    >
      {bucket.toUpperCase()}
    </span>
  );
}

export function StudentHealthPanel() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [buckets, setBuckets] = useState<Buckets>({ active: 0, quiet: 0, silent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = (await api.oversight.getStudentHealth()) as any;
        setStudents(res.students || []);
        setBuckets(res.buckets || { active: 0, quiet: 0, silent: 0 });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch student health:', err);
        setError('Failed to load student health');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <PanelCard
      icon={HeartPulse}
      title="Student Health"
      isLoading={isLoading}
      error={error}
      loadingLabel="Loading student health..."
    >
      <div className="flex gap-3 mb-6">
        <StatChip label="ACTIVE" value={buckets.active} color={BUCKET_COLOR.active} />
        <StatChip label="QUIET" value={buckets.quiet} color={BUCKET_COLOR.quiet} />
        <StatChip label="SILENT" value={buckets.silent} color={BUCKET_COLOR.silent} />
      </div>

      {students.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 font-rajdhani">No students yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-orbitron tracking-widest text-gray-500 border-b border-gray-200">
                <th className="py-3 pr-4">STUDENT</th>
                <th className="py-3 pr-4">CLASSROOM</th>
                <th className="py-3 pr-4">STATUS</th>
                <th className="py-3 pr-4">SOLVED</th>
                <th className="py-3 pr-4">ACCEPTANCE</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 font-orbitron font-bold text-gray-900">{s.username}</td>
                  <td className="py-3 pr-4 font-rajdhani text-gray-700">{s.classroom || '—'}</td>
                  <td className="py-3 pr-4"><BucketChip bucket={s.bucket} /></td>
                  <td className="py-3 pr-4 font-rajdhani text-gray-700">{s.totalSolved}</td>
                  <td className="py-3 pr-4 font-rajdhani text-gray-700">{formatAcceptanceRate(s.acceptanceRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}
