'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, User } from 'lucide-react';
import { CLOUDINARY_BASE } from '@/lib/cloudinary';
import { useAuth } from '@/contexts/AuthContext';
import { AuthTopBar, AuthTicker } from '../components/AuthChrome';

const CDN_IMAGES = {
  env: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/ENV-2.png`,
  transparent: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/transperent.png`,
  logo: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/LOFFF.png`,
  background: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/background.webp`,
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [imagesLoaded, setImagesLoaded] = useState(false);
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
    const urls = [CDN_IMAGES.env, CDN_IMAGES.transparent, CDN_IMAGES.background];
    let loaded = 0;
    urls.forEach((url) => { const img = new window.Image(); img.onload = img.onerror = () => { loaded++; if (loaded === urls.length) setImagesLoaded(true); }; img.src = url; });
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
          <AuthTopBar imagesLoaded={imagesLoaded} />

          {/* Main */}
          <div className="flex-1 flex overflow-hidden">
            <div className="w-[30%] h-full relative z-10" style={{ clipPath: 'inset(0)', contain: 'layout paint' }}>
              <div className={`sidebar-panel w-full h-full flex flex-col px-12 py-10 ${imagesLoaded ? 'sidebar-slide-in' : 'sidebar-hidden'}`}>
                <div className="sidebar-content" style={{ opacity: imagesLoaded ? 1 : 0, visibility: imagesLoaded ? 'visible' : 'hidden' }}>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-10">
                      <div className="border-l-[5px] border-slate-900 pl-4"><div className="font-header text-6xl leading-[0.9] text-slate-900 uppercase">CODE<br /><span className="text-blue-600">OPS</span></div></div>
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
                      <button className="btn-pill w-full h-14 mt-6" type="submit" disabled={isSubmitting}><span className="font-mono text-base uppercase tracking-[0.3em] text-white font-bold">{isSubmitting ? 'Authenticating...' : 'Initiate_Session'}</span></button>
                      <div className="mt-4 text-center"><p className="text-xs text-slate-500 font-mono">New Operative?{' '}<Link href="/register" className="text-cyan-600 hover:text-cyan-500 transition underline">Register Here</Link></p></div>
                    </form>
                  </div>
                  <div className="pt-10 border-t border-slate-300/40">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-[0.15em] font-bold text-slate-500">Developed by</span>
                      <div className="w-full flex justify-center"><Image src={CDN_IMAGES.logo} alt="LOF Logo" width={512} height={128} className="h-10 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity" unoptimized /></div>
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
          <AuthTicker imagesLoaded={imagesLoaded} />
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
        .sidebar-slide-in .sidebar-content { display: flex !important; flex-direction: column !important; height: 100% !important; }
        .sidebar-panel > *, .sidebar-panel .sidebar-content { width: 100%; }
        .logo-burn { filter: drop-shadow(0 0 10px rgba(37,99,235,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6)) drop-shadow(0 0 30px rgba(96,165,250,0.4)); animation: burn-glow 2s ease-in-out infinite; }
        @keyframes burn-glow { 0%,100% { filter: drop-shadow(0 0 10px rgba(37,99,235,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6)) drop-shadow(0 0 30px rgba(96,165,250,0.4)); } 50% { filter: drop-shadow(0 0 20px rgba(37,99,235,1)) drop-shadow(0 0 40px rgba(59,130,246,0.8)) drop-shadow(0 0 60px rgba(96,165,250,0.6)); } }
        .input-pill { width: 100%; background: rgba(255,255,255,0.92); border: 1px solid #dbe3ef; border-radius: 9999px; color: #1e293b; font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; font-weight: 600; padding: 0.85rem 1.25rem; box-shadow: 0 2px 10px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9); transition: border-color 0.2s var(--ease-quart), box-shadow 0.2s var(--ease-quart); }
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
      `}</style>
    </>
  );
}
