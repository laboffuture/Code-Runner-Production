'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Trophy, Clock, Users, Calendar, ChevronLeft,
  Play, Lock, CheckCircle, BarChart2, Star, Zap
} from 'lucide-react';
import FloatingParticles from '@/components/ui/FloatingParticles';

interface ContestProblem { problemId: number; points: number; title: string; difficulty: string; }
interface Contest {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'upcoming' | 'active' | 'ended';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  ageGroup: string;
  maxParticipants?: number;
  participantCount: number;
  createdBy?: string;
  problems: ContestProblem[];
}

const DIFF_COLOR: Record<string, string> = {
  easy: '#22c55e', intro: '#22c55e', medium: '#f59e0b', hard: '#ef4444',
};
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active:   { label: 'LIVE',     color: '#22c55e' },
  upcoming: { label: 'UPCOMING', color: '#f59e0b' },
  ended:    { label: 'ENDED',    color: '#6b7280' },
  draft:    { label: 'DRAFT',    color: '#6b7280' },
};

function formatCountdown(ms: number) {
  const diff = ms - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ContestLobbyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [contest, setContest] = useState<Contest | null>(null);
  const [myEntry, setMyEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [countdown, setCountdown] = useState('');


  useEffect(() => { loadContest(); }, [params.id]);
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    api.contests.getMyEntry(params.id).then((d: any) => setMyEntry(d)).catch(() => {});
  }, [isAuthenticated, authLoading, params.id]);

  useEffect(() => {
    if (!contest) return;
    const tick = () => {
      if (contest.status === 'upcoming') setCountdown(formatCountdown(new Date(contest.startTime).getTime()));
      else if (contest.status === 'active') setCountdown(formatCountdown(new Date(contest.endTime).getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [contest]);

  async function loadContest() {
    try {
      const data: any = await api.contests.getById(params.id);
      setContest(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleRegister() {
    if (!isAuthenticated) { router.push('/login'); return; }
    setRegistering(true);
    try {
      await api.contests.register(params.id);
      await loadContest();
      const d: any = await api.contests.getMyEntry(params.id);
      setMyEntry(d);
    } catch (e: any) {
      alert(e?.message || 'Registration failed');
    } finally { setRegistering(false); }
  }

  const isRegistered = myEntry?.registered === true;
  const statusCfg = contest ? (STATUS_MAP[contest.status] ?? { label: contest.status.toUpperCase(), color: '#6b7280' }) : null;

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${theme.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <FloatingParticles color={theme.colors.primary} />

      <div className="relative z-10">
        <Header />

        <main className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Page header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.push('/contest')}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 shrink-0"
              style={{ border: `1.5px solid ${theme.colors.light}99`, backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-orbitron font-black mb-1 tracking-wider text-white flex items-center gap-3">
                <Trophy className="w-8 h-8" style={{ color: theme.colors.primary }} />
                {loading ? 'LOADING...' : (contest?.title?.toUpperCase() ?? 'CONTEST')}
              </h1>
              <p className="font-rajdhani text-gray-200">Contest details and problem set</p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: `${theme.colors.primary}30` }} />
                  <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin"
                    style={{ borderTopColor: theme.colors.primary }} />
                </div>
                <p className="font-rajdhani text-gray-200 animate-pulse">Loading contest...</p>
              </div>
            </div>
          )}

          {!loading && !contest && (
            <div className="bg-white border-2 rounded-xl p-16 text-center" style={{ borderColor: `${theme.colors.light}99` }}>
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: `${theme.colors.primary}40` }} />
              <h3 className="text-xl font-orbitron font-bold text-gray-400 mb-2">CONTEST NOT FOUND</h3>
              <p className="font-rajdhani text-gray-400">This contest may have been removed.</p>
              <Link href="/contest" className="mt-4 inline-block font-orbitron text-sm underline" style={{ color: theme.colors.primary }}>
                Back to Contests
              </Link>
            </div>
          )}

          {!loading && contest && statusCfg && (
            <div className="space-y-6">
              {/* Hero card */}
              <div className="bg-white border-2 rounded-xl p-8" style={{ borderColor: `${theme.colors.light}99` }}>
                {/* Status + age */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-orbitron font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ backgroundColor: statusCfg.color }}>
                    {statusCfg.label}
                  </span>
                  <span className="text-xs font-orbitron text-gray-500 border rounded px-2 py-1"
                    style={{ borderColor: `${theme.colors.light}66` }}>
                    {contest.ageGroup === 'all' ? 'ALL AGES' : `AGES ${contest.ageGroup}`}
                  </span>
                  {contest.createdBy && (
                    <span className="text-xs font-rajdhani text-gray-400 ml-auto">by {contest.createdBy}</span>
                  )}
                </div>

                <h2 className="text-2xl font-orbitron font-black text-gray-900 tracking-wide mb-3">{contest.title}</h2>
                <p className="font-rajdhani text-gray-600 leading-relaxed mb-8">{contest.description}</p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { icon: Clock,    label: 'DURATION',    value: `${contest.durationMinutes} min` },
                    { icon: Users,    label: 'REGISTERED',  value: `${contest.participantCount}${contest.maxParticipants ? `/${contest.maxParticipants}` : ''}` },
                    { icon: Trophy,   label: 'PROBLEMS',    value: String(contest.problems.length) },
                    { icon: Calendar, label: contest.status === 'ended' ? 'ENDED' : contest.status === 'active' ? 'ENDS' : 'STARTS',
                      value: new Date(contest.status === 'ended' ? contest.endTime : contest.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center p-4 rounded-lg bg-gray-50 border" style={{ borderColor: `${theme.colors.light}55` }}>
                      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: theme.colors.primary }} />
                      <div className="text-xl font-orbitron font-black" style={{ color: theme.colors.primary }}>{value}</div>
                      <div className="text-xs font-rajdhani text-gray-400 tracking-widest mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Countdown */}
                {(contest.status === 'active' || contest.status === 'upcoming') && countdown && (
                  <div className="text-center py-6 mb-8 rounded-xl border-2"
                    style={{ borderColor: `${theme.colors.light}55`, backgroundColor: `${theme.colors.primary}08` }}>
                    <p className="text-xs font-orbitron tracking-widest mb-2" style={{ color: theme.colors.primary }}>
                      {contest.status === 'active' ? 'TIME REMAINING' : 'STARTS IN'}
                    </p>
                    <div className="text-5xl font-orbitron font-black tracking-widest" style={{ color: theme.colors.primary }}>
                      {countdown}
                    </div>
                  </div>
                )}

                {/* CTA row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Enter Arena (registered + active) */}
                  {contest.status === 'active' && isRegistered && (
                    <button
                      onClick={() => router.push(`/contest/${params.id}/arena`)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-orbitron font-bold text-sm text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                      ENTER ARENA
                    </button>
                  )}

                  {/* Join (not registered + active/upcoming) */}
                  {(contest.status === 'active' || contest.status === 'upcoming') && !isRegistered && (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-orbitron font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {!isAuthenticated && <Lock className="w-4 h-4" />}
                      {registering ? 'REGISTERING...' : !isAuthenticated ? 'LOGIN TO REGISTER' : 'REGISTER'}
                    </button>
                  )}

                  {/* Registered but not yet started */}
                  {contest.status === 'upcoming' && isRegistered && (
                    <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-orbitron font-bold text-sm border-2"
                      style={{ borderColor: '#22c55e', color: '#22c55e', backgroundColor: '#22c55e0f' }}>
                      <CheckCircle className="w-4 h-4" />
                      REGISTERED — WAIT FOR START
                    </div>
                  )}

                  {/* Leaderboard */}
                  <Link
                    href={`/contest/${params.id}/leaderboard`}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm border-2 font-orbitron font-bold transition-all hover:opacity-80"
                    style={{ borderColor: `${theme.colors.light}99`, color: theme.colors.primary }}
                  >
                    <BarChart2 className="w-4 h-4" />
                    LEADERBOARD
                  </Link>
                </div>

                {/* My score */}
                {isRegistered && myEntry && myEntry.totalScore > 0 && (
                  <div className="mt-4 p-4 rounded-xl flex items-center justify-between border"
                    style={{ borderColor: `${theme.colors.light}55`, backgroundColor: `${theme.colors.primary}08` }}>
                    <div>
                      <div className="text-xs font-orbitron tracking-widest text-gray-500">YOUR SCORE</div>
                      <div className="text-2xl font-orbitron font-black" style={{ color: theme.colors.primary }}>
                        {myEntry.totalScore}
                      </div>
                    </div>
                    <Zap className="w-8 h-8 opacity-20" style={{ color: theme.colors.primary }} />
                  </div>
                )}
              </div>

              {/* Problem list card */}
              <div className="bg-white border-2 rounded-xl overflow-hidden" style={{ borderColor: `${theme.colors.light}99` }}>
                <div className="px-8 py-5 border-b flex items-center gap-3" style={{ borderColor: `${theme.colors.light}44` }}>
                  <Trophy className="w-5 h-5" style={{ color: theme.colors.primary }} />
                  <h2 className="font-orbitron font-black text-gray-900 tracking-wider">PROBLEM SET</h2>
                  <span className="ml-auto text-xs font-rajdhani text-gray-400">{contest.problems.length} problems</span>
                </div>

                {contest.problems.map((p, i) => {
                  const solved = myEntry?.problems?.find((ep: any) => ep.problemId === p.problemId)?.accepted;
                  const diff = (p.difficulty || 'easy').toLowerCase();
                  return (
                    <div
                      key={p.problemId}
                      className="flex items-center justify-between px-8 py-5 border-b last:border-b-0 transition-colors"
                      style={{
                        borderColor: `${theme.colors.light}22`,
                        backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${theme.colors.primary}08`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = i % 2 === 0 ? '#fff' : '#fafafa'; }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg font-orbitron font-black text-sm text-white"
                          style={{ backgroundColor: theme.colors.primary }}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-orbitron font-bold text-gray-900">{p.title || `Problem ${p.problemId}`}</div>
                          <div className="text-xs font-rajdhani mt-0.5 capitalize" style={{ color: DIFF_COLOR[diff] || '#6b7280' }}>
                            {p.difficulty || 'Easy'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {solved && <CheckCircle className="w-5 h-5 text-green-500" />}
                        <div className="text-right">
                          <div className="flex items-center gap-1 font-orbitron font-black" style={{ color: theme.colors.primary }}>
                            <Star className="w-3.5 h-3.5" />
                            {p.points}
                          </div>
                          <div className="text-xs font-rajdhani text-gray-400">points</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
