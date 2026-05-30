'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import { ChevronLeft, Loader2, Users, Flame, CheckCircle2, Trophy, UserPlus, KeyRound, X } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface StudentRow {
  userId: string;
  username: string;
  age_group: string;
  level: number;
  totalSolved: number;
  solvedToday: number;
  acceptanceRate: number;
  currentStreak: number;
  lastActive: string | null;
}
interface Overview {
  solvedByDay: Array<{ date: string; daily: number; cumulative: number }>;
  difficulty: { easy: number; medium: number; hard: number };
  levelDistribution: Array<{ level: number; students: number }>;
}
interface ClassroomData {
  classroom: { id: string; name: string; age_group: string; joinCode: string };
  students: StudentRow[];
  overview: Overview;
}

const DIFF_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

function SummaryCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-orbitron font-black text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-500 font-rajdhani mt-1">{label}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="font-orbitron text-xs font-bold text-gray-500 tracking-[0.2em] mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ClassroomDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<ClassroomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = (await api.teacher.getClassroom(id)) as ClassroomData;
      setData(d);
    } catch {
      setError('Failed to load classroom.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (!selId) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    api.teacher
      .getStudent(selId)
      .then((d) => active && setDetail(d))
      .catch(() => active && setDetail(null))
      .finally(() => active && setDetailLoading(false));
    return () => {
      active = false;
    };
  }, [selId]);

  const addStudent = async () => {
    if (!addName.trim()) return;
    setAdding(true);
    setAddMsg(null);
    try {
      await api.teacher.addStudent(id, addName.trim());
      setAddName('');
      setAddOpen(false);
      await load();
    } catch (e: any) {
      setAddMsg(e?.message?.includes('404') ? 'No student with that username.' : 'Failed to add student.');
    } finally {
      setAdding(false);
    }
  };

  const students = data?.students || [];
  const overview = data?.overview;
  const shortDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  };
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : '—');
  const diffData = overview
    ? [
        { name: 'Easy', value: overview.difficulty.easy },
        { name: 'Medium', value: overview.difficulty.medium },
        { name: 'Hard', value: overview.difficulty.hard },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push('/teacher')}
              className="p-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 text-gray-700"
              title="Back to classrooms"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider truncate">
                {data?.classroom.name || 'CLASSROOM'}
              </h1>
              <p className="text-sm text-gray-600 font-fira flex items-center gap-2">
                Age {data?.classroom.age_group}
                {data?.classroom.joinCode && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <KeyRound className="w-3.5 h-3.5" /> Join code <span className="font-bold">{data.classroom.joinCode}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAddOpen((v) => !v)}
            className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 font-orbitron font-bold text-xs tracking-wider"
          >
            <UserPlus className="w-4 h-4" /> ADD STUDENT
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {addOpen && (
          <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Student username"
              className="flex-1 min-w-[200px] px-3 py-2 border-2 border-gray-200 rounded-lg font-rajdhani focus:border-indigo-400 outline-none"
            />
            <button
              onClick={addStudent}
              disabled={adding || !addName.trim()}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-orbitron font-bold text-xs tracking-wider"
            >
              {adding ? 'ADDING…' : 'ADD'}
            </button>
            {addMsg && <span className="text-sm text-red-500 font-rajdhani">{addMsg}</span>}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-rajdhani">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <SummaryCard label="Students" value={students.length} icon={Users} accent="bg-indigo-100 text-indigo-600" />
              <SummaryCard label="Solved Today" value={students.reduce((s, x) => s + x.solvedToday, 0)} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-600" />
              <SummaryCard label="On a Streak" value={students.filter((x) => x.currentStreak > 0).length} icon={Flame} accent="bg-amber-100 text-amber-600" />
              <SummaryCard label="Total Solved" value={students.reduce((s, x) => s + x.totalSolved, 0)} icon={Trophy} accent="bg-rose-100 text-rose-600" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
              <div className="xl:col-span-2">
                <ChartCard title="CLASS MOMENTUM · SOLVES (LAST 30 DAYS)">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={overview?.solvedByDay || []}>
                      <defs>
                        <linearGradient id="cm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip labelFormatter={(l) => shortDate(String(l))} contentStyle={{ borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 12 }} />
                      <Area type="monotone" dataKey="cumulative" name="Total solved" stroke="#6366f1" strokeWidth={2} fill="url(#cm)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <ChartCard title="DIFFICULTY SOLVED (CLASS)">
                {diffData.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={diffData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {diffData.map((_, i) => (
                          <Cell key={i} fill={DIFF_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-gray-400 font-rajdhani text-sm">No solves yet</div>
                )}
              </ChartCard>
            </div>

            <div className="mb-8">
              <ChartCard title="STUDENTS PER LEVEL">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={(overview?.levelDistribution || []).map((d) => ({ name: `L${d.level}`, students: d.students }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 12 }} />
                    <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-rajdhani">
                No students yet. Use <span className="font-bold text-indigo-600">ADD STUDENT</span> or share the join code.
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-100 bg-gray-50 text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">
                      <th className="px-5 py-4">STUDENT</th>
                      <th className="px-5 py-4">LEVEL</th>
                      <th className="px-5 py-4">SOLVED TODAY</th>
                      <th className="px-5 py-4">TOTAL SOLVED</th>
                      <th className="px-5 py-4">ACCEPTANCE</th>
                      <th className="px-5 py-4">STREAK</th>
                      <th className="px-5 py-4">LAST ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr
                        key={s.userId}
                        onClick={() => setSelId(s.userId)}
                        className={`border-b border-gray-100 hover:bg-indigo-50/40 transition-colors font-rajdhani cursor-pointer ${selId === s.userId ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="px-5 py-3 font-bold text-gray-900">{s.username}</td>
                        <td className="px-5 py-3 text-gray-700">L{s.level}</td>
                        <td className="px-5 py-3 text-gray-700">{s.solvedToday}</td>
                        <td className="px-5 py-3 font-bold text-indigo-600">{s.totalSolved}</td>
                        <td className="px-5 py-3 text-gray-700">{s.acceptanceRate}%</td>
                        <td className="px-5 py-3 text-gray-700">{s.currentStreak} 🔥</td>
                        <td className="px-5 py-3 text-gray-400 text-xs font-fira">{fmt(s.lastActive)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Master-detail: student slide-over */}
      {selId && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelId(null)} />
          <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="min-w-0">
                  <h2 className="font-orbitron font-black text-xl text-gray-900 truncate">{detail?.username || 'Student'}</h2>
                  <p className="text-xs text-gray-500 font-fira">{detail ? `Level ${detail.level} · ${detail.rank}` : ''}</p>
                </div>
                <button onClick={() => setSelId(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {detailLoading || !detail ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <div className="text-xl font-orbitron font-black text-indigo-600">{detail.stats?.totalSolved ?? 0}</div>
                      <div className="text-[11px] text-gray-500 font-rajdhani">Total solved</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <div className="text-xl font-orbitron font-black text-gray-900">{detail.stats?.acceptanceRate ?? 0}%</div>
                      <div className="text-[11px] text-gray-500 font-rajdhani">Acceptance</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <div className="text-xl font-orbitron font-black text-amber-600">{detail.streak?.current ?? 0} 🔥</div>
                      <div className="text-[11px] text-gray-500 font-rajdhani">Streak</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <div className="text-xl font-orbitron font-black text-gray-900">{detail.experience ?? 0}</div>
                      <div className="text-[11px] text-gray-500 font-rajdhani">XP</div>
                    </div>
                  </div>

                  <h3 className="font-orbitron text-[11px] font-bold text-gray-400 tracking-[0.2em] mb-2">WEAK AREAS</h3>
                  {(detail.topicProgress || []).length ? (
                    <div className="space-y-2 mb-6">
                      {[...detail.topicProgress]
                        .sort((a: any, b: any) => a.percentage - b.percentage)
                        .slice(0, 4)
                        .map((t: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs font-rajdhani mb-1">
                              <span className="text-gray-700 truncate pr-2">{t.topic}</span>
                              <span className="text-gray-400">{t.percentage}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${t.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-rajdhani mb-6">No topic activity yet.</p>
                  )}

                  <h3 className="font-orbitron text-[11px] font-bold text-gray-400 tracking-[0.2em] mb-2">RECENT</h3>
                  {(detail.recentActivity || []).length ? (
                    <ul className="space-y-1.5 mb-6">
                      {detail.recentActivity.slice(0, 6).map((a: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-rajdhani">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                          <span className="truncate flex-1 text-gray-700">{a.problemTitle || `Problem ${a.problemId}`}</span>
                          <span className="text-gray-400 shrink-0">{a.difficulty}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 font-rajdhani mb-6">No recent activity.</p>
                  )}

                  <Link
                    href={`/teacher/students/${selId}`}
                    className="block text-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-orbitron font-bold text-xs tracking-wider"
                  >
                    OPEN FULL PROFILE →
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
