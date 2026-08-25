'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Swords, ChevronLeft, ArrowRight, Zap, Target, Play } from 'lucide-react';
import FloatingParticles from '@/components/ui/FloatingParticles';
import type { Problem } from '@/lib/types';

const SECTIONS: Array<{ key: 'Easy' | 'Medium' | 'Hard'; slug: string }> = [
  { key: 'Easy', slug: 'easy' },
  { key: 'Medium', slug: 'medium' },
  { key: 'Hard', slug: 'hard' },
];

/** hex "#rrggbb" -> "rgba(r, g, b, opacity)" */
function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Landing screen: three difficulty cards. Picking one goes to
 * /challenge/[difficulty], which lists that band's problems.
 */
export default function ChallengePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/challenge');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setLoading(true);
      try {
        const all = (await api.problems.getAll()) as Problem[];
        setProblems(all || []);
      } catch {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const inBand = problems.filter((p) => !user?.age_group || p.age_group === user.age_group);
  const accent = theme.colors.primary;

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
              onClick={() => router.back()}
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
                CHALLENGE ME
              </h1>
              <p className="font-rajdhani text-gray-200">
                Extra problems outside your regular path — pick a difficulty to start
              </p>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {SECTIONS.map(({ key, slug }, index) => {
                const count = inBand.filter((p) => p.difficulty === key).length;
                return (
                  <div key={key} className="relative transition-all duration-500 hover:scale-105">
                    {/* SVG turbulence filter for the animated electric-border glow */}
                    <svg className="absolute" style={{ width: 0, height: 0 }}>
                      <defs>
                        <filter id={`challenge-turbulent-${index}`} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
                          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
                          <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                            <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
                          </feOffset>
                          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
                          <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                            <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
                          </feOffset>
                          <feComposite in="offsetNoise1" in2="offsetNoise2" result="combinedNoise" />
                          <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="15" xChannelSelector="R" yChannelSelector="B" />
                        </filter>
                      </defs>
                    </svg>

                    <div
                      className="relative p-0.5 rounded-3xl"
                      style={{ background: `linear-gradient(-30deg, ${hexToRgba(accent, 0.4)}, transparent, ${hexToRgba(accent, 0.4)}), linear-gradient(to bottom, rgba(10, 14, 23, 1), rgba(10, 14, 23, 1))` }}
                    >
                      <div className="relative">
                        <div className="border-2 rounded-3xl pr-1 pb-1" style={{ borderColor: hexToRgba(accent, 0.5) }}>
                          <div
                            className="w-full h-80 rounded-3xl border-2 -mt-1 -ml-1 relative overflow-hidden"
                            style={{ borderColor: accent, background: 'rgba(10, 14, 23, 0.95)' }}
                          >
                            <div className="absolute inset-0 w-full h-full flex flex-col">
                              <div className="flex flex-col p-6 pb-4 h-full">
                                <div className="flex items-center justify-between mb-4">
                                  <div
                                    className="flex items-center gap-2 px-3 py-1 rounded-lg"
                                    style={{ background: hexToRgba(accent, 0.2), border: `1px solid ${hexToRgba(accent, 0.3)}` }}
                                  >
                                    <Target className="w-4 h-4" style={{ color: accent }} />
                                    <span className="text-xs font-space font-bold" style={{ color: accent }}>{key.toUpperCase()}</span>
                                  </div>
                                  <div
                                    className="px-2 py-1 rounded-full text-xs font-space font-bold flex items-center gap-1"
                                    style={{
                                      background: 'radial-gradient(47.2% 50% at 50.39% 88.37%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%), rgba(255, 255, 255, 0.04)',
                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                      color: accent,
                                    }}
                                  >
                                    <Play className="w-4 h-4 animate-pulse" style={{ color: accent }} />
                                    <span>READY</span>
                                  </div>
                                </div>

                                <h3 className="text-xl font-space font-bold mb-3" style={{ color: '#f3ede9' }}>
                                  {key} Challenges
                                </h3>
                                <p className="text-sm leading-relaxed mb-4" style={{ color: '#f3ede9', opacity: 0.7 }}>
                                  {count} problems available in your track
                                </p>

                                <hr
                                  className="mt-auto mb-4 border-none h-px opacity-20"
                                  style={{ background: 'currentColor', WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)', maskImage: 'linear-gradient(to right, transparent, black, transparent)' }}
                                />

                                <div className="flex items-center gap-2 mb-4">
                                  <Zap className="w-4 h-4" style={{ color: accent }} />
                                  <span className="text-xs font-space font-semibold" style={{ color: accent }}>NEURAL PROTOCOL</span>
                                </div>
                              </div>

                              <div className="flex flex-col p-6 pt-0">
                                <button
                                  onClick={() => router.push(`/challenge/${slug}`)}
                                  className="w-full py-3 px-4 rounded-lg flex items-center justify-between font-space font-semibold text-sm transition-all hover:scale-105"
                                  style={{ background: hexToRgba(accent, 0.2), border: `1px solid ${hexToRgba(accent, 0.4)}`, color: accent }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    <span>INITIALIZE</span>
                                  </div>
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Glow layers */}
                        <div className="absolute inset-0 w-full h-full border-2 rounded-3xl pointer-events-none" style={{ borderColor: hexToRgba(accent, 0.6), filter: `blur(1px) url(#challenge-turbulent-${index})` }} />
                        <div className="absolute inset-0 w-full h-full border-2 rounded-3xl pointer-events-none" style={{ borderColor: accent, filter: `blur(4px) url(#challenge-turbulent-${index})` }} />
                      </div>

                      <div className="absolute inset-0 w-full h-full rounded-3xl opacity-100 scale-110 pointer-events-none" style={{ mixBlendMode: 'overlay', filter: 'blur(16px)', background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)' }} />
                      <div className="absolute inset-0 w-full h-full rounded-3xl opacity-50 scale-110 pointer-events-none" style={{ mixBlendMode: 'overlay', filter: 'blur(16px)', background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)' }} />
                      <div className="absolute inset-0 w-full h-full rounded-3xl -z-10 scale-110 opacity-30" style={{ filter: 'blur(32px)', background: `linear-gradient(-30deg, ${accent}, transparent, ${accent})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
