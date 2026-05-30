'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LogOut, RefreshCw, Loader2 } from 'lucide-react';

interface StudentRow {
  userId: string;
  username: string;
  age_group: string;
  level: number;
  rank: string;
  totalSolved: number;
  solvedToday: number;
  totalSubmissions: number;
  acceptanceRate: number;
  currentStreak: number;
  lastActive: string | null;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
      <div className="text-3xl font-orbitron font-black text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-rajdhani mt-1">{label}</div>
    </div>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { logout } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.teacher.getStudents()) as { students: StudentRow[] };
      setStudents(data.students || []);
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
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Students" value={students.length} />
            <SummaryCard label="Solved Today" value={students.reduce((s, x) => s + x.solvedToday, 0)} />
            <SummaryCard label="On a Streak" value={students.filter((x) => x.currentStreak > 0).length} />
            <SummaryCard label="Total Solved" value={students.reduce((s, x) => s + x.totalSolved, 0)} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-rajdhani">{error}</div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-rajdhani">No students yet.</div>
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
                    className="border-b border-gray-100 hover:bg-indigo-50/40 transition-colors font-rajdhani"
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
      </main>
    </div>
  );
}
