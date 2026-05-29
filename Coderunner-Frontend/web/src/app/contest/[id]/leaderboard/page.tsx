'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Trophy, ChevronLeft, RefreshCw, CheckCircle, X,
  Crown, Medal, Star, Users
} from 'lucide-react';
import FloatingParticles from '@/components/ui/FloatingParticles';

interface EntryProblem {
  problemId: number;
  accepted: boolean;
  attempts: number;
  score: number;
  timeFromStart: number;
}
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalScore: number;
  penaltyTime: number;
  solvedCount: number;
  ratingDelta: number | null;
  problems: EntryProblem[];
}
interface LeaderboardData {
  contestId: string;
  title: string;
  status: string;
  leaderboard: LeaderboardEntry[];
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const getRankIcon = (rank: number, primaryColor: string) => {
  if (rank === 1) return <Crown className="w-6 h-6" style={{ color: '#ffd700' }} />;
  if (rank === 2) return <Trophy className="w-6 h-6" style={{ color: '#c0c0c0' }} />;
  if (rank === 3) return <Medal className="w-6 h-6" style={{ color: '#cd7f32' }} />;
  return <span className="text-lg font-orbitron font-bold" style={{ color: '#9ca3af' }}>#{rank}</span>;
};

export default function ContestLeaderboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [problemIds, setProblemIds] = useState<number[]>([]);


