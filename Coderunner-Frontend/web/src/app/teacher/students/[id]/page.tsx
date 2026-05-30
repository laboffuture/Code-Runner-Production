'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProblemChart } from '@/components/profile/ProblemChart';
import { ActivityCalendar } from '@/components/profile/ActivityCalendar';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function StudentDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await api.teacher.getStudent(id);
        if (active) setData(d);
      } catch {
        if (active) setError('Failed to load student.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/teacher')}
            className="p-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 text-gray-700"
            title="Back to classroom"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider">
              {data?.username || 'STUDENT'}
            </h1>
            <p className="text-sm text-gray-600 font-fira">
              Student insight{data?.age_group ? ` · ${data.age_group}` : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-rajdhani">{error}</div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-3 h-full">
                <ProfileStats data={data} section="identity" />
              </div>
              <div className="xl:col-span-9 h-full">
                <ProblemChart data={data} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-3">
                <ProfileStats data={data} section="progress" />
              </div>
              <div className="xl:col-span-9">
                <ActivityCalendar data={data} />
              </div>
            </div>

            {/* Topic progress — where the student is progressing / stuck */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="font-orbitron text-sm font-bold text-gray-900 tracking-wider mb-4">
                TOPIC PROGRESS
              </h2>
              {data.topicProgress?.length ? (
                <div className="space-y-3">
                  {data.topicProgress.map((t: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm font-rajdhani mb-1">
                        <span className="text-gray-700">{t.topic}</span>
                        <span className="text-gray-500">
                          {t.solved}/{t.total} ({t.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${t.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-rajdhani text-sm">No topic activity yet.</p>
              )}
            </div>

            {/* Recent activity — run/submit outcomes per problem */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="font-orbitron text-sm font-bold text-gray-900 tracking-wider mb-4">
                RECENT ACTIVITY
              </h2>
              {data.recentActivity?.length ? (
                <div className="divide-y divide-gray-100">
                  {data.recentActivity.slice(0, 15).map((a: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 font-rajdhani text-sm"
                    >
                      <span className="text-gray-800">
                        {a.problemTitle || `Problem ${a.problemId}`}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-gray-400">{a.difficulty}</span>
                        <span className={a.status === 'ACCEPTED' ? 'text-green-600 font-bold' : 'text-red-500'}>
                          {a.status}
                        </span>
                        <span className="text-gray-400 text-xs font-fira">
                          {a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-rajdhani text-sm">No recent activity.</p>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
