'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, User } from 'lucide-react';
import { CLOUDINARY_BASE } from '@/lib/cloudinary';
import { useAuth } from '@/contexts/AuthContext';

const CDN_IMAGES = {
  env: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/ENV-2.png`,
  transparent: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/transperent.png`,
  logo: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/LOF_SVG.svg`,
  background: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/background.webp`,
};

const PYTHON_QUOTES = [
  "The universe doesn't speak magic. It speaks Python.",
  "Every mission begins with Python.",
  "Stars are distant. Python brings them closer.",
  "Python turns curiosity into control.",
  "When systems fail, Python explains why.",
  "Python is not code. It's clarity.",
  "Each line of Python pushes you closer to orbit.",
  "Python rewards precision.",
  "In space, guesswork fails. Python succeeds.",
  "Python is how explorers think.",
  "Python errors are signals, not setbacks.",
  "Python doesn't break. It teaches.",
  "Fix the Python. Stabilize the mission.",
  "Mission complete. Python executed successfully.",
  "New clearance unlocked through Python.",
  "Python systems online.",
  "You didn't run Python. You mastered it.",
  "Exploration begins with Python.",
  "Python turned imagination into reality.",
  "Welcome to the Python frontier."
];

const NEWS_MESSAGES = [
  '<span class="text-cyan-400">PRIORITY TRANSMISSION:</span> SERVERS STABLE ACROSS ALL REGIONS',
  'DOUBLE XP WEEKEND ACTIVE',
  '<span class="text-red-500">WARNING:</span> HIGH LATENCY DETECTED ON NODE-09',
  'WELCOME TO PROJECT NOVA',
  '<span class="text-green-500">SUCCESS:</span> SECURITY PATCH 10.7.4 DEPLOYED',
  '<span class="text-cyan-400">ALERT:</span> MAINTENANCE SCHEDULED FOR 02:00 UTC',
  '<span class="text-yellow-500">BONUS:</span> WEEKLY CHALLENGES REFRESHED',
  'GLOBAL TOURNAMENT REGISTRATIONS NOW OPEN',
  '<span class="text-green-500">ONLINE:</span> 147,832 OPERATORS ACTIVE',
  '<span class="text-green-500">STABLE:</span> ALL GAME MODES OPERATIONAL',
  '<span class="text-cyan-400">AI NEWS:</span> NVIDIA RTX 5090 GPU ANNOUNCED WITH 24GB VRAM',
  '<span class="text-green-500">BREAKTHROUGH:</span> GPT-5 ACHIEVES 99% ACCURACY ON CODING TASKS',
  'OPENAI RELEASES NEW MULTIMODAL AI MODEL',
  '<span class="text-green-500">ONLINE:</span> GITHUB COPILOT NOW SUPPORTS 25 LANGUAGES',
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newsFeed, setNewsFeed] = useState('');
  const [pythonQuote, setPythonQuote] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // After auth (already-authenticated or just-logged-in): staff (teacher/developer)
  // route to the root page, which dispatches by role. Students honor a same-origin
  // ?redirect= deep link if present, gated by onboarding; otherwise the root page
  // routes them. Only same-origin relative paths are allowed — reject protocol-
  // relative (//host) and backslash (/\) forms so a crafted ?redirect= can't
  // open-redirect to an external site.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Staff (teacher/developer) have no student destination. Route them through
      // the root page (the single role-routing authority), which dispatches to
      // /admin/dashboard or /teacher by role — never into a student ?redirect=
      // deep link or the student onboarding flow. Checked first so a ?redirect= is
      // never even parsed for staff.
      if (user && user.role !== 'student') {
        router.push('/');
        return;
      }
      const raw = new URLSearchParams(window.location.search).get('redirect');
      const dest = raw && raw.startsWith('/') && !raw.startsWith('//') && raw[1] !== '\\' ? raw : '/';
      // Un-onboarded students must pick a character first. Honoring a ?redirect=
      // deep link directly would skip this, so re-assert it here; returnAfterOnboarding
      // hands the intended destination to the onboarding page, which consumes it.
      if (user && !user.onboardingComplete) {
        if (dest !== '/') sessionStorage.setItem('returnAfterOnboarding', dest);
        router.push('/onboarding');
        return;
      }
      router.push(dest);
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const urls = [CDN_IMAGES.env, CDN_IMAGES.transparent, CDN_IMAGES.background];
    let loaded = 0;
    urls.forEach((url) => { const img = new window.Image(); img.onload = img.onerror = () => { loaded++; if (loaded === urls.length) setImagesLoaded(true); }; img.src = url; });
  }, []);

  useEffect(() => {
    const shuffled = [...NEWS_MESSAGES].sort(() => Math.random() - 0.5).slice(0, 10);
    setNewsFeed(shuffled.map(msg => `// ${msg}`).join(' // '));
  }, []);

  useEffect(() => {
    setPythonQuote(PYTHON_QUOTES[Math.floor(Math.random() * PYTHON_QUOTES.length)]);
    const interval = setInterval(() => setPythonQuote(PYTHON_QUOTES[Math.floor(Math.random() * PYTHON_QUOTES.length)]), 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim() || !password.trim()) { setLoginError('Username and password are required'); return; }
    setIsSubmitting(true);
    try {
      await login(username, password);
      // useEffect above handles redirect based on onboardingComplete
    } catch (error: any) {
      const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
      setLoginError(
        isNetworkError
          ? 'Cannot connect to server. Please ensure the backend is running and try again.'
          : error.message || 'Login failed. Check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div id="app-root" className="w-full h-full overflow-hidden" style={{ position: 'fixed', inset: 0 }}>
        <div className="absolute inset-0 overflow-hidden bg-slate-200">
          <Image src={CDN_IMAGES.env} alt="Background" fill className="object-cover opacity-150" priority sizes="100vw" unoptimized style={{ objectPosition: 'center' }} />
          <div className="scanlines absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 60%, rgba(30, 41, 59, 0.2) 100%)' }} />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Top Bar */}
          <div className="h-14 w-full flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 relative" style={{ opacity: imagesLoaded ? 1 : 0, visibility: imagesLoaded ? 'visible' : 'hidden', transition: 'opacity 0.15s ease, visibility 0.15s ease' }}>
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-60" />
            <h1 className="font-header text-xl tracking-[0.2em] font-bold text-slate-800 uppercase">Project: <span className="text-blue-600">Nova</span></h1>
            <div className="hidden md:flex items-center justify-center flex-1 ml-8">
              <div className="learning-badge-container"><div className="learning-badge">
                <div className="learning-badge-corner top-left"></div><div className="learning-badge-corner top-right"></div>
                <div className="learning-badge-corner bottom-left"></div><div className="learning-badge-corner bottom-right"></div>
                <div className="learning-badge-content"><span className="font-header text-sm tracking-[0.15em] font-bold text-slate-700 uppercase leading-relaxed quote-text">{pythonQuote}</span></div>
              </div></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] font-bold text-cyan-600">ENCRYPTION: ACTIVE</div>
                <div className="font-tech text-lg font-bold text-slate-700">{currentTime.split(':').map((p, i) => <span key={i}>{p}{i < 2 && <span className="animate-pulse">:</span>}</span>)}<span className="text-cyan-600 ml-1">ZULU</span></div>
              </div>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-cyan-50 transition-all sound-button">
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 sound-ring" />
                <div className="relative z-10">{soundEnabled ? <svg className="w-4 h-4 text-slate-700 group-hover:text-cyan-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z"/><path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z"/></svg> : <svg className="w-4 h-4 text-slate-400 group-hover:text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75z"/><path d="M12.22 5.22a.75.75 0 011.06 0l2 2 2-2a.75.75 0 111.06 1.06l-2 2 2 2a.75.75 0 11-1.06 1.06l-2-2-2 2a.75.75 0 01-1.06-1.06l2-2-2-2a.75.75 0 010-1.06z"/></svg>}</div>
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 flex overflow-hidden">
            <div className="w-[30%] h-full relative z-10" style={{ clipPath: 'inset(0)', contain: 'layout paint' }}>
              <div className={`sidebar-panel w-full h-full flex flex-col px-12 py-10 ${imagesLoaded ? 'sidebar-slide-in' : 'sidebar-hidden'}`}>
                <div className="sidebar-content" style={{ opacity: imagesLoaded ? 1 : 0, visibility: imagesLoaded ? 'visible' : 'hidden' }}>
                  <div className="mb-20">
                    <div className="mb-20"><Image src={CDN_IMAGES.transparent} alt="Logo" width={120} height={120} className="h-30 w-auto object-contain logo-burn" unoptimized priority /></div>
                    <div className="border-l-[5px] border-slate-900 pl-4"><div className="font-header text-5xl leading-[0.9] text-slate-900 uppercase">CODE<br /><span className="text-blue-600">OPS</span></div></div>
                  </div>
                  <form className="w-full space-y-5" onSubmit={handleLogin}>
                    {loginError && <div className="text-red-500 text-xs font-mono bg-red-50 border border-red-200 rounded px-3 py-2">{loginError}</div>}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1.5">Identification</label>
                      <div className="relative">
                        <input className="input-pill pr-11" type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                        <User className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1.5">Access Key</label>
                      <div className="relative">
                        <input className="input-pill pr-11" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </div>
                    <button className="btn-pill w-full h-12 mt-6" type="submit" disabled={isSubmitting}><span className="font-mono text-sm uppercase tracking-[0.3em] text-white font-bold">{isSubmitting ? 'Authenticating...' : 'Initiate_Session'}</span></button>
                    <div className="mt-4 text-center"><p className="text-xs text-slate-500 font-mono">New Operative?{' '}<Link href="/register" className="text-cyan-600 hover:text-cyan-500 transition underline">Register Here</Link></p></div>
                  </form>
                  <div className="mt-auto pt-20 border-t border-slate-300/40">
                    <div className="flex flex-col items-center gap-0">
                      <span className="text-base font-mono uppercase tracking-[0.15em] font-bold">Developed by</span>
                      <div className="w-full flex justify-center -mt-8"><Image src={CDN_IMAGES.logo} alt="LOF Logo" width={140} height={140} className="h-28 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity" unoptimized /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 h-full relative z-20" style={{ opacity: imagesLoaded ? 1 : 0, visibility: imagesLoaded ? 'visible' : 'hidden', transition: 'opacity 0.3s ease', transitionDelay: '0.2s' }}>
              <div className="w-full h-full relative overflow-hidden"><Image src={CDN_IMAGES.background} alt="Background" fill unoptimized className="object-cover" priority sizes="70vw" /></div>
            </div>
          </div>

          {/* Bottom Ticker */}
          <div className="h-12 w-full bg-slate-900 border-t border-slate-700 flex items-center z-50" style={{ opacity: imagesLoaded ? 1 : 0, visibility: imagesLoaded ? 'visible' : 'hidden', transform: imagesLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.2s ease', transitionDelay: '0.3s' }}>
            <div className="flex items-center gap-3 px-6 h-full border-r border-slate-700 bg-slate-800"><div className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE</div><div className="font-mono text-[10px] text-slate-400">NEWS FEED: ORBITAL_CHANNEL</div></div>
            <div className="flex-1 overflow-hidden relative flex items-center bg-slate-950"><div className="ticker font-mono text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: newsFeed }} /></div>
            <div className="px-6 flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider"><span>MATCHMAKING: <span className="text-slate-300">IDLE</span></span><span>VOICE_COMMS: <span className="text-green-500">SECURE</span></span><span>ANTI-CHEAT: <span className="text-blue-500">ONLINE</span></span></div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap');
        :root { --ease-quart: cubic-bezier(0.165, 0.84, 0.44, 1); }
        body { font-family: 'Rajdhani', sans-serif; overflow: hidden; height: 100vh; width: 100vw; margin: 0; padding: 0; }
        .font-header { font-family: 'Oswald', sans-serif; }
        .font-tech { font-family: 'Rajdhani', sans-serif; }
        .scanlines { background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02)); background-size: 100% 4px; pointer-events: none; }
        @keyframes sidebar-slide-in { 0% { transform: translateX(-100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        .sidebar-panel { background: rgba(255, 255, 255, 0.92); border-right: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 6px 0 30px rgba(0, 0, 0, 0.08); width: 100%; }
        .sidebar-hidden { opacity: 0 !important; visibility: hidden !important; transform: translateX(-100%) !important; pointer-events: none !important; }
        .sidebar-hidden .sidebar-content { display: none !important; }
        .sidebar-slide-in { animation: sidebar-slide-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .sidebar-slide-in .sidebar-content { display: flex !important; flex-direction: column !important; }
        .sidebar-panel > *, .sidebar-panel .sidebar-content { width: 100%; }
        .logo-burn { filter: drop-shadow(0 0 10px rgba(37,99,235,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6)) drop-shadow(0 0 30px rgba(96,165,250,0.4)); animation: burn-glow 2s ease-in-out infinite; }
        @keyframes burn-glow { 0%,100% { filter: drop-shadow(0 0 10px rgba(37,99,235,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6)) drop-shadow(0 0 30px rgba(96,165,250,0.4)); } 50% { filter: drop-shadow(0 0 20px rgba(37,99,235,1)) drop-shadow(0 0 40px rgba(59,130,246,0.8)) drop-shadow(0 0 60px rgba(96,165,250,0.6)); } }
        .input-pill { width: 100%; background: rgba(255,255,255,0.92); border: 1px solid #dbe3ef; border-radius: 9999px; color: #1e293b; font-family: 'Rajdhani', sans-serif; font-size: 1rem; font-weight: 600; padding: 0.7rem 1.25rem; box-shadow: 0 2px 10px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9); transition: border-color 0.2s var(--ease-quart), box-shadow 0.2s var(--ease-quart); }
        .input-pill::placeholder { color: #94a3b8; font-weight: 500; }
        .input-pill:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 2px 12px rgba(59,130,246,0.15); }
        .btn-pill { position: relative; overflow: hidden; border-radius: 9999px; border: 1px solid rgba(29,78,216,0.6); background: linear-gradient(180deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%); box-shadow: 0 8px 22px -8px rgba(37,99,235,0.65), inset 0 1px 0 rgba(255,255,255,0.35); transition: transform 0.1s ease-out, box-shadow 0.2s ease, filter 0.2s ease; }
        .btn-pill::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 45%, transparent 60%); transform: translateX(-120%); transition: transform 0.6s var(--ease-quart); }
        .btn-pill:hover:not(:disabled) { filter: brightness(1.06); box-shadow: 0 10px 28px -8px rgba(37,99,235,0.8), inset 0 1px 0 rgba(255,255,255,0.4); }
        .btn-pill:hover:not(:disabled)::after { transform: translateX(120%); }
        .btn-pill:active:not(:disabled) { transform: translateY(1px); }
        .btn-pill:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-pill > span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; }
        @media (prefers-reduced-motion: reduce) { .btn-pill::after { display: none; } }
        .ticker { white-space: nowrap; animation: marquee 25s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .sound-button:hover { box-shadow: 0 0 20px rgba(59,130,246,0.4); }
        .sound-ring { animation: ring-shine 3s linear infinite; box-shadow: 0 0 10px rgba(59,130,246,0.5), inset 0 0 10px rgba(59,130,246,0.3); }
        @keyframes ring-shine { 0% { border-color: #3b82f6; } 50% { border-color: #60a5fa; box-shadow: 0 0 20px rgba(96,165,250,0.8), inset 0 0 15px rgba(96,165,250,0.5); } 100% { border-color: #3b82f6; } }
        .learning-badge-container { position: relative; padding: 2px; max-width: 600px; width: 100%; }
        .learning-badge { position: relative; background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(96,165,250,0.05)); border: 1px solid rgba(59,130,246,0.3); padding: 6px 16px; backdrop-filter: blur(10px); box-shadow: 0 0 20px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.1); animation: badge-glow 3s ease-in-out infinite; }
        .learning-badge-content { display: flex; align-items: center; justify-content: center; min-height: 20px; }
        .quote-text { animation: quote-fade 8s infinite; }
        @keyframes quote-fade { 0%,90% { opacity: 1; } 95%,100% { opacity: 0.3; } }
        .learning-badge-corner { position: absolute; width: 8px; height: 8px; border: 2px solid #3b82f6; }
        .learning-badge-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .learning-badge-corner.top-right { top: -1px; right: -1px; border-left: none; border-bottom: none; }
        .learning-badge-corner.bottom-left { bottom: -1px; left: -1px; border-right: none; border-top: none; }
        .learning-badge-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }
        @keyframes badge-glow { 0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.1); } 50% { box-shadow: 0 0 30px rgba(59,130,246,0.4), inset 0 0 30px rgba(59,130,246,0.2); } }
      `}</style>
    </>
  );
}
