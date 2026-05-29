'use client';

import { CompilerUI } from '@/components/editor/CompilerUI';
import NeuralHeader from '@/components/editor/NeuralHeader';
import type { Problem } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api-client';

interface ProblemPageProps {
  params: {
    id: string;
  };
}

export default function ProblemPage({ params }: ProblemPageProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { forcePlayMissionMusic, forcePlayBackgroundMusic, getCurrentMusicType } = useGlobalAudio();
  const { character, accentColor } = useTheme();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  // Solving writes progress, so it requires login. Send logged-out users to
  // login with a redirect back here (prevents silent progress loss on submit).
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/problems/${params.id}`);
    }
  }, [authLoading, isAuthenticated, router, params.id]);

  useEffect(() => {
    async function loadData() {
      let data: any = null;
      try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const problemId = parseInt(id);

        if (isNaN(problemId)) {
          setNotFoundError(true);
          return;
        }

        // Use API client to fetch from backend API service
        console.log('[Problem Page] Fetching problem:', problemId);
        data = await api.problems.getById(problemId);
        console.log('[Problem Page] Received problem:', {
          problem_id: data.problem_id,
          title: data.title,
          has_case_code: !!data.case_code,
          case_code_preview: data.case_code?.substring(0, 50)
        });
        setProblem(data);

        // Store age group in localStorage for theme persistence
        if (data.age_group) {
          localStorage.setItem('currentAgeGroup', data.age_group);
        }

      } catch (error) {
        console.error('[Problem Page] Error loading problem:', error);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }

      // Music is handled separately so audio errors never cause a 404
      try {
        const problemTitle = data?.title?.toLowerCase() || '';
        const isGalacticMission = problemTitle.includes('galactic') || problemTitle.includes('code quest');
        const requiredMusicType = isGalacticMission ? 'mission' : 'background';
        const currentMusicType = getCurrentMusicType();
        if (currentMusicType !== requiredMusicType) {
          if (isGalacticMission) {
            await forcePlayMissionMusic();
          } else {
            await forcePlayBackgroundMusic();
          }
        }
      } catch {
        // Audio errors are non-fatal — ignore silently
      }
    }

    loadData();
  }, [params, forcePlayMissionMusic, forcePlayBackgroundMusic, getCurrentMusicType]);

  // notFound() must be called at render time, not inside useEffect/async code
  if (notFoundError) {
    notFound();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-black/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="font-mono font-semibold text-cyan-600 dark:text-cyan-400 text-sm animate-pulse">
            // Loading problem data...
          </p>
        </div>
      </div>
    );
  }

  if (!problem) {
    notFound();
  }

  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);

  // Color-based background — radial glow from accent colour on dark base
  const colorBg = [
    `radial-gradient(ellipse 130% 55% at 50% -5%,  ${accentColor}28 0%, transparent 60%)`,
    `radial-gradient(ellipse 65%  65% at -5%  50%,  ${accentColor}18 0%, transparent 55%)`,
    `radial-gradient(ellipse 65%  65% at 105% 50%,  ${accentColor}14 0%, transparent 55%)`,
    `radial-gradient(ellipse 90%  45% at 50%  108%, ${accentColor}12 0%, transparent 60%)`,
    '#020408',
  ].join(', ');

  return (
    <div
      className={`flex flex-col h-screen text-foreground relative overflow-hidden${hasCompilerTheme && mounted ? ' bg-[#020408]' : ''}`}
    >
      {/* Header — outside the wallpaper frame, spans full width */}
      <NeuralHeader />

      {/* Fallback: plain purple gradient for unknown characters */}
      {!hasCompilerTheme && (
        <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      )}

      <main className="flex-grow relative z-10 overflow-hidden">
        {/*
          All characters: wallpaper lives inside the rounded frame.
          The outer page is bg-[#020408] (near-black), so the padding area is dark
          and the thin border separating them is clearly visible.
        */}
        <div
          className={hasCompilerTheme && mounted ? 'relative h-full rounded-2xl overflow-hidden' : 'h-full'}
          style={hasCompilerTheme && mounted ? {
            background: colorBg,
            border: `1px solid ${accentColor}30`,
            boxShadow: `0 0 60px ${accentColor}18`,
          } : {}}
        >
          <div className={hasCompilerTheme && mounted ? 'relative z-10 h-full flex flex-col' : 'h-full'}>
            <CompilerUI problem={problem!} />
          </div>
        </div>
      </main>
    </div>
  );
}
