'use client';

import type { Level } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, Lock, Zap, Target, CheckCircle, Play } from 'lucide-react';
import { useProgress, syncProgressFromServer } from '@/lib/utilities/progress';
import { isLevelUnlocked } from '@/lib/utilities/unlock';
import { useState, useEffect } from 'react';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useTheme } from '@/contexts/ThemeContext';

interface LevelListProps {
  levels: Level[];
}

export function LevelList({ levels }: LevelListProps) {
  const progress = useProgress();
  const [mounted, setMounted] = useState(false);
  const [, forceSync] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const { playProjectTextSound, playCardHover } = useGlobalAudio();
  const { accentColor } = useTheme();

  const toggleFlip = (levelId: number) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(levelId)) next.delete(levelId);
      else next.add(levelId);
      return next;
    });
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    setMounted(true);
    // Pull the latest solved set + per-account unlock flag, then re-render so level
    // locks (and the Teja test bypass) reflect server truth on a cold load.
    syncProgressFromServer().then(() => forceSync((n) => n + 1));
  }, []);

  if (!mounted) {
    // Render a placeholder while client-side hydration happens
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {levels.map((level) => (
          <div key={level.level_id} className="h-80 bg-space-gray/20 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  const getStatusInfo = (level: Level) => {
    const isCompleted = progress.isLevelCompleted(level.age_group, level.level_number);
    // TEST/DEV per-account bypass (Teja only) opens every level.
    const isUnlocked = progress.unlockAll || isLevelUnlocked(
      levels,
      level.level_number,
      (pid: number) => progress.isProblemCompleted(String(pid)),
    );

    if (isCompleted) {
      return {
        status: 'completed',
        statusIcon: <CheckCircle className="w-4 h-4" style={{ color: accentColor }} />,
        statusText: 'COMPLETE',
        statusColor: '',
        badgeClass: '',
        buttonText: 'REVIEW',
        buttonIcon: <Target className="mr-2 h-4 w-4" />
      };
    }

    if (isUnlocked) {
      return {
        status: 'unlocked',
        statusIcon: <Play className="w-4 h-4 animate-pulse" style={{ color: accentColor }} />,
        statusText: 'READY',
        statusColor: '',
        badgeClass: '',
        buttonText: 'INITIALIZE',
        buttonIcon: <Zap className="mr-2 h-4 w-4" />
      };
    }

    return {
      status: 'locked',
      statusIcon: <Lock className="w-4 h-4 text-muted-foreground" />,
      statusText: 'LOCKED',
      statusColor: 'text-muted-foreground',
      badgeClass: 'bg-muted/20 text-muted-foreground border-muted/40',
      buttonText: 'LOCKED',
      buttonIcon: null
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {levels.map((level) => {
        const statusInfo = getStatusInfo(level);
        const isLocked = statusInfo.status === 'locked';
        const isCompleted = statusInfo.status === 'completed';

        return (
          <div
            key={level.level_id}
            className="relative transition-all duration-500 hover:scale-105"
            onMouseEnter={() => !isLocked && playCardHover()}
          >
            {/* Card Container with Electric Border */}
            <div
              className="relative p-0.5 rounded-3xl"
              style={{
                background: `linear-gradient(-30deg, ${isLocked ? 'rgba(100, 100, 100, 0.4)' : hexToRgba(accentColor, 0.4)}, transparent, ${isLocked ? 'rgba(100, 100, 100, 0.4)' : hexToRgba(accentColor, 0.4)}), linear-gradient(to bottom, rgba(10, 14, 23, 1), rgba(10, 14, 23, 1))`
              }}
            >
              {/* Inner Container */}
              <div className="relative">
                {/* Border Outer */}
                <div
                  className="border-2 rounded-3xl pr-1 pb-1"
                  style={{ borderColor: isLocked ? 'rgba(100, 100, 100, 0.5)' : hexToRgba(accentColor, 0.5) }}
                >
                  {/* Main Card - flips as one rigid unit, border and all */}
                  <div
                    className="w-full h-80 -mt-1 -ml-1 relative"
                    style={{ perspective: '1500px' }}
                  >
                    <div
                      className="relative w-full h-full transition-transform duration-700 ease-in-out"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: flippedCards.has(level.level_id) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      {/* Front Face: Mission Badge + Title */}
                      <div
                        className="absolute inset-0 w-full h-full rounded-3xl border-2 overflow-hidden flex flex-col items-center justify-center text-center gap-4 p-6 cursor-pointer"
                        style={{
                          borderColor: isLocked ? '#666666' : accentColor,
                          background: 'transparent',
                          backfaceVisibility: 'hidden'
                        }}
                        onClick={() => toggleFlip(level.level_id)}
                      >
                        <div
                          className="flex items-center gap-2 px-3 py-1 rounded-lg"
                          style={{
                            background: 'transparent',
                            border: `1px solid ${isLocked ? 'rgba(100, 100, 100, 0.3)' : hexToRgba(accentColor, 0.3)}`
                          }}
                        >
                          <Target className="w-4 h-4" style={{ color: isLocked ? '#666666' : accentColor }} />
                          <span className="text-xs font-space font-bold" style={{ color: isLocked ? '#666666' : accentColor }}>
                            MISSION {level.level_number}
                          </span>
                        </div>
                        <h3 className="text-2xl font-space font-bold uppercase" style={{ color: '#f3ede9' }}>
                          {level.title.replace(/^Mission \d+:\s*/i, '')}
                        </h3>
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]" style={{ color: isLocked ? '#666666' : accentColor, opacity: 0.6 }}>
                          Tap for briefing
                        </p>
                      </div>

                      {/* Back Face: Description + Action */}
                      <div
                        className="absolute inset-0 w-full h-full rounded-3xl border-2 overflow-hidden flex flex-col cursor-pointer"
                        style={{
                          borderColor: isLocked ? '#666666' : accentColor,
                          background: 'transparent',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                        onClick={() => toggleFlip(level.level_id)}
                      >
                        <div className="flex items-center justify-center pt-6">
                          <div
                            className="flex items-center gap-2 px-3 py-1 rounded-lg"
                            style={{
                              background: 'transparent',
                              border: `1px solid ${isLocked ? 'rgba(100, 100, 100, 0.3)' : hexToRgba(accentColor, 0.3)}`
                            }}
                          >
                            <Target className="w-4 h-4" style={{ color: isLocked ? '#666666' : accentColor }} />
                            <span className="text-xs font-space font-bold" style={{ color: isLocked ? '#666666' : accentColor }}>
                              MISSION {level.level_number}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-center p-6 pb-2">
                          <p className="text-sm leading-relaxed" style={{ color: '#f3ede9', opacity: isLocked ? 0.5 : 0.7 }}>
                            {level.description}
                          </p>
                        </div>
                        <hr
                          className="mx-6 mb-4 border-none h-px opacity-20"
                          style={{
                            background: 'currentColor',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
                            maskImage: 'linear-gradient(to right, transparent, black, transparent)'
                          }}
                        />

                        <div className="flex flex-col p-6 pt-0" onClick={(e) => e.stopPropagation()}>
                          {isLocked ? (
                            <div className="flex flex-col gap-2">
                              <div
                                className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-space font-semibold text-sm cursor-not-allowed"
                                style={{
                                  background: 'rgba(100, 100, 100, 0.2)',
                                  border: '1px solid rgba(100, 100, 100, 0.3)',
                                  color: '#666666'
                                }}
                              >
                                <Lock className="w-4 h-4" />
                                <span>LOCKED</span>
                              </div>
                              <p className="text-xs text-center font-mono" style={{ color: '#666666', opacity: 0.7 }}>
                                Complete Mission {level.level_number - 1} first
                              </p>
                            </div>
                          ) : (
                            <Link
                              href={`/levels/${level.age_group}/${level.level_number}`}
                              onClick={() => playProjectTextSound()}
                              className="w-full"
                            >
                              <div
                                className="w-full py-3 px-4 rounded-lg flex items-center justify-between font-space font-semibold text-sm transition-all hover:scale-105"
                                style={{
                                  background: hexToRgba(accentColor, 0.2),
                                  border: `1px solid ${hexToRgba(accentColor, 0.4)}`,
                                  color: accentColor
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {statusInfo.buttonIcon}
                                  <span>{statusInfo.buttonText}</span>
                                </div>
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
