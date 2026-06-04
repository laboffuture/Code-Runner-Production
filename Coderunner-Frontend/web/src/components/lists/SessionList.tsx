'use client';

import type { Session, Level } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ProblemList } from './ProblemList';
import { Cpu, Activity, Zap, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useProgress, syncProgressFromServer } from '@/lib/utilities/progress';


interface SessionListProps {
  sessions: Session[];
  level: Level
}

export function SessionList({ sessions, level }: SessionListProps) {
  const [openSession, setOpenSession] = useState<string | undefined>(undefined);
  const { accentColor, theme } = useTheme();
  const { isProblemCompleted, unlockAll } = useProgress();
  const [, forceSync] = useState(0);

  // Pull the latest solved set from the server so unlock state is accurate.
  useEffect(() => {
    syncProgressFromServer().then(() => forceSync((n) => n + 1));
  }, []);

  // A session counts as complete when every one of its problems is solved.
  const isSessionComplete = (s: Session) =>
    (s.problems?.length ?? 0) > 0 &&
    s.problems.every((p: any) => isProblemCompleted(String(p.problem_id)));

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Handle both session hashes and code-convergence hash
      if (hash === '#code-convergence') {
        // Open Code Convergence accordion and scroll to show it fully
        setOpenSession('code-convergence');
        // Scroll to show Code Convergence section in full view at the top
        setTimeout(() => {
          const element = document.getElementById('code-convergence');
          if (element) {
            element.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
        }, 0);
      } else {
        const sessionId = hash.replace('#session-', '');
        setOpenSession(`session-${sessionId}`);

        // Only scroll for regular session hashes, not code-convergence
        setTimeout(() => {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, []);

  // Filter out sessions 11 and 12
  const filteredSessions = sessions.filter(session =>
    session.session_number !== 11 && session.session_number !== 12
  );

  // The final challenge unlocks only after every session is complete (or the
  // TEST/DEV per-account bypass is on — Teja only).
  const allSessionsComplete =
    unlockAll || (filteredSessions.length > 0 && filteredSessions.every(isSessionComplete));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="w-full space-y-6">
        {filteredSessions.map((session, index) => {
          const locked = !unlockAll && index > 0 && !isSessionComplete(filteredSessions[index - 1]);
          return (
          <div key={session.session_id} id={`session-${session.session_id}`} className={`relative ${locked ? 'opacity-70' : ''}`}>
            {/* SVG Filter Definition */}
            <svg className="absolute" style={{ width: 0, height: 0 }}>
              <defs>
                <filter
                  id={`session-turbulent-displace-${index}`}
                  colorInterpolationFilters="sRGB"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.02"
                    numOctaves="10"
                    result="noise1"
                    seed="1"
                  />
                  <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                    <animate
                      attributeName="dy"
                      values="700; 0"
                      dur="6s"
                      repeatCount="indefinite"
                      calcMode="linear"
                    />
                  </feOffset>
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.02"
                    numOctaves="10"
                    result="noise2"
                    seed="1"
                  />
                  <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                    <animate
                      attributeName="dy"
                      values="0; -700"
                      dur="6s"
                      repeatCount="indefinite"
                      calcMode="linear"
                    />
                  </feOffset>
                  <feComposite in="offsetNoise1" in2="offsetNoise2" result="combinedNoise" />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="combinedNoise"
                    scale="15"
                    xChannelSelector="R"
                    yChannelSelector="B"
                  />
                </filter>
              </defs>
            </svg>

            {/* Electric Border Container */}
            <div
              className="relative p-0.5 rounded-2xl"
              style={{
                background: `linear-gradient(-30deg, ${hexToRgba(accentColor, 0.4)}, transparent, ${hexToRgba(accentColor, 0.4)}), linear-gradient(to bottom, rgba(10, 14, 23, 1), rgba(10, 14, 23, 1))`
              }}
            >
              {/* Inner Container */}
              <div className="relative">
                {/* Border Outer */}
                <div
                  className="border-2 rounded-2xl pr-1 pb-1"
                  style={{ borderColor: hexToRgba(accentColor, 0.5) }}
                >
                  {/* Main Card */}
                  <div
                    className="w-full rounded-2xl border-2 -mt-1 -ml-1 relative overflow-hidden"
                    style={{
                      borderColor: accentColor,
                      background: 'rgba(10, 14, 23, 0.95)'
                    }}
                  >
                    <Accordion type="single" collapsible value={openSession} onValueChange={setOpenSession}>
                      <AccordionItem value={`session-${session.session_id}`} disabled={locked} className="border-0">
                        <AccordionTrigger
                          className="text-xl hover:no-underline py-6 px-6 transition-colors [&[data-state=open]>div>svg]:rotate-180"
                          style={{ ['--tw-bg-opacity' as string]: '1' } as React.CSSProperties}
                        >
                          <div className="flex items-center gap-6 w-full">
                            <div className="relative flex-shrink-0">
                              <span
                                className="flex items-center justify-center h-14 w-14 rounded-full border-2 font-space font-bold text-xl"
                                style={{
                                  background: hexToRgba(accentColor, 0.2),
                                  borderColor: hexToRgba(accentColor, 0.5),
                                  color: accentColor
                                }}
                              >
                                {locked ? <Lock className="h-6 w-6" /> : session.session_number}
                              </span>
                              <div className="absolute -inset-1 rounded-full blur animate-pulse" style={{ backgroundColor: hexToRgba(accentColor, 0.1) }}></div>
                            </div>
                            <div className="text-left flex-grow min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Cpu className="h-4 w-4 flex-shrink-0" style={{ color: accentColor }} />
                                <span className="text-xs font-space uppercase tracking-wide font-bold" style={{ color: accentColor }}>TRAINING PROTOCOL</span>
                              </div>
                              <h3 className="font-space font-bold text-xl" style={{ color: '#f3ede9' }}>
                                {session.title.replace(/^Session \d+:\s*/, '')}
                              </h3>
                            </div>
                            <div
                              className="flex items-center gap-2 px-3 py-1 rounded border-2 font-space font-semibold text-xs flex-shrink-0 mr-6"
                              style={{
                                background: `linear-gradient(135deg, rgba(10, 14, 23, 0.95), ${hexToRgba(accentColor, 0.15)})`,
                                borderColor: theme.colors.light,
                                color: theme.colors.light,
                                boxShadow: `0 0 20px ${hexToRgba(theme.colors.light, 0.3)}`
                              }}
                            >
                              {locked ? (
                                <>
                                  <Lock className="w-3 h-3" style={{ color: theme.colors.light }} />
                                  <span>LOCKED</span>
                                </>
                              ) : (
                                <>
                                  <Activity className="w-3 h-3 animate-pulse" style={{ color: theme.colors.light }} />
                                  <span>{session.problems.length} TASKS</span>
                                </>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent>
                          <div className="px-6 pb-6">
                            <div className="pl-8 border-l-2 ml-7 space-y-6" style={{ borderColor: hexToRgba(accentColor, 0.3) }}>
                                {/* Execution Tasks Section */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-4">
                                  <span className="text-xs font-space uppercase tracking-wide font-bold" style={{ color: accentColor }}>EXECUTION TASKS</span>
                                </div>
                                <ProblemList problems={session.problems} sessionId={session.session_id} />
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>

                {/* Glow Layers */}
                <div
                  className="absolute inset-0 w-full h-full border-2 rounded-2xl pointer-events-none"
                  style={{
                    borderColor: hexToRgba(accentColor, 0.6),
                    filter: `blur(1px) url(#session-turbulent-displace-${index})`
                  }}
                ></div>
                <div
                  className="absolute inset-0 w-full h-full border-2 rounded-2xl pointer-events-none"
                  style={{
                    borderColor: accentColor,
                    filter: `blur(4px) url(#session-turbulent-displace-${index})`
                  }}
                ></div>
              </div>

              {/* Overlay Effects */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl opacity-100 scale-110 pointer-events-none"
                style={{
                  mixBlendMode: 'overlay',
                  filter: 'blur(16px)',
                  background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)'
                }}
              ></div>
              <div
                className="absolute inset-0 w-full h-full rounded-2xl opacity-50 scale-110 pointer-events-none"
                style={{
                  mixBlendMode: 'overlay',
                  filter: 'blur(16px)',
                  background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)'
                }}
              ></div>

              {/* Background Glow */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl -z-10 scale-110 opacity-30"
                style={{
                  filter: 'blur(32px)',
                  background: `linear-gradient(-30deg, ${accentColor}, transparent, ${accentColor})`
                }}
              ></div>
            </div>
          </div>
          );
        })}

        {/* Code Convergence Section */}
        <div id="code-convergence" className={`relative ${!allSessionsComplete ? 'opacity-70' : ''}`}>
          {/* SVG Filter Definition */}
          <svg className="absolute" style={{ width: 0, height: 0 }}>
            <defs>
              <filter
                id="code-convergence-turbulent-displace"
                colorInterpolationFilters="sRGB"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.02"
                  numOctaves="10"
                  result="noise1"
                  seed="1"
                />
                <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                  <animate
                    attributeName="dy"
                    values="700; 0"
                    dur="6s"
                    repeatCount="indefinite"
                    calcMode="linear"
                  />
                </feOffset>
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.02"
                  numOctaves="10"
                  result="noise2"
                  seed="1"
                />
                <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                  <animate
                    attributeName="dy"
                    values="0; -700"
                    dur="6s"
                    repeatCount="indefinite"
                    calcMode="linear"
                  />
                </feOffset>
                <feComposite in="offsetNoise1" in2="offsetNoise2" result="combinedNoise" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="combinedNoise"
                  scale="15"
                  xChannelSelector="R"
                  yChannelSelector="B"
                />
              </filter>
            </defs>
          </svg>

          {/* Electric Border Container */}
          <div
            className="relative p-0.5 rounded-2xl"
            style={{
              background: `linear-gradient(-30deg, ${hexToRgba(accentColor, 0.4)}, transparent, ${hexToRgba(accentColor, 0.4)}), linear-gradient(to bottom, rgba(10, 14, 23, 1), rgba(10, 14, 23, 1))`
            }}
          >
            {/* Inner Container */}
            <div className="relative">
              {/* Border Outer */}
              <div
                className="border-2 rounded-2xl pr-1 pb-1"
                style={{ borderColor: hexToRgba(accentColor, 0.5) }}
              >
                {/* Main Card */}
                <div
                  className="w-full rounded-2xl border-2 -mt-1 -ml-1 relative overflow-hidden"
                  style={{
                    borderColor: accentColor,
                    background: 'rgba(10, 14, 23, 0.95)'
                  }}
                >
                  <Accordion type="single" collapsible value={openSession} onValueChange={(value) => {
                    setOpenSession(value);
                    // Scroll to Code Convergence when accordion is opened
                    if (value === 'code-convergence') {
                      setTimeout(() => {
                        const element = document.getElementById('code-convergence');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }
                  }}>
                    <AccordionItem value="code-convergence" disabled={!allSessionsComplete} className="border-0">
                      <AccordionTrigger className="text-xl hover:no-underline py-6 px-6 transition-colors [&[data-state=open]>div>svg]:rotate-180">
                        <div className="flex items-center gap-6 w-full">
                          <div className="relative flex-shrink-0">
                            <span
                              className="flex items-center justify-center h-14 w-14 rounded-full border-2 font-space font-bold text-xl"
                              style={{
                                background: hexToRgba(accentColor, 0.2),
                                borderColor: hexToRgba(accentColor, 0.5),
                                color: accentColor
                              }}
                            >
                              {allSessionsComplete ? <Zap className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
                            </span>
                            <div className="absolute -inset-1 rounded-full blur animate-pulse" style={{ backgroundColor: hexToRgba(accentColor, 0.1) }}></div>
                          </div>
                          <div className="text-left flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Cpu className="h-4 w-4" style={{ color: accentColor }} />
                              <span className="text-xs font-space uppercase tracking-wide font-bold" style={{ color: accentColor }}>FINAL CHALLENGE</span>
                            </div>
                            <h3 className="font-space font-bold text-xl" style={{ color: '#f3ede9' }}>Code Convergence</h3>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="px-6 pb-6">
                          <div className="pl-8 border-l-2 ml-7 space-y-6" style={{ borderColor: hexToRgba(accentColor, 0.3) }}>
                            {/* Final Task Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-space uppercase tracking-wide font-bold" style={{ color: accentColor }}>FINAL TASK</span>
                              </div>

                              <Link href={`/code-convergence/${level.age_group}/${level.level_number}/ultimate-challenge`} className="block">
                                <Card
                                  className="hover:shadow-lg transition-all duration-300 group flex items-center border-2 relative overflow-hidden cursor-pointer"
                                  style={{
                                    background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.1)}, ${hexToRgba(accentColor, 0.05)})`,
                                    borderColor: hexToRgba(accentColor, 0.5),
                                    boxShadow: `0 0 15px ${hexToRgba(accentColor, 0.2)}`
                                  }}
                                >
                                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, ${theme.colors.light}, ${accentColor})` }}></div>
                                  <CardHeader className="flex-grow py-4">
                                    <CardTitle className="text-lg font-space transition-colors" style={{ color: 'rgb(243, 237, 233)' }}>
                                      {level.level_number === 1 ? 'The Ultimate Challenge' : level.level_number === 2 ? 'Project ORBITRON' : level.level_number === 3 ? 'Project COSMIC LINK' : 'Project GALACTIC COMMAND'}
                                    </CardTitle>
                                  </CardHeader>
                                </Card>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              {/* Glow Layers */}
              <div
                className="absolute inset-0 w-full h-full border-2 rounded-2xl pointer-events-none"
                style={{
                  borderColor: hexToRgba(accentColor, 0.6),
                  filter: 'blur(1px) url(#code-convergence-turbulent-displace)'
                }}
              ></div>
              <div
                className="absolute inset-0 w-full h-full border-2 rounded-2xl pointer-events-none"
                style={{
                  borderColor: accentColor,
                  filter: 'blur(4px) url(#code-convergence-turbulent-displace)'
                }}
              ></div>
            </div>

            {/* Overlay Effects */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl opacity-100 scale-110 pointer-events-none"
              style={{
                mixBlendMode: 'overlay',
                filter: 'blur(16px)',
                background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)'
              }}
            ></div>
            <div
              className="absolute inset-0 w-full h-full rounded-2xl opacity-50 scale-110 pointer-events-none"
              style={{
                mixBlendMode: 'overlay',
                filter: 'blur(16px)',
                background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)'
              }}
            ></div>

            {/* Background Glow */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl -z-10 scale-110 opacity-30"
              style={{
                filter: 'blur(32px)',
                background: `linear-gradient(-30deg, ${accentColor}, transparent, ${accentColor})`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
