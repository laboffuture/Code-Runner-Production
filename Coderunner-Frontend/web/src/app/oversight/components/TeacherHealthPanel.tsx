'use client';

import { useEffect, useState } from 'react';
import { Loader2, Users2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';

interface TeacherRow {
  id: string;
  username: string;
  classCount: number;
  lastReviewedAt: string | null;
  totalReviews: number;
  openDoubts: number;
}

const AMBER = '#d97706';

function formatDate(iso: string | null): string {
  if (!iso) return 'No reviews yet';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'No reviews yet';
  return new Date(t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function TeacherHealthPanel() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = (await api.oversight.getTeacherHealth()) as any;
        setTeachers(res.teachers || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch teacher health:', err);
        setError('Failed to load teacher health');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users2 className="w-6 h-6 text-indigo-500" />
        <h2 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">Teacher Health</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-sm text-gray-500 font-rajdhani">Loading teacher health...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 font-rajdhani">{error}</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12">
          <Users2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-rajdhani">No teachers yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-orbitron tracking-widest text-gray-500 border-b border-gray-200">
                <th className="py-3 pr-4">TEACHER</th>
                <th className="py-3 pr-4">CLASSES</th>
                <th className="py-3 pr-4">LAST REVIEWED</th>
                <th className="py-3 pr-4">REVIEWS</th>
                <th className="py-3 pr-4">OPEN DOUBTS</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 font-orbitron font-bold text-gray-900">{t.username}</td>
                  <td className="py-3 pr-4 font-rajdhani text-gray-700">{t.classCount}</td>
                  <td className="py-3 pr-4 font-rajdhani text-gray-700">{formatDate(t.lastReviewedAt)}</td>
                  <td className="py-3 pr-4 font-rajdhani text-gray-700">{t.totalReviews}</td>
                  <td className="py-3 pr-4">
                    {t.openDoubts > 0 ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-orbitron font-bold"
                        style={{ color: AMBER, backgroundColor: `${AMBER}1a`, border: `1px solid ${AMBER}55` }}
                      >
                        {t.openDoubts}
                      </span>
                    ) : (
                      <span className="font-rajdhani text-gray-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
