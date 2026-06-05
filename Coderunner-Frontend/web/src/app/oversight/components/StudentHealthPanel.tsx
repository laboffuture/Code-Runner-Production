'use client';

import { useEffect, useState } from 'react';
import { Loader2, HeartPulse } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';

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

function Chip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex-1 rounded-xl px-4 py-3 text-center"
      style={{ backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
    >
      <p className="text-2xl font-orbitron font-black" style={{ color }}>{value}</p>
      <p className="text-[10px] font-orbitron tracking-widest mt-1" style={{ color }}>{label}</p>
    </div>
  );
}

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
    <Card className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <HeartPulse className="w-6 h-6 text-indigo-500" />
        <h2 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">Student Health</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-sm text-gray-500 font-rajdhani">Loading student health...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 font-rajdhani">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-6">
            <Chip label="ACTIVE" value={buckets.active} color={BUCKET_COLOR.active} />
            <Chip label="QUIET" value={buckets.quiet} color={BUCKET_COLOR.quiet} />
            <Chip label="SILENT" value={buckets.silent} color={BUCKET_COLOR.silent} />
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
                      <td className="py-3 pr-4 font-rajdhani text-gray-700">{Math.round(s.acceptanceRate)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
