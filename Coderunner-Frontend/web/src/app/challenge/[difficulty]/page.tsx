'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Swords, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import FloatingParticles from '@/components/ui/FloatingParticles';
import type { Problem } from '@/lib/types';

const DIFFICULTY_BY_SLUG: Record<string, { label: 'Easy' | 'Medium' | 'Hard' }> = {
  easy: { label: 'Easy' },
  medium: { label: 'Medium' },
  hard: { label: 'Hard' },
};

/**
 * One difficulty band's problem list, reached from the three cards on
 * /challenge. Opening a problem goes through the normal /problems/[id] solve
 * page — sequential unlock is still enforced server-side at grade time.
 */
export default function ChallengeDifficultyPage() {
  const router = useRouter();
  const params = useParams<{ difficulty: string }>();
  const { theme } = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const slug = (params?.difficulty || '').toLowerCase();
  const band = DIFFICULTY_BY_SLUG[slug];

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/challenge/${slug}`);
    }
  }, [authLoading, isAuthenticated, router, slug]);

  useEffect(() => {
    if (!isAuthenticated || !band) return;
    (async () => {
      setLoading(true);
      try {
        const [all, stats] = await Promise.all([
          api.problems.getAll() as Promise<Problem[]>,
          api.users.getStats() as Promise<{ solvedProblemIds?: number[] }>,
        ]);
        setProblems(all || []);
        setSolvedIds(new Set(stats?.solvedProblemIds || []));
      } catch {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, band]);

  if (!band) {
    notFound();
  }

  const list = problems.filter(
    (p) => (!user?.age_group || p.age_group === user.age_group) && p.difficulty === band.label
  );

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
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => router.push('/challenge')}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 shrink-0"
              style={{ border: `1.5px solid ${theme.colors.light}99`, backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-orbitron font-black mb-2 tracking-wider text-white flex items-center gap-3">
                <Swords className="w-8 h-8" style={{ color: theme.colors.primary }} />
                {band.label.toUpperCase()} CHALLENGES
              </h1>
              <p className="font-rajdhani text-gray-200">{list.length} problems in your track</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: `${theme.colors.primary}30` }} />
                  <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: theme.colors.primary }} />
                </div>
                <p className="font-rajdhani text-gray-200 animate-pulse">Loading problems...</p>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="bg-white border-2 rounded-xl p-16 text-center" style={{ borderColor: `${theme.colors.light}99` }}>
              <Swords className="w-16 h-16 mx-auto mb-4" style={{ color: `${theme.colors.primary}40` }} />
              <h3 className="text-xl font-orbitron font-bold text-gray-400 mb-2">NO {band.label.toUpperCase()} PROBLEMS YET</h3>
              <p className="font-rajdhani text-gray-400">Check back soon for more challenges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {list.map((p) => {
                const solved = solvedIds.has(p.problem_id);
                return (
                  <button
                    key={p.problem_id}
                    onClick={() => router.push(`/problems/${p.problem_id}`)}
                    className="group bg-white border-2 rounded-xl p-5 text-left transition-all duration-300 hover:shadow-lg cursor-pointer flex items-center justify-between gap-3"
                    style={{ borderColor: `${theme.colors.light}66` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = theme.colors.primary; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${theme.colors.light}66`; }}
                  >
                    <span className="truncate text-base font-orbitron font-bold text-gray-900">{p.title}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      {solved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      <ChevronRight className="w-4 h-4" style={{ color: theme.colors.primary }} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