  const load = useCallback(async () => {
    try {
      const d: any = await api.contests.getLeaderboard(params.id);
      setData(d);
      if (d.leaderboard.length > 0) {
        setProblemIds(d.leaderboard[0].problems.map((p: EntryProblem) => p.problemId));
      }
      setLastRefresh(new Date());
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s if live
  useEffect(() => {
    if (data?.status !== 'active') return;
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [data?.status, load]);

  const myEntry = data?.leaderboard.find(e => e.username === user?.username || e.userId === user?.id);

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

        <main className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.push(`/contest/${params.id}`)}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 shrink-0"
              style={{ border: `1.5px solid ${theme.colors.light}99`, backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-orbitron font-black mb-2 tracking-wider text-white flex items-center gap-3">
                <Trophy className="w-8 h-8" style={{ color: theme.colors.primary }} />
                {data?.title ? `${data.title} — STANDINGS` : 'LEADERBOARD'}
              </h1>
              <p className="font-rajdhani text-gray-200">
                {data?.status === 'active'
                  ? 'Live standings · Auto-refreshes every 30 seconds'
                  : 'Final contest standings'}
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all disabled:opacity-50"
              style={{ border: `1.5px solid ${theme.colors.light}99`, backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-rajdhani">Refresh</span>
            </button>
          </div>

          {/* My Standing card */}
          {myEntry && (
            <div className="bg-white border-2 rounded-xl p-6 mb-6" style={{ borderColor: theme.colors.primary }}>
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5" style={{ color: theme.colors.primary }} />
                <h3 className="font-orbitron font-bold text-gray-900 tracking-wider">YOUR STANDING</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'RANK',    value: `#${myEntry.rank}` },
                  { label: 'SCORE',   value: String(myEntry.totalScore) },
                  { label: 'SOLVED',  value: `${myEntry.solvedCount}/${problemIds.length}` },
                  { label: 'PENALTY', value: myEntry.penaltyTime > 0 ? formatTime(myEntry.penaltyTime) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-4 rounded-lg bg-gray-50 border" style={{ borderColor: `${theme.colors.light}55` }}>
                    <div className="text-2xl font-orbitron font-black" style={{ color: theme.colors.primary }}>{value}</div>
                    <div className="text-xs font-rajdhani text-gray-400 tracking-widest mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {data?.status === 'ended' && myEntry.ratingDelta !== null && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-rajdhani text-gray-500">Contest Rating Change:</span>
                  <span className={`font-orbitron font-black text-lg ${myEntry.ratingDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {myEntry.ratingDelta >= 0 ? '+' : ''}{myEntry.ratingDelta}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Main leaderboard */}
          {loading && !data ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: `${theme.colors.primary}30` }} />
                  <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin"
                    style={{ borderTopColor: theme.colors.primary }} />
                </div>
                <p className="font-rajdhani text-gray-200 animate-pulse">Loading standings...</p>
              </div>
            </div>
          ) : !data || data.leaderboard.length === 0 ? (
            <div className="bg-white border-2 rounded-xl p-16 text-center" style={{ borderColor: `${theme.colors.light}99` }}>
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: `${theme.colors.primary}40` }} />
              <h3 className="text-xl font-orbitron font-bold text-gray-400 mb-2">NO PARTICIPANTS YET</h3>
              <p className="font-rajdhani text-gray-400">Be the first to compete in this contest!</p>
            </div>
          ) : (
            <div className="bg-white border-2 rounded-xl p-6" style={{ borderColor: `${theme.colors.light}99` }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" style={{ color: theme.colors.primary }} />
                  <h3 className="font-orbitron font-bold text-gray-900 tracking-wider">GLOBAL STANDINGS</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-orbitron border rounded-full px-3 py-1"
                    style={{ color: theme.colors.primary, borderColor: `${theme.colors.light}66`, backgroundColor: `${theme.colors.light}11` }}
                  >
                    {data.leaderboard.length} PARTICIPANTS
                  </span>
                  {data.status === 'active' && (
                    <span className="text-xs font-orbitron font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#22c55e' }}>
                      LIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {data.leaderboard.map((entry, idx) => {
                  const isMe = entry.username === user?.username || entry.userId === user?.id;
                  return (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-300"
                      style={{
                        backgroundColor: isMe ? `${theme.colors.light}1a` : '#f9fafb',
                        borderColor: isMe ? theme.colors.primary : `${theme.colors.light}55`,
                        boxShadow: isMe ? `0 4px 12px ${theme.colors.primary}22` : 'none',
                      }}
                    >
                      {/* Rank icon */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank, theme.colors.primary)}
                      </div>

                      {/* Avatar placeholder */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-orbitron font-black text-lg text-white shrink-0"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        {entry.username.charAt(0).toUpperCase()}
                      </div>

                      {/* Username + stats */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-orbitron font-bold text-gray-900 truncate">
                            {entry.username}
                          </h3>
                          {isMe && (
                            <span className="text-xs font-orbitron font-bold px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: theme.colors.primary }}>(YOU)</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4" style={{ color: theme.colors.primary }} />
                            <span className="font-rajdhani text-gray-500">Score:</span>
                            <span className="font-orbitron font-bold" style={{ color: theme.colors.primary }}>{entry.totalScore}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-rajdhani text-gray-500">Solved:</span>
                            <span className="font-orbitron font-bold text-green-600">{entry.solvedCount}/{problemIds.length}</span>
                          </div>
                          <div className="flex items-center gap-1.5 hidden md:flex">
                            <span className="font-rajdhani text-gray-500">Penalty:</span>
                            <span className="font-orbitron font-bold text-gray-600">
                              {entry.penaltyTime > 0 ? formatTime(entry.penaltyTime) : '—'}
                            </span>
                          </div>
                          {data.status === 'ended' && entry.ratingDelta !== null && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-rajdhani text-gray-500">Rating:</span>
                              <span className={`font-orbitron font-bold ${entry.ratingDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {entry.ratingDelta >= 0 ? '+' : ''}{entry.ratingDelta}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Per-problem breakdown (desktop) */}
                      <div className="hidden lg:flex items-center gap-2">
                        {problemIds.map((pid, pi) => {
                          const ep = entry.problems.find(p => p.problemId === pid);
                          return (
                            <div key={pid} className="text-center min-w-[48px]">
                              <div className="text-xs font-orbitron text-gray-400 mb-1">P{pi + 1}</div>
                              {ep?.accepted ? (
                                <div>
                                  <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                  <div className="text-xs font-orbitron font-bold" style={{ color: theme.colors.primary }}>{ep.score}</div>
                                </div>
                              ) : ep && ep.attempts > 0 ? (
                                <div>
                                  <X className="w-4 h-4 text-red-400 mx-auto" />
                                  <div className="text-xs text-gray-400 font-rajdhani">{ep.attempts}×</div>
                                </div>
                              ) : (
                                <div className="text-gray-300 text-lg font-rajdhani">—</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Last refresh */}
              <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: `${theme.colors.light}33` }}>
                <p className="text-xs font-rajdhani text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                  {data.status === 'active' && ' · Auto-refreshes every 30s'}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
