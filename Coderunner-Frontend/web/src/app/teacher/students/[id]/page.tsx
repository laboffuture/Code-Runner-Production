'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProblemChart } from '@/components/profile/ProblemChart';
import { ActivityCalendar } from '@/components/profile/ActivityCalendar';
import { ChevronLeft, Loader2, Check, X, ShieldAlert } from 'lucide-react';
import { activeFlags, whyText, type AttemptRecord } from '@/lib/integrity';
import { ResetProgressDialog } from '@/components/teacher/ResetProgressDialog';
import { formatAcceptanceRate } from '@/lib/format';

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

function timeOnly(ts: string | null): string {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(ts: string | null): string {
  if (!ts) return 'Earlier';
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function groupByDay(items: any[]): Array<{ label: string; items: any[] }> {
  const groups: Record<string, any[]> = {};
  const order: string[] = [];
  for (const a of items) {
    const label = dayLabel(a.timestamp);
    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(a);
  }
  return order.map((label) => ({ label, items: groups[label] }));
}

export default function StudentDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [id, reloadKey]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
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
          {data && (
            <button
              onClick={() => setResetOpen(true)}
              className="ml-auto rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
            >
              Reset Progress
            </button>
          )}
        </div>
      </header>

      {resetOpen && data && (
        <ResetProgressDialog
          studentId={id}
          studentUsername={data.username}
          onClose={() => setResetOpen(false)}
          onComplete={() => { setResetOpen(false); setReloadKey((k) => k + 1); }}
        />
      )}

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-rajdhani">{error}</div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            {/* Teacher monitoring strip — surfaces the numbers a teacher actually
                asks: how far through the curriculum, and how much they struggled.
                FAILED SUBMITS = graded submissions that did not pass (totalSubmissions −
                acceptedSubmissions). FAILED RUNS = Run-button attempts that errored or
                timed out on a problem (stats.failedRuns) — practice struggle, not grading. */}
            {(() => {
              const s = data.stats || {};
              const failed = Math.max(0, (s.totalSubmissions ?? 0) - (s.acceptedSubmissions ?? 0));
              const cards = [
                { label: 'SESSIONS DONE', value: `${data.sessionsCompleted ?? 0} / ${data.sessionsTotal ?? 0}`, accent: 'text-indigo-600' },
                { label: 'ACCEPTANCE', value: formatAcceptanceRate(s.acceptanceRate), accent: 'text-emerald-600' },
                { label: 'SUBMISSIONS', value: s.totalSubmissions ?? 0, accent: 'text-gray-800' },
                { label: 'FAILED SUBMITS', value: failed, accent: 'text-rose-600' },
                { label: 'FAILED RUNS', value: s.failedRuns ?? 0, accent: 'text-amber-600' },
              ];
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {cards.map((c) => (
                    <div key={c.label} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                      <div className={`text-2xl font-orbitron font-black ${c.accent} leading-none`}>{c.value}</div>
                      <div className="mt-1 text-[11px] text-gray-500 font-rajdhani tracking-wider">{c.label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

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

            {/* Integrity signals — heuristics worth a look, never accusations */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <h2 className="font-orbitron text-sm font-bold text-gray-900 tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> INTEGRITY SIGNALS
                </h2>
                <span className="text-[11px] font-rajdhani text-gray-400">⚡ fast · 🔁 no iteration · 📋 large paste</span>
              </div>
              {(() => {
                const flagged = ((data.attempts || []) as AttemptRecord[]).filter(
                  (a) => activeFlags(a.flags).length > 0
                );
                return flagged.length ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {flagged.map((a, i) => (
                        <div key={i} className="border border-amber-100 bg-amber-50/50 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-rajdhani font-bold text-gray-800 truncate">
                              Problem {String(a.problemId)}
                            </span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              {activeFlags(a.flags).map((f) => (
                                <span key={f.key} title={f.hint} className="text-sm cursor-help">
                                  {f.icon}
                                </span>
                              ))}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {activeFlags(a.flags).map((f) => (
                              <span
                                key={f.key}
                                className="text-[10px] font-orbitron px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"
                              >
                                {f.label}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] text-gray-500 font-fira">{whyText(a)}</div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[11px] text-gray-400 font-rajdhani leading-relaxed">
                      These are heuristics, not proof. A fast typist, a genuinely easy problem, or pasting their
                      own earlier work all trip the same wires — use them to start a conversation, never to accuse.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400 font-rajdhani text-sm">No integrity signals on recent solves. 🎉</p>
                );
              })()}
            </div>

            {/* Recent activity — timeline of solve/fail outcomes */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="font-orbitron text-sm font-bold text-gray-900 tracking-wider mb-5">
                RECENT ACTIVITY
              </h2>
              {data.recentActivity?.length ? (
                <div className="space-y-6">
                  {groupByDay(data.recentActivity.slice(0, 30)).map((group) => (
                    <div key={group.label}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-orbitron text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                          {group.label}
                        </span>
                        <span className="h-px flex-1 bg-gray-100" />
                        <span className="text-[11px] font-fira text-gray-400">{group.items.length}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {group.items.map((a: any, i: number) => {
                          const ok = a.status === 'ACCEPTED';
                          return (
                            <li
                              key={i}
                              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <span
                                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                                  ok ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}
                              >
                                {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              </span>
                              <span className="font-rajdhani font-bold text-gray-800 truncate flex-1 min-w-0">
                                {a.problemTitle || `Problem ${a.problemId}`}
                              </span>
                              <span className={`shrink-0 text-[10px] font-fira px-1.5 py-0.5 rounded ${diffPill(a.difficulty)}`}>
                                {a.difficulty}
                              </span>
                              <span className="shrink-0 text-xs text-gray-400 font-fira w-14 text-right">
                                {timeOnly(a.timestamp)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
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
