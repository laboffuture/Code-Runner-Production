'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProblemChart } from '@/components/profile/ProblemChart';
import { ActivityCalendar } from '@/components/profile/ActivityCalendar';
import { ChevronLeft, Loader2, Check, X } from 'lucide-react';

// Full static class strings (Tailwind can't see interpolated color names).
const TOPIC_COLORS = {
  emerald: { bar: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700' },
  amber: { bar: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700' },
  rose: { bar: 'bg-rose-500', chip: 'bg-rose-100 text-rose-700' },
} as const;

function topicTier(pct: number): keyof typeof TOPIC_COLORS {
  return pct >= 80 ? 'emerald' : pct >= 40 ? 'amber' : 'rose';
}

function diffPill(difficulty: string): string {
  const d = (difficulty || '').toLowerCase();
  if (d === 'hard') return 'bg-rose-100 text-rose-700';
  if (d === 'medium') return 'bg-amber-100 text-amber-700';
  if (d === 'intro') return 'bg-sky-100 text-sky-700';
  return 'bg-emerald-100 text-emerald-700';
}

function relTime(ts: string | null): string {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

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

            {/* Topic progress — weak areas first so gaps stand out */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="font-orbitron text-sm font-bold text-gray-900 tracking-wider">
                  TOPIC PROGRESS
                </h2>
                <div className="flex items-center gap-3 text-[11px] font-rajdhani text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In progress
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Needs work
                  </span>
                </div>
              </div>
              {data.topicProgress?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...data.topicProgress]
                    .sort((a: any, b: any) => a.percentage - b.percentage)
                    .map((t: any, i: number) => {
                      const c = TOPIC_COLORS[topicTier(t.percentage)];
                      return (
                        <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50/60">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <span className="font-rajdhani font-bold text-gray-800 truncate">{t.topic}</span>
                            <span className={`text-[10px] font-orbitron px-2 py-0.5 rounded-full ${c.chip}`}>
                              {t.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${c.bar}`} style={{ width: `${t.percentage}%` }} />
                          </div>
                          <div className="mt-1.5 text-xs text-gray-500 font-fira">
                            {t.solved} / {t.total} solved
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-gray-400 font-rajdhani text-sm">No topic activity yet.</p>
              )}
            </div>

            {/* Recent activity — timeline of solve/fail outcomes */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="font-orbitron text-sm font-bold text-gray-900 tracking-wider mb-5">
                RECENT ACTIVITY
              </h2>
              {data.recentActivity?.length ? (
                <ul className="space-y-2">
                  {data.recentActivity.slice(0, 20).map((a: any, i: number) => {
                    const ok = a.status === 'ACCEPTED';
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50/70 transition-colors"
                      >
                        <span
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            ok ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-rajdhani font-bold text-gray-800 truncate">
                            {a.problemTitle || `Problem ${a.problemId}`}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-fira mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded ${diffPill(a.difficulty)}`}>
                              {a.difficulty}
                            </span>
                            <span>{relTime(a.timestamp)}</span>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-orbitron font-bold ${
                            ok ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {ok ? 'SOLVED' : 'FAILED'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
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
