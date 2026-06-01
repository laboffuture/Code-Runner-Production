'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { api } from '@/lib/api-client';
import { CLOUDINARY_BASE } from '@/lib/cloudinary';

type CharacterId = 'astra' | 'nila' | 'kenji' | 'leo';

// Same Cloudinary URLs as login page
const CDN_IMAGES = {
  env: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/ENV-2.png`,
  nila: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/characters/nila%20%282%29.png`,
  astro: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/characters/Astro.png`,
  kenji: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/characters/Kenji_2.png`,
  leo: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/characters/Leo.png`,
};

const CHARACTER_IMAGE: Record<CharacterId, string> = { nila: CDN_IMAGES.nila, astra: CDN_IMAGES.astro, kenji: CDN_IMAGES.kenji, leo: CDN_IMAGES.leo };

const CHARACTER_DATA: Record<CharacterId, { name: string; title: string; titleColor: string; description: string; statColor: string; borderColor: string; skills: string[]; stats: { off: number; def: number; utl: number } }> = {
  nila: { name: 'Nila', title: 'TECH WIZARD', titleColor: 'text-green-400', description: 'Elite Tech Wizard who bends code into reality.', statColor: 'green', borderColor: 'border-green-400/50', skills: ['GLITCH HUNTER', 'SENSOR SIGHT', 'AIR CODING'], stats: { off: 90, def: 40, utl: 60 } },
  astra: { name: 'ASTRA', title: 'AI AGENT', titleColor: 'text-cyan-400', description: 'Empathetic AI guide who teaches, protects, and empowers the team.', statColor: 'cyan', borderColor: 'border-purple-400/50', skills: ['MOBILITY', 'MEMORY SYNC', 'PROJECTION MODE'], stats: { off: 50, def: 70, utl: 85 } },
  kenji: { name: 'Kenji', title: 'JUNIOR ENGINEER', titleColor: 'text-orange-400', description: 'Genius junior engineer who turns scrap into solutions in seconds.', statColor: 'orange', borderColor: 'border-cyan-400/50', skills: ['RAPID FAB', 'SCHEMATIC SCAN', 'OVERCLOCK'], stats: { off: 85, def: 45, utl: 70 } },
  leo: { name: 'Leo', title: 'MISSION CAPTAIN', titleColor: 'text-purple-400', description: 'Calm Mission Captain who controls chaos with logic and command.', statColor: 'purple', borderColor: 'border-orange-400/50', skills: ['LOGIC LOCK', 'HOLO FIREWALL', 'ROOT VOICE'], stats: { off: 80, def: 55, utl: 65 } },
};

const CHARACTER_ORDER: CharacterId[] = ['nila', 'astra', 'kenji', 'leo'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { setCharacter } = useTheme();
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push('/login'); }, [authLoading, isAuthenticated, router]);
  // Onboarded users reach this page only to CHANGE their character (e.g. the
  // settings "Change" button sets returnAfterOnboarding before navigating here).
  // Only bounce a genuinely-finished user to /boot when they did NOT arrive to
  // change — otherwise the picker is unreachable for returning students.
  useEffect(() => {
    if (!authLoading && user?.onboardingComplete && !sessionStorage.getItem('returnAfterOnboarding')) {
      router.push('/boot');
    }
  }, [authLoading, user, router]);
  useEffect(() => {
    const urls = Object.values(CDN_IMAGES); let loaded = 0;
    urls.forEach((url) => { const img = new window.Image(); img.onload = img.onerror = () => { loaded++; if (loaded === urls.length) setImagesLoaded(true); }; img.src = url; });
    const t = setTimeout(() => setImagesLoaded(true), 2000); return () => clearTimeout(t);
  }, []);

  const handleLockIn = async () => {
    if (!selectedCharacter) return;
    setLoading(true); setError(null);
    try {
      await api.users.selectCharacter(selectedCharacter);

      // Immediately update theme in ThemeContext (synchronous - no waiting for React state)
      setCharacter(selectedCharacter);

      // Sync AuthContext with the new character from backend before navigating
      await refreshUser();

      // Check if user came from settings page
      const returnPath = sessionStorage.getItem('returnAfterOnboarding');
      if (returnPath) {
        sessionStorage.removeItem('returnAfterOnboarding');
        router.push(returnPath);
      } else {
        // New user flow - go through boot
        router.push('/boot');
      }
    } catch (err: any) {
      console.error('Character selection error:', err);
      const errorMessage = err.message || err.details || 'Failed to save character selection.';
      setError(errorMessage);
    } finally { setLoading(false); }
  };

  if (authLoading || !isAuthenticated) return <div className="w-full h-full bg-black" style={{ position: 'fixed', inset: 0 }} />;

  return (
    <>
      <div className="w-full h-full overflow-hidden" style={{ position: 'fixed', inset: 0 }}>
        <div className="absolute inset-0 overflow-hidden bg-slate-200">
          <Image src={CDN_IMAGES.env} alt="Background" fill className="object-cover opacity-150" priority sizes="100vw" unoptimized style={{ objectPosition: 'center' }} />
          <div className="scanlines absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-white/20" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Top Bar */}
          <div className="h-14 w-full flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 relative" style={{ opacity: imagesLoaded ? 1 : 0, transition: 'opacity 0.15s ease' }}>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-60" />
            <h1 className="font-header text-xl tracking-[0.2em] font-bold text-slate-800 uppercase">Select Your <span className="text-blue-600">Agent</span></h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Shadowburn Active</span>
            </div>
          </div>

          {/* Character Cards */}
          <div className="flex-1 h-full flex bg-black/50 z-20" style={{ opacity: imagesLoaded ? 1 : 0, transform: imagesLoaded ? 'scale(1)' : 'scale(0.95)', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            {CHARACTER_ORDER.map((id) => {
              const c = CHARACTER_DATA[id];
              return (
                <div key={id} className={`squad-card ${selectedCharacter === id ? 'selected' : ''}`} onClick={() => { setSelectedCharacter(id); setError(null); }}>
                  <Image src={CHARACTER_IMAGE[id]} alt={c.name} fill unoptimized className="opacity-90 object-cover object-top" priority sizes="25vw" />
                  <div className="card-info-overlay">
                    <span className={`${c.titleColor} font-bold tracking-widest text-xs`}>{c.title}</span>
                    <h3 className="text-2xl font-bold tracking-wide mb-2 text-white uppercase mt-2">{c.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">{c.skills.map((s) => <span key={s} className="text-[9px] px-1.5 py-0.5 border border-white/20 rounded bg-white/5 text-gray-300 font-mono">{s}</span>)}</div>
                    <div className="card-stats-expanded">
                      <p className={`text-xs text-gray-400 leading-relaxed mb-3 border-l-2 ${c.borderColor} pl-2`}>{c.description}</p>
                      <div className="space-y-1.5">
                        <StatBar label="OFF" value={c.stats.off} color={c.statColor} />
                        <StatBar label="DEF" value={c.stats.def} color={c.statColor} />
                        <StatBar label="UTL" value={c.stats.utl} color={c.statColor} />
                      </div>
                    </div>
                  </div>
                  <SelectionIndicator />
                </div>
              );
            })}
          </div>

          {/* Bottom Bar */}
          <div className="bottom-bar-selection" style={{ opacity: imagesLoaded ? 1 : 0, transform: imagesLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.2s ease', transitionDelay: '0.3s' }}>
            <div className="w-1/3 px-6 flex items-center border-r border-slate-300 h-full bg-slate-50"><span className="text-xs font-bold text-slate-700 uppercase tracking-wide">CLICK TO SELECT</span></div>
            <div className="w-1/3 flex flex-col items-center justify-center h-full px-4 relative bg-white">
              <div className="absolute inset-0 bg-blue-100 skew-x-[-8deg] opacity-30 mx-8" />
              {error && <p className="text-xs text-red-500 mb-1 relative z-10">{error}</p>}
              <button className={`btn-skew h-9 w-full max-w-sm relative z-10 ${!selectedCharacter || loading ? 'opacity-40' : 'btn-enabled'}`} disabled={!selectedCharacter || loading} onClick={handleLockIn}>
                <span className="font-header text-base uppercase tracking-widest flex items-center justify-center gap-2 text-slate-800">{loading ? 'Locking In...' : 'Lock In Agent'}</span>
              </button>
            </div>
            <div className="w-1/3 px-6 flex items-center justify-end h-full bg-slate-50">
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" /><span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Shadowburn Active</span></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap');
        :root { --ease-quart: cubic-bezier(0.165, 0.84, 0.44, 1); }
        body { font-family: 'Rajdhani', sans-serif; overflow: hidden; height: 100vh; width: 100vw; margin: 0; padding: 0; }
        .font-header { font-family: 'Oswald', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .scanlines { background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02)); background-size: 100% 4px; pointer-events: none; }
        .squad-card { position: relative; flex: 1; height: 100%; overflow: hidden; border-left: 1px solid rgba(255,255,255,0.1); transition: all 0.4s var(--ease-quart); cursor: pointer; }
        .squad-card:first-child { border-left: none; }
        .squad-card:hover { flex: 1.5; border-left: 1px solid #3b82f6; }
        .squad-card:first-child:hover { border-left: none; }
        .squad-card.selected { flex: 1.5; }
        .card-info-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem; z-index: 20; background: linear-gradient(to top, rgba(0,0,0,0.95), transparent); transition: all 0.4s ease; pointer-events: none; }
        .squad-card:hover .card-info-overlay, .squad-card.selected .card-info-overlay { bottom: 60px; padding: 2rem 1.5rem; background: linear-gradient(to top, rgba(0,0,0,0.98) 60%, rgba(0,0,0,0.7), transparent); }
        .card-stats-expanded { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease, margin-top 0.4s ease; }
        .squad-card:hover .card-stats-expanded, .squad-card.selected .card-stats-expanded { max-height: 200px; opacity: 1; margin-top: 0.5rem; }
        .selection-indicator { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); border: 2px solid rgba(255,255,255,0.6); box-shadow: 0 0 40px rgba(255,255,255,0.4), inset 0 0 40px rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; z-index: 100; overflow: hidden; }
        .selection-indicator::before { content: ""; position: absolute; top: -100%; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%); animation: scan 2s linear infinite; }
        @keyframes scan { 0% { top: -100%; } 100% { top: 100%; } }
        .squad-card.selected .selection-indicator { opacity: 1; }
        .bottom-bar-selection { position: fixed; bottom: 0; left: 0; width: 100%; height: 50px; background: #ffffff; border-top: 2px solid #e2e8f0; box-shadow: 0 -4px 20px rgba(0,0,0,0.1); display: flex; flex-direction: row; align-items: center; z-index: 1000; }
        .btn-skew { transform: skewX(-12deg); transition: all 0.1s ease-out; background: white; border: 1px solid #bfdbfe; color: #0f172a; }
        .btn-skew > span { transform: skewX(12deg); display: block; }
        .btn-skew:hover:not(:disabled) { background: #06b6d4; border-color: #06b6d4; box-shadow: 0 0 0 2px rgba(6,182,212,0.3); }
        .btn-skew:disabled { cursor: not-allowed; }
        .btn-skew.btn-enabled { background: linear-gradient(135deg, #3b82f6, #2563eb) !important; border: 2px solid #3b82f6 !important; box-shadow: 0 0 30px rgba(59,130,246,0.6) !important; animation: pulse-glow 2s ease-in-out infinite !important; }
        .btn-skew.btn-enabled > span { color: white !important; }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 30px rgba(59,130,246,0.6); } 50% { box-shadow: 0 0 50px rgba(59,130,246,0.9); } }
      `}</style>
    </>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const c: Record<string, string> = { blue: 'bg-blue-400', purple: 'bg-purple-400', cyan: 'bg-cyan-400', orange: 'bg-orange-400', green: 'bg-green-400' };
  return (
    <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest">
      <span className="w-8 text-gray-400">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-sm overflow-hidden"><div className={`h-full ${c[color] || 'bg-cyan-400'} shadow-[0_0_10px_currentColor]`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function SelectionIndicator() {
  return (<div className="selection-indicator"><div className="text-6xl">✓</div><div className="text-sm font-mono tracking-widest mt-2">AGENT LOCKED</div></div>);
}
