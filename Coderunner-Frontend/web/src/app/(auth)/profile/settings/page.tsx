'use client';

import { Header } from '@/components/layout/Header';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useProgress } from '@/lib/utilities/progress';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  User,
  Sparkles
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    isBackgroundMusicEnabled,
    isSoundEffectsEnabled,
    toggleBackgroundMusic,
    toggleSoundEffects
  } = useGlobalAudio();

  const progress = useProgress();
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleResetProgress = () => {
    progress.resetProgress();
    setShowResetDialog(false);
    router.push('/home');
  };

  // Floating particles — same as profile page
  useEffect(() => {
    const timer = setTimeout(() => initFloatingParticles(), 100);
    return () => clearTimeout(timer);
  }, []);

  const initFloatingParticles = () => {
    const container = document.getElementById('settings-particles');
    if (!container) return;

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : { r: 46, g: 117, b: 178 };
    };

    const base = hexToRgb(theme.colors.primary);
    const W = window.innerWidth;
    const H = window.innerHeight;
    container.innerHTML = '';
    const particles: any[] = [];

    for (let i = 0; i < 800; i++) {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;width:2px;height:2px;border-radius:50%;pointer-events:none;';
      const r = Math.floor(Math.random() * 30) + Math.max(0, base.r - 15);
      const g = Math.floor(Math.random() * 40) + Math.max(0, base.g - 20);
      const b = Math.floor(Math.random() * 50) + Math.max(0, base.b - 25);
      el.style.backgroundColor = `rgba(${r},${g},${b},${Math.random() * 0.5 + 0.2})`;
      const x = Math.random() * W;
      const y = Math.random() * H;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const p = { element: el, x, y, speed: Math.random() * 0.5 + 0.1, angle: Math.random() * Math.PI * 2 };
      particles.push(p);
      container.appendChild(el);
    }

    const animate = () => {
      particles.forEach((p) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        p.element.style.left = p.x + 'px';
        p.element.style.top = p.y + 'px';
      });
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  // Card style — matches ProfileStats exactly
  const cardCls = 'bg-white border-2 rounded-xl p-6 transition-colors';
  const cardBorder = { borderColor: `${theme.colors.light}99` };

  return (
    <ProtectedRoute>
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
        {/* Particles */}
        <div id="settings-particles" className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }} />

        <div className="relative z-10">
          <Header />

          <main className="max-w-[1600px] mx-auto px-6 py-8">

            {/* ── Page Header — matches profile page exactly ─── */}
            <div className="mb-8 flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 shrink-0"
                style={{
                  border: `1.5px solid ${theme.colors.light}99`,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-orbitron font-black mb-2 tracking-wider text-white flex items-center gap-3">
                  <Settings className="w-8 h-8" style={{ color: theme.colors.primary }} />
                  SETTINGS
                </h1>
                <p className="font-rajdhani text-gray-200">
                  Manage your preferences and account settings
                </p>
              </div>
            </div>

            {/* ── Cards ── */}
            <div className="max-w-7xl space-y-6">

              {/* ── Character ─────────────────────────────────── */}
              <div className={cardCls} style={cardBorder}>
                <h3 className="text-sm font-orbitron font-bold text-gray-700 mb-1 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: theme.colors.primary }} />
                  SELECTED CHARACTER
                </h3>
                <p className="font-rajdhani text-gray-500 text-sm mb-4">Your active agent</p>

                <div
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: `${theme.colors.primary}0f`,
                    border: `1px solid ${theme.colors.primary}40`,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-orbitron font-black text-white shrink-0"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    {theme.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-orbitron font-bold tracking-wider" style={{ color: theme.colors.primary }}>
                      {theme.name.toUpperCase()}
                    </h3>
                    <p className="text-sm font-rajdhani text-gray-500 mt-0.5">
                      {user?.selectedCharacter === 'astra' && 'AI Agent — Empathetic guide who teaches and protects'}
                      {user?.selectedCharacter === 'nila' && 'Tech Wizard — Elite coder who bends code into reality'}
                      {user?.selectedCharacter === 'kenji' && 'Junior Engineer — Genius who turns scrap into solutions'}
                      {user?.selectedCharacter === 'leo' && 'Mission Captain — Controls chaos with logic and command'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      sessionStorage.setItem('returnAfterOnboarding', '/profile/settings');
                      router.push('/onboarding');
                    }}
                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-all duration-200"
                    style={{
                      border: `1.5px solid ${theme.colors.primary}`,
                      color: theme.colors.primary,
                      backgroundColor: `${theme.colors.primary}10`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = theme.colors.primary;
                      (e.currentTarget as HTMLElement).style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = `${theme.colors.primary}10`;
                      (e.currentTarget as HTMLElement).style.color = theme.colors.primary;
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* ── Audio ─────────────────────────────────────── */}
              <div className={cardCls} style={cardBorder}>
                <h3 className="text-sm font-orbitron font-bold text-gray-700 mb-1 tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4" style={{ color: theme.colors.primary }} />
                  AUDIO SETTINGS
                </h3>
                <p className="font-rajdhani text-gray-500 text-sm mb-4">Control background music and sound effects</p>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="bg-music" className="flex items-center gap-2 font-rajdhani font-semibold text-gray-700 cursor-pointer">
                        <Music className="w-4 h-4" style={{ color: theme.colors.primary }} />
                        Background Music
                      </Label>
                      <p className="text-sm font-rajdhani text-gray-500 pl-6">Play ambient music while using the app</p>
                    </div>
                    <Switch id="bg-music" checked={isBackgroundMusicEnabled} onCheckedChange={toggleBackgroundMusic} />
                  </div>

                  <div className="h-px bg-gray-100" style={{ backgroundColor: `${theme.colors.light}33` }} />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sfx" className="flex items-center gap-2 font-rajdhani font-semibold text-gray-700 cursor-pointer">
                        {isSoundEffectsEnabled
                          ? <Volume2 className="w-4 h-4" style={{ color: theme.colors.primary }} />
                          : <VolumeX className="w-4 h-4 text-gray-400" />}
                        Sound Effects
                      </Label>
                      <p className="text-sm font-rajdhani text-gray-500 pl-6">Play sounds for button clicks and interactions</p>
                    </div>
                    <Switch id="sfx" checked={isSoundEffectsEnabled} onCheckedChange={toggleSoundEffects} />
                  </div>
                </div>
              </div>

              {/* ── Progress ───────────────────────────────────── */}
              <div className={cardCls} style={{ borderColor: '#f59e0b44', borderWidth: 2 }}>
                <h3 className="text-sm font-orbitron font-bold text-gray-700 mb-1 tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  PROGRESS MANAGEMENT
                </h3>
                <p className="font-rajdhani text-gray-500 text-sm mb-4">Manage your learning progress and data</p>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b33' }}>
                  <h4 className="text-xs font-orbitron font-bold text-yellow-600 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    DANGER ZONE
                  </h4>
                  <p className="text-sm font-rajdhani text-gray-500 mb-4">
                    Resetting your progress will clear all completed problems and levels. This action cannot be undone.
                  </p>

                  <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <AlertDialogTrigger asChild>
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-orbitron font-bold tracking-wider text-red-600 transition-all duration-200"
                        style={{ border: '1.5px solid #ef444455', backgroundColor: '#ef444408' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ef444418'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#ef444408'; }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Reset All Progress
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your progress including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>All completed problems</li>
                            <li>All completed levels</li>
                            <li>Current level progress</li>
                          </ul>
                          <p className="mt-3 font-semibold text-destructive">This action cannot be undone!</p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetProgress} className="bg-destructive hover:bg-destructive/90">
                          Yes, Reset Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* ── Account (coming soon) ──────────────────────── */}
              <div className={cardCls} style={{ ...cardBorder, opacity: 0.55 }}>
                <h3 className="text-sm font-orbitron font-bold text-gray-700 mb-1 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
                  ACCOUNT SETTINGS
                </h3>
                <p className="font-rajdhani text-gray-500 text-sm">
                  Coming soon — Email, password, and account management features.
                </p>
              </div>

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
