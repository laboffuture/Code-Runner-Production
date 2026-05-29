'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Trophy, Clock, Users, Zap, Calendar, ChevronLeft, Lock, Star } from 'lucide-react';
import FloatingParticles from '@/components/ui/FloatingParticles';

type ContestStatus = 'active' | 'upcoming' | 'ended';

interface Contest {
  _id: string;
  title: string;
  description: string;
  status: ContestStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  ageGroup: string;
  maxParticipants?: number;
  participantCount: number;
  problems: { problemId: number; points: number }[];
}

function formatCountdown(targetMs: number): string {
  const diff = targetMs - Date.now();
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_MAP: Record<string, { label: string; bg: string; dot: string }> = {
  active:   { label: 'LIVE',     bg: '#22c55e', dot: 'animate-pulse' },
  upcoming: { label: 'UPCOMING', bg: '#f59e0b', dot: '' },
  ended:    { label: 'ENDED',    bg: '#6b7280', dot: '' },
  draft:    { label: 'DRAFT',    bg: '#6b7280', dot: '' },
};

const TABS: { key: ContestStatus; label: string }[] = [
  { key: 'active',   label: 'LIVE' },
  { key: 'upcoming', label: 'UPCOMING' },
  { key: 'ended',    label: 'PAST' },
];

function ContestCard({ contest, theme }: { contest: Contest; theme: any }) {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const tick = () => {
      if (contest.status === 'upcoming') setCountdown(formatCountdown(new Date(contest.startTime).getTime()));
      else if (contest.status === 'active') setCountdown(formatCountdown(new Date(contest.endTime).getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [contest]);

  const cfg = STATUS_MAP[contest.status] || STATUS_MAP.ended;

  return (
    <Link href={`/contest/${contest._id}`}>
      <div
        className="bg-white border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer"
        style={{ borderColor: `${theme.colors.light}66` }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.colors.primary; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${theme.colors.light}66`; }}
      >
        {/* Status + age group */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-orbitron font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: cfg.bg }}
            >
              <span className={`w-1.5 h-1.5 rounded-full bg-white ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <span
            className="text-xs font-orbitron px-2 py-1 rounded border"
            style={{ color: theme.colors.primary, borderColor: `${theme.colors.light}66`, backgroundColor: `${theme.colors.light}11` }}
          >
            {contest.ageGroup === 'all' ? 'ALL AGES' : `AGES ${contest.ageGroup}`}
          </span>
        </div>

        {/* Title + description */}
        <h3 className="text-lg font-orbitron font-black text-gray-900 mb-2 tracking-wide">
          {contest.title}
        </h3>
        <p className="text-sm font-rajdhani text-gray-500 mb-5 line-clamp-2">
          {contest.description}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Trophy,   label: 'PROBLEMS',  value: String(contest.problems?.length ?? 0) },
            { icon: Clock,    label: 'DURATION',  value: `${contest.durationMinutes} min` },
            { icon: Users,    label: 'JOINED',    value: `${contest.participantCount}${contest.maxParticipants ? `/${contest.maxParticipants}` : ''}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center p-3 rounded-lg bg-gray-50 border" style={{ borderColor: `${theme.colors.light}55` }}>
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: theme.colors.primary }} />
              <div className="text-base font-orbitron font-black" style={{ color: theme.colors.primary }}>{value}</div>
              <div className="text-xs font-rajdhani text-gray-400 tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Footer: date + countdown */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${theme.colors.light}33` }}>
          <span className="flex items-center gap-1.5 text-xs font-rajdhani text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {contest.status === 'ended'
              ? `Ended ${formatDate(contest.endTime)}`
              : `Starts ${formatDate(contest.startTime)}`}
          </span>
          {(contest.status === 'active' || contest.status === 'upcoming') && countdown && (
            <span className="flex items-center gap-1.5 text-xs font-orbitron font-bold" style={{ color: cfg.bg }}>
              <Zap className="w-3 h-3" />
              {contest.status === 'active' ? `Ends in ${countdown}` : `Starts in ${countdown}`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ContestListPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<ContestStatus>('active');
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);


  const fetchContests = useCallback(async (status: ContestStatus, pg: number) => {
    setLoading(true);
    try {
      const data: any = await api.contests.list({ status, page: pg });
      setContests(pg === 1 ? data.contests : prev => [...prev, ...data.contests]);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setContests([]);
    fetchContests(activeTab, 1);
  }, [activeTab, fetchContests]);

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
      {/* Floating particles */}
      <FloatingParticles color={theme.colors.primary} />

      <div className="relative z-10">
        <Header />

        <main className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 shrink-0"
              style={{
                border: `1.5px solid ${theme.colors.light}99`,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-orbitron font-black mb-2 tracking-wider text-white flex items-center gap-3">
                <Trophy className="w-8 h-8" style={{ color: theme.colors.primary }} />
                CONTEST ARENA
              </h1>
              <p className="font-rajdhani text-gray-200">
                Compete live, climb the leaderboard, and earn contest rating
              </p>
            </div>
          </div>

          {/* Login notice */}
          {!isAuthenticated && (
            <div className="bg-white border-2 rounded-xl p-4 mb-6 flex items-center gap-3"
              style={{ borderColor: `${theme.colors.light}99` }}>
              <Lock className="w-5 h-5 shrink-0" style={{ color: theme.colors.primary }} />
              <p className="font-rajdhani text-gray-700">
                <Link href="/login" className="font-orbitron font-bold underline" style={{ color: theme.colors.primary }}>
                  Sign in
                </Link>{' '}
                to register for contests and track your contest rating.
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white border-2 rounded-xl p-1 mb-6 grid grid-cols-3"
            style={{ borderColor: `${theme.colors.light}99` }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="py-2.5 rounded-lg text-sm font-orbitron font-bold tracking-widest transition-all duration-200"
                style={activeTab === tab.key
                  ? { backgroundColor: theme.colors.primary, color: '#ffffff' }
                  : { color: theme.colors.primary }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contest list */}
          {loading && contests.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: `${theme.colors.primary}30` }} />
                  <div className="absolute inset-0 border-2 border-transparent border-t-[--accent] rounded-full animate-spin"
                    style={{ borderTopColor: theme.colors.primary }} />
                </div>
                <p className="font-rajdhani text-gray-200 animate-pulse">Loading contests...</p>
              </div>
            </div>
          ) : contests.length === 0 ? (
            <div className="bg-white border-2 rounded-xl p-16 text-center" style={{ borderColor: `${theme.colors.light}99` }}>
              <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: `${theme.colors.primary}40` }} />
              <h3 className="text-xl font-orbitron font-bold text-gray-400 mb-2">NO CONTESTS FOUND</h3>
              <p className="font-rajdhani text-gray-400">
                {activeTab === 'active' ? 'No live contests right now. Check back soon!' :
                 activeTab === 'upcoming' ? 'No upcoming contests scheduled yet.' :
                 'No past contests available.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {contests.map(c => (
                  <ContestCard key={c._id} contest={c} theme={theme} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    className="px-8 py-3 font-orbitron font-bold text-sm rounded-xl border-2 text-white transition-all hover:opacity-80"
                    style={{ borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}22` }}
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchContests(activeTab, next);
                    }}
                  >
                    LOAD MORE
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
