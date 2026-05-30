'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LogOut, RefreshCw, Loader2, Users, Flame, CheckCircle2, Trophy } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface StudentRow {
  userId: string;
  username: string;
  age_group: string;
  level: number;
  rank: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  solvedToday: number;
  totalSubmissions: number;
  acceptanceRate: number;
  currentStreak: number;
  lastActive: string | null;
}

interface Overview {
  solvedByDay: Array<{ date: string; daily: number; cumulative: number }>;
  difficulty: { easy: number; medium: number; hard: number };
  levelDistribution: Array<{ level: number; students: number }>;
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

export default function TeacherDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.teacher.getStudents()) as { students: StudentRow[]; overview: Overview };
      setStudents(data.students || []);
      setOverview(data.overview || null);
    } catch (e: any) {
      const msg = e?.message || '';
      setError(
        msg.includes('403') || msg.includes('401')
          ? 'Access denied. Teacher privileges required.'
          : 'Failed to load students.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : '—');
  const shortDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  };

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
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider">CLASSROOM</h1>
              <p className="text-sm text-gray-600 font-fira">Student progress &amp; insight</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStudents}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2 font-orbitron font-bold text-xs tracking-wider"
            >
              <RefreshCw className="w-4 h-4" /> REFRESH
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-4 py-2 rounded-lg border-2 border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-2 font-orbitron font-bold text-xs tracking-wider"
            >
              <LogOut className="w-4 h-4" /> LOGOUT
            </button>
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
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <SummaryCard label="Students" value={students.length} icon={Users} accent="bg-indigo-100 text-indigo-600" />
              <SummaryCard label="Solved Today" value={students.reduce((s, x) => s + x.solvedToday, 0)} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-600" />
              <SummaryCard label="On a Streak" value={students.filter((x) => x.currentStreak > 0).length} icon={Flame} accent="bg-amber-100 text-amber-600" />
              <SummaryCard label="Total Solved" value={students.reduce((s, x) => s + x.totalSolved, 0)} icon={Trophy} accent="bg-rose-100 text-rose-600" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
              <div className="xl:col-span-2">
                <ChartCard title="CLASS MOMENTUM · SOLVES (LAST 30 DAYS)">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={overview?.solvedByDay || []}>
                      <defs>
                        <linearGradient id="classMomentum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        labelFormatter={(l) => shortDate(String(l))}
                        contentStyle={{ borderRadius: 8, border: '2px solid #e5e7eb', fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="cumulative" name="Total solved" stroke="#6366f1" strokeWidth={2} fill="url(#classMomentum)" />
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

            {/* Level distribution */}
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

            {/* Roster */}
            {students.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-rajdhani">No students yet.</div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-100 bg-gray-50 text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">
                      <th className="px-5 py-4">STUDENT</th>
                      <th className="px-5 py-4">AGE</th>
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
                        onClick={() => router.push(`/teacher/students/${s.userId}`)}
                        className="border-b border-gray-100 hover:bg-indigo-50/40 transition-colors font-rajdhani cursor-pointer"
                      >
                        <td className="px-5 py-3 font-bold text-gray-900">{s.username}</td>
                        <td className="px-5 py-3 text-gray-500">{s.age_group}</td>
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
    </div>
  );
}
