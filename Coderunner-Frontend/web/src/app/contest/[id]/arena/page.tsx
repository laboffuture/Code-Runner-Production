'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CompilerUI } from '@/components/editor/CompilerUI';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Clock, BarChart2, ChevronLeft, CheckCircle, Star, Trophy } from 'lucide-react';

interface ContestProblem { problemId: number; points: number; title: string; difficulty: string; }
interface Contest {
  id: string;
  title: string;
  status: 'draft' | 'upcoming' | 'active' | 'ended';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  problems: ContestProblem[];
}

function formatCountdown(endMs: number) {
  const diff = endMs - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ContestArenaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, character, accentColor } = useTheme();

  const [contest, setContest] = useState<Contest | null>(null);
  const [myEntry, setMyEntry] = useState<any>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [problem, setProblem] = useState<any>(null);
  const [loadingContest, setLoadingContest] = useState(true);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  // Load contest
  useEffect(() => {
    async function load() {
      try {
        const data: any = await api.contests.getById(params.id);
        setContest(data);
        if (data.status !== 'active') router.replace(`/contest/${params.id}`);
      } finally { setLoadingContest(false); }
    }
    load();
  }, [params.id, router]);

  // Load my entry for solved status
  useEffect(() => {
    if (!isAuthenticated) return;
    api.contests.getMyEntry(params.id).then((d: any) => setMyEntry(d)).catch(() => {});
  }, [isAuthenticated, params.id]);

  // Load selected problem
  useEffect(() => {
    if (!contest || !contest.problems[selectedIdx]) return;
    const pid = contest.problems[selectedIdx].problemId;
    setLoadingProblem(true);
    api.problems.getById(pid).then((d: any) => setProblem(d)).catch(() => setProblem(null)).finally(() => setLoadingProblem(false));
  }, [contest, selectedIdx]);

  // Countdown timer
  useEffect(() => {
    if (!contest) return;
    const tick = () => setCountdown(formatCountdown(new Date(contest.endTime).getTime()));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [contest]);

  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const accent = accentColor || theme.colors.primary;

  // Time color: red if < 5 min, yellow if < 10 min, green otherwise
  const endMs = contest ? new Date(contest.endTime).getTime() : 0;
  const remaining = endMs - Date.now();
  const timeColor = remaining < 300_000 ? '#ef4444' : remaining < 600_000 ? '#f59e0b' : '#22c55e';

  // Background that matches the compiler theme
  const colorBg = [
    `radial-gradient(ellipse 130% 55% at 50% -5%, ${accent}28 0%, transparent 60%)`,
    `radial-gradient(ellipse 65% 65% at -5% 50%, ${accent}18 0%, transparent 55%)`,
    `radial-gradient(ellipse 65% 65% at 105% 50%, ${accent}14 0%, transparent 55%)`,
    '#020408',
  ].join(', ');

  if (loadingContest) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#020408' }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: `${accent}30` }} />
            <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin"
              style={{ borderTopColor: accent }} />
          </div>
          <p className="font-orbitron text-sm animate-pulse" style={{ color: accent }}>
            LOADING ARENA...
          </p>
        </div>
      </div>
    );
  }

  if (!contest) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#020408' }}>

      {/* ── Contest top bar ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b"
        style={{
          background: 'rgba(10,15,30,0.97)',
          borderColor: `${accent}30`,
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Left: exit + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/contest/${params.id}`}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0"
            style={{ border: `1.5px solid ${accent}50`, backgroundColor: `${accent}15`, color: accent }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}30`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}15`; }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-5 opacity-30" style={{ backgroundColor: accent }} />
          <Trophy className="w-4 h-4 shrink-0" style={{ color: accent }} />
          <span className="font-orbitron text-xs font-bold text-white truncate max-w-[180px] tracking-wide">
            {contest.title.toUpperCase()}
          </span>
        </div>

        {/* Center: problem tabs */}
        <div className="flex items-center gap-1.5">
          {contest.problems.map((p, i) => {
            const solved = myEntry?.problems?.find((ep: any) => ep.problemId === p.problemId)?.accepted;
            const isActive = selectedIdx === i;
            return (
              <button
                key={p.problemId}
                onClick={() => setSelectedIdx(i)}
                className="relative px-4 py-1.5 text-xs font-orbitron font-bold rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: isActive ? accent : 'transparent',
                  color: isActive ? '#000' : solved ? '#22c55e' : `${accent}99`,
                  border: `1.5px solid ${isActive ? accent : solved ? '#22c55e40' : `${accent}30`}`,
                }}
              >
                P{i + 1}
                {solved && !isActive && (
                  <CheckCircle className="w-2.5 h-2.5 absolute -top-1 -right-1 text-green-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: timer + standings */}
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: `${timeColor}50`, backgroundColor: `${timeColor}10` }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: timeColor }} />
            <span className="font-orbitron text-sm font-black tracking-widest" style={{ color: timeColor }}>
              {countdown}
            </span>
          </div>

          {/* Standings link */}
          <Link
            href={`/contest/${params.id}/leaderboard`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-orbitron font-bold rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: `${accent}50`, backgroundColor: `${accent}15`, color: accent }}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            STANDINGS
          </Link>
        </div>
      </div>

      {/* ── Problem info sub-bar ── */}
      {contest.problems[selectedIdx] && (
        <div
          className="flex-shrink-0 flex items-center gap-3 px-5 py-2 border-b"
          style={{ background: 'rgba(10,15,30,0.7)', borderColor: `${accent}18` }}
        >
          <span className="font-orbitron text-xs text-white font-semibold tracking-wide">
            {contest.problems[selectedIdx].title || `Problem ${selectedIdx + 1}`}
          </span>
          <span className="text-xs font-rajdhani text-gray-500">
            {contest.problems[selectedIdx].difficulty || 'Easy'}
          </span>
          <div className="flex items-center gap-1 ml-auto font-orbitron font-black text-sm" style={{ color: accent }}>
            <Star className="w-3.5 h-3.5" />
            {contest.problems[selectedIdx].points} pts
          </div>
        </div>
      )}

      {/* ── Main editor area ── */}
      <div
        className="flex-1 overflow-hidden"
        style={hasCompilerTheme ? { background: colorBg } : { background: '#020408' }}
      >
        {loadingProblem || !problem ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-3">
                <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: `${accent}30` }} />
                <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin"
                  style={{ borderTopColor: accent }} />
              </div>
              <p className="font-orbitron text-xs animate-pulse" style={{ color: accent }}>LOADING PROBLEM...</p>
            </div>
          </div>
        ) : (
          <CompilerUI problem={problem} contestId={params.id} />
        )}
      </div>
    </div>
  );
}
