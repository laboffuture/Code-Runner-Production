'use client';

import { Header } from '@/components/layout/Header';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import FloatingParticles from '@/components/ui/FloatingParticles';
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  ChevronLeft,
  User,
} from 'lucide-react';

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
        <FloatingParticles color={theme.colors.primary} />

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

            {/* ── Cards (centered readable column — was left-pinned via max-w-7xl with no mx-auto) ── */}
            <div className="max-w-5xl mx-auto space-y-6">

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

            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
