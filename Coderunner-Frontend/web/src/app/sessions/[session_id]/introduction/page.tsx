'use client';

import { Header } from '@/components/layout/Header';
import type { Session } from '@/lib/types';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Zap, BookOpen, Target, ChevronLeft, ChevronRight, Lock, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { getFlowchartUrl, SESSION_FLOWCHART_CONFIG } from '@/lib/cloudinary';

interface IntroductionPageProps {
  params: {
    session_id: string;
  };
}

export default function IntroductionPage({ params }: IntroductionPageProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { forcePlayBackgroundMusic } = useGlobalAudio();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { accentColor } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToProblemId = searchParams.get('returnTo');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('neural-theme') || 'light';
    const dark = stored === 'dark';
    setIsDark(dark);
    const html = document.documentElement;
    if (dark) { html.classList.add('dark'); html.classList.remove('light'); }
    else       { html.classList.remove('dark'); html.classList.add('light'); }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newDark = !isDark;
    if (newDark) { html.classList.add('dark'); html.classList.remove('light'); }
    else         { html.classList.remove('dark'); html.classList.add('light'); }
    localStorage.setItem('neural-theme', newDark ? 'dark' : 'light');
    setIsDark(newDark);
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const pageBg        = isDark ? 'rgb(5, 8, 18)'          : 'rgb(245, 243, 255)';
  const surface1      = isDark ? 'rgba(13, 17, 35, 0.92)' : 'rgba(255, 255, 255, 0.9)';
  const surface2      = isDark ? 'rgba(13, 17, 35, 0.85)' : 'rgba(255, 255, 255, 0.8)';
  const surface3      = isDark ? 'rgba(8, 12, 28, 0.7)'   : 'rgba(255, 255, 255, 0.6)';
  const textPrimary   = isDark ? '#f1f5f9'                 : '#1a1a2e';
  const textSecondary = isDark ? '#94a3b8'                 : '#4a4a6a';

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        const { session_id } = resolvedParams;
        const response = await fetch(`/api/sessions/${session_id}`);
        if (!response.ok) notFound();
        const data = await response.json();
        setSession(data.session);
        await forcePlayBackgroundMusic();
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params, forcePlayBackgroundMusic]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-2 rounded-full"
              style={{ borderColor: hexToRgba(accentColor, 0.3) }} />
            <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin"
              style={{ borderTopColor: accentColor }} />
            <div className="absolute inset-2 border-2 border-transparent rounded-full animate-spin"
              style={{ borderTopColor: accentColor, animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="font-mono text-sm animate-pulse" style={{ color: accentColor }}>// Initializing training module...</p>
        </div>
      </div>
    );
  }

  if (!session) notFound();

  // ── Flowchart data ──────────────────────────────────────────────────────
  // session_number is the 1-based position within the level (matches Cloudinary folder names)
  const ageGroup     = session.age_group ?? (session.problems[0]?.age_group ?? '11-14');
  const levelNumber  = session.level_id;
  const sessionNum   = session.session_number;
  const config       = SESSION_FLOWCHART_CONFIG[levelNumber]?.[sessionNum];

  const flowchartImages: string[] = config
    ? Array.from({ length: config.count }, (_, i) =>
        getFlowchartUrl(ageGroup, levelNumber, sessionNum, i + 1)
      )
    : [];

  const objectives = config?.objectives ?? [];
  const currentImage = flowchartImages[currentImageIndex];
  const hasMultipleImages = flowchartImages.length > 1;
  const currentFlowConfig = config?.flows?.[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex(p => (p + 1) % flowchartImages.length);
    setImageLoaded(false);
    setImageError(false);
  };
  const prevImage = () => {
    setCurrentImageIndex(p => (p - 1 + flowchartImages.length) % flowchartImages.length);
    setImageLoaded(false);
    setImageError(false);
  };

  const handleStartTraining = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/sessions/' + session?.session_id + '/introduction');
      return;
    }
    const targetProblemId = returnToProblemId ?? session?.problems[0]?.problem_id;
    router.push(`/problems/${targetProblemId}`);
  };

  const backHref = `/levels/${ageGroup}/${levelNumber}#session-${session.session_id}`;

  return (
    <div className="flex flex-col min-h-screen text-foreground relative" style={{ backgroundColor: pageBg }}>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(${hexToRgba(accentColor, 0.03)} 1px, transparent 1px),
            linear-gradient(90deg, ${hexToRgba(accentColor, 0.03)} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.3)} 0%, transparent 70%)` }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.25)} 0%, transparent 70%)` }} />
      </div>

      <Header />

      <main className="flex-1 relative z-10 overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col flex-1">

          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <Link href={backHref}>
              <Button
                variant="ghost"
                className="group font-space font-semibold uppercase tracking-wide text-sm transition-all duration-300"
                style={{ color: accentColor }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = hexToRgba(accentColor, 0.1))}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Sessions
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:scale-110"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ border: `1px solid ${hexToRgba(accentColor, 0.3)}`, backgroundColor: hexToRgba(accentColor, 0.05) }}
              >
                {isDark
                  ? <Sun className="w-4 h-4" style={{ color: accentColor }} />
                  : <Moon className="w-4 h-4" style={{ color: accentColor }} />
                }
              </button>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ borderColor: hexToRgba(accentColor, 0.3), backgroundColor: hexToRgba(accentColor, 0.05) }}>
                <Zap className="h-4 w-4 animate-pulse" style={{ color: accentColor }} />
                <span className="text-sm font-space font-semibold" style={{ color: accentColor }}>
                  SESSION {session.session_id}
                </span>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1" style={{ alignItems: 'stretch', minHeight: 0 }}>

            {/* ── Left Panel ── */}
            <div className="lg:col-span-1 flex flex-col gap-4 justify-between">

              {/* Title Card */}
              <div className="rounded-2xl p-6 border-2 relative overflow-hidden shrink-0"
                style={{
                  borderColor: hexToRgba(accentColor, 0.3),
                  background: `linear-gradient(135deg, ${hexToRgba(accentColor, isDark ? 0.15 : 0.05)} 0%, ${surface1} 100%)`
                }}>
                <div className="absolute top-0 right-0 w-20 h-20 opacity-20"
                  style={{ background: `linear-gradient(135deg, transparent 50%, ${hexToRgba(accentColor, 0.3)} 50%)` }} />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: hexToRgba(accentColor, 0.1) }}>
                    <BookOpen className="h-6 w-6" style={{ color: accentColor }} />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-widest" style={{ color: hexToRgba(accentColor, 0.8) }}>
                    Training Module
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-space font-bold mb-3" style={{ color: textPrimary }}>
                  {session.title}
                </h1>
                <p className="text-sm leading-relaxed"
                  style={{
                    color: isDark ? '#ffffff' : textSecondary,
                    textShadow: isDark ? `0 0 8px ${hexToRgba(accentColor, 0.6)}, 0 0 20px ${hexToRgba(accentColor, 0.35)}` : 'none',
                  }}
                >
                  {session.description || session.introduction_content || 'Explore the concepts in this training module.'}
                </p>
              </div>

              {/* Objectives Card — only shown when objectives exist */}
              {objectives.length > 0 && (
                <div className="rounded-2xl p-6 border"
                  style={{ borderColor: hexToRgba(accentColor, 0.2), backgroundColor: surface2 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5" style={{ color: accentColor }} />
                    <span className="text-sm font-space font-bold uppercase tracking-wide" style={{ color: accentColor }}>
                      Learning Objectives
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: accentColor }} />
                        <span className="text-sm"
                          style={{
                            color: isDark ? '#ffffff' : textSecondary,
                            textShadow: isDark ? `0 0 8px ${hexToRgba(accentColor, 0.6)}, 0 0 20px ${hexToRgba(accentColor, 0.35)}` : 'none'
                          }}>
                          {obj}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pro Tip */}
              <div className="shrink-0 rounded-xl p-4 border flex items-start gap-4"
                style={{ borderColor: hexToRgba(accentColor, 0.2), backgroundColor: hexToRgba(accentColor, 0.05) }}>
                <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: hexToRgba(accentColor, 0.1) }}>
                  <Zap className="h-5 w-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="text-sm font-space font-semibold mb-1" style={{ color: accentColor }}>Study Tip</p>
                  <p className="text-sm"
                    style={{
                      color: isDark ? '#ffffff' : textSecondary,
                      textShadow: isDark ? `0 0 8px ${hexToRgba(accentColor, 0.6)}, 0 0 20px ${hexToRgba(accentColor, 0.35)}` : 'none'
                    }}>
                    Work through all {flowchartImages.length || 5} flowcharts in order — each one builds on the last. Understand every step before moving on to the tasks.
                  </p>
                </div>
              </div>

              {/* Start Training — desktop */}
              <div className="hidden lg:block shrink-0">
                <Button
                  onClick={handleStartTraining}
                  disabled={authLoading || !session?.problems[0] || !isAuthenticated}
                  className="w-full group text-white font-space font-bold px-8 py-6 text-base rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isAuthenticated ? accentColor : 'rgb(107, 114, 128)',
                    boxShadow: isAuthenticated ? `0 4px 20px ${hexToRgba(accentColor, 0.3)}` : 'none'
                  }}
                >
                  {!isAuthenticated && <Lock className="mr-2 h-5 w-5" />}
                  <span>{isAuthenticated ? 'Start Training' : 'Login to Start Training'}</span>
                  {isAuthenticated && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </div>

            {/* ── Right Panel — Flowchart Viewer ── */}
            <div className="lg:col-span-2 flex flex-col gap-3">

              {/* Flow title + counter row */}
              <div className="flex items-center justify-between shrink-0">
                <div className="min-w-0">
                  <span className="text-xs font-mono uppercase tracking-widest" style={{ color: hexToRgba(accentColor, 0.7) }}>
                    Case {currentImageIndex + 1} of {flowchartImages.length || 5}
                  </span>
                  <h2 className="text-base md:text-lg font-space font-bold mt-0.5 truncate" style={{ color: textPrimary }}>
                    {currentFlowConfig?.title ?? `Flowchart ${currentImageIndex + 1}`}
                  </h2>
                </div>

                {/* Dot indicators + arrows in the header */}
                {hasMultipleImages && !imageError && (
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button onClick={prevImage}
                      className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: hexToRgba(accentColor, 0.15), border: `1px solid ${hexToRgba(accentColor, 0.3)}` }}>
                      <ChevronLeft className="h-4 w-4" style={{ color: accentColor }} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {flowchartImages.map((_, idx) => (
                        <button key={idx}
                          onClick={() => { setCurrentImageIndex(idx); setImageLoaded(false); setImageError(false); }}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: idx === currentImageIndex ? '20px' : '8px',
                            height: '8px',
                            backgroundColor: idx === currentImageIndex ? accentColor : hexToRgba(accentColor, 0.3),
                          }}
                        />
                      ))}
                    </div>
                    <button onClick={nextImage}
                      className="p-2 rounded-full transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: hexToRgba(accentColor, 0.15), border: `1px solid ${hexToRgba(accentColor, 0.3)}` }}>
                      <ChevronRight className="h-4 w-4" style={{ color: accentColor }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Image container — fixed height so it never collapses */}
              <div className="rounded-2xl overflow-hidden border relative flex items-center justify-center shrink-0"
                style={{
                  height: '52vh',
                  minHeight: '300px',
                  borderColor: hexToRgba(accentColor, 0.15),
                  backgroundColor: surface3,
                }}>

                {/* Loading shimmer */}
                {!imageLoaded && !imageError && currentImage && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 animate-pulse"
                      style={{ background: `linear-gradient(135deg, ${hexToRgba(accentColor, 0.06)} 0%, ${hexToRgba(accentColor, 0.13)} 50%, ${hexToRgba(accentColor, 0.06)} 100%)` }} />
                    <div className="relative w-10 h-10 border-2 rounded-full animate-spin"
                      style={{ borderColor: hexToRgba(accentColor, 0.2), borderTopColor: accentColor }} />
                  </div>
                )}

                {/* Flowchart image */}
                {currentImage && !imageError ? (
                  <img
                    key={currentImage}
                    src={currentImage}
                    alt={`${session.title} — ${currentFlowConfig?.title ?? `flowchart ${currentImageIndex + 1}`}`}
                    className={`w-full h-full object-contain p-4 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => { setImageError(true); setImageLoaded(true); }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center mb-4"
                      style={{ borderColor: hexToRgba(accentColor, 0.3) }}>
                      <BookOpen className="h-12 w-12" style={{ color: hexToRgba(accentColor, 0.5) }} />
                    </div>
                    <p className="text-lg font-space" style={{ color: textSecondary }}>
                      Concept visualization coming soon
                    </p>
                    <p className="text-sm mt-2 font-mono" style={{ color: hexToRgba(accentColor, 0.6) }}>
                      Upload to: flowcharts/{ageGroup}/level-{levelNumber}/session-{sessionNum}/flow-1.png
                    </p>
                  </div>
                )}
              </div>

              {/* Per-flow explanation card */}
              {currentFlowConfig && (
                <div className="rounded-xl p-4 border transition-all duration-300 shrink-0"
                  style={{ borderColor: hexToRgba(accentColor, 0.2), backgroundColor: surface2 }}>
                  <p className="text-sm leading-relaxed"
                    style={{
                      color: isDark ? '#e2e8f0' : textSecondary,
                      textShadow: isDark ? `0 0 8px ${hexToRgba(accentColor, 0.4)}` : 'none',
                    }}>
                    {currentFlowConfig.explanation}
                  </p>
                  {currentFlowConfig.tip && (
                    <p className="text-xs mt-2 font-mono px-3 py-1.5 rounded-lg inline-block"
                      style={{
                        color: accentColor,
                        backgroundColor: hexToRgba(accentColor, 0.08),
                        border: `1px solid ${hexToRgba(accentColor, 0.2)}`,
                      }}>
                      {currentFlowConfig.tip}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Start Training — mobile */}
          <div className="lg:hidden mt-4 pb-4 shrink-0">
            <Button
              onClick={handleStartTraining}
              disabled={authLoading || !session.problems[0] || !isAuthenticated}
              className="w-full group text-white font-space font-bold px-8 py-6 text-base rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isAuthenticated ? accentColor : 'rgb(107, 114, 128)',
                boxShadow: isAuthenticated ? `0 4px 20px ${hexToRgba(accentColor, 0.3)}` : 'none'
              }}
            >
              {!isAuthenticated && <Lock className="mr-2 h-5 w-5" />}
              <span>{isAuthenticated ? 'Start Training' : 'Login to Start Training'}</span>
              {isAuthenticated && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
