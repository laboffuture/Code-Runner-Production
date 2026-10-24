'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, User, ChevronDown } from 'lucide-react';
import { CLOUDINARY_BASE } from '@/lib/cloudinary';
import { useAuth } from '@/contexts/AuthContext';
import { AuthTopBar, AuthTicker } from '../components/AuthChrome';

const CDN_IMAGES = {
  env: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/ENV-2.png`,
  transparent: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/transperent.png`,
  logo: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/LOFFF.png`,
  background: `${CLOUDINARY_BASE}/image/upload/f_auto,q_auto/code-runner/ui/background.webp`,
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    age_group: '11-14' as '11-14' | '15-18',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const urls = [CDN_IMAGES.env, CDN_IMAGES.transparent, CDN_IMAGES.background];
    let loaded = 0;
    urls.forEach((url) => { const img = new window.Image(); img.onload = img.onerror = () => { loaded++; if (loaded === urls.length) setImagesLoaded(true); }; img.src = url; });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens and underscores';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // The account model still requires a unique email, but we no longer
      // ask students for one — derive a stable placeholder from the
      // (already-uniqueness-checked) username instead.
      await register({
        username: formData.username,
        email: `${formData.username.trim().toLowerCase()}@coderunner.local`,
        password: formData.password,
        age_group: formData.age_group,
      });

      // Redirect to onboarding after successful registration
      // New users always have onboardingComplete: false by default
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrors({
        submit: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      <div id="app-root" className="w-full h-full overflow-hidden" style={{ position: 'fixed', inset: 0 }}>
        <div className="absolute inset-0 overflow-hidden bg-slate-200">
          <Image src={CDN_IMAGES.env} alt="Background" fill className="object-cover" priority sizes="100vw" unoptimized style={{ objectPosition: 'center' }} />
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
            <div className="sidebar-panel w-full h-full flex flex-col px-12 py-8 overflow-y-auto sidebar-slide-in">
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-8">
                  <div className="border-l-[5px] border-slate-900 pl-4"><div className="font-header text-6xl leading-[0.9] text-slate-900 uppercase">CODE<br /><span className="text-blue-600">OPS</span></div></div>
                </div>
                <form className="w-full space-y-4" onSubmit={handleSubmit}>
                  {errors.submit && <div className="text-red-500 text-xs font-mono bg-red-50 border border-red-200 rounded px-3 py-2">{errors.submit}</div>}
                  <div>
                    <label htmlFor="username" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1.5">Identification</label>
                    <div className="relative">
                      <input className="input-pill pr-11" type="text" id="username" name="username" placeholder="Enter username" value={formData.username} onChange={handleInputChange} autoComplete="username" disabled={isLoading} />
                      <User className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.username && <p className="mt-1.5 text-xs text-red-500 font-mono">{errors.username}</p>}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1.5">Access Key</label>
                    <div className="relative">
                      <input className="input-pill pr-11" type={showPassword ? 'text' : 'password'} id="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleInputChange} autoComplete="new-password" disabled={isLoading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-500 font-mono">{errors.password}</p>}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1.5">Confirm Access Key</label>
                    <div className="relative">
                      <input className="input-pill pr-11" type={showConfirm ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleInputChange} autoComplete="new-password" disabled={isLoading} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-mono">{errors.confirmPassword}</p>}
                  </div>
                  <div>
                    <label htmlFor="age_group" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1.5">Age Group</label>
                    <div className="relative">
                      <select className="input-pill pr-11 appearance-none cursor-pointer" id="age_group" name="age_group" value={formData.age_group} onChange={handleInputChange} disabled={isLoading}>
                        <option value="11-14">11-14 (CADET)</option>
                        <option value="15-18">15-18 (OPERATOR)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <button className="btn-pill w-full h-14 mt-6" type="submit" disabled={isLoading}><span className="font-mono text-base uppercase tracking-[0.3em] text-white font-bold">{isLoading ? 'Initializing...' : 'Initiate_Protocol'}</span></button>
                  <div className="mt-4 text-center"><p className="text-xs text-slate-500 font-mono">Already have clearance?{' '}<Link href="/login" className="text-cyan-600 hover:text-cyan-500 transition underline">Access System</Link></p></div>
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
          <div className="flex-1 h-full relative z-20">
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
        .scanlines { background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02)); background-size: 100% 4px; pointer-events: none; }
        @keyframes sidebar-slide-in { 0% { transform: translateX(-100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        .sidebar-panel { background: rgba(255, 255, 255, 0.92); border-right: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 6px 0 30px rgba(0, 0, 0, 0.08); width: 100%; }
        .sidebar-slide-in { animation: sidebar-slide-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .logo-burn { filter: drop-shadow(0 0 10px rgba(37,99,235,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6)) drop-shadow(0 0 30px rgba(96,165,250,0.4)); animation: burn-glow 2s ease-in-out infinite; }
        @keyframes burn-glow { 0%,100% { filter: drop-shadow(0 0 10px rgba(37,99,235,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6)) drop-shadow(0 0 30px rgba(96,165,250,0.4)); } 50% { filter: drop-shadow(0 0 20px rgba(37,99,235,1)) drop-shadow(0 0 40px rgba(59,130,246,0.8)) drop-shadow(0 0 60px rgba(96,165,250,0.6)); } }
        .input-pill { width: 100%; background: rgba(255,255,255,0.92); border: 1px solid #dbe3ef; border-radius: 9999px; color: #1e293b; font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; font-weight: 600; padding: 0.85rem 1.25rem; box-shadow: 0 2px 10px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.9); transition: border-color 0.2s var(--ease-quart), box-shadow 0.2s var(--ease-quart); }
        .input-pill::placeholder { color: #94a3b8; font-weight: 500; }
        .input-pill:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 2px 12px rgba(59,130,246,0.15); }
        .input-pill:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-pill { position: relative; overflow: hidden; border-radius: 9999px; border: 1px solid rgba(29,78,216,0.6); background: linear-gradient(180deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%); box-shadow: 0 8px 22px -8px rgba(37,99,235,0.65), inset 0 1px 0 rgba(255,255,255,0.35); transition: transform 0.1s ease-out, box-shadow 0.2s ease, filter 0.2s ease; }
        .btn-pill::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 45%, transparent 60%); transform: translateX(-120%); transition: transform 0.6s var(--ease-quart); }
        .btn-pill:hover:not(:disabled) { filter: brightness(1.06); box-shadow: 0 10px 28px -8px rgba(37,99,235,0.8), inset 0 1px 0 rgba(255,255,255,0.4); }
        .btn-pill:hover:not(:disabled)::after { transform: translateX(120%); }
        .btn-pill:active:not(:disabled) { transform: translateY(1px); }
        .btn-pill:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-pill > span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; }
        @media (prefers-reduced-motion: reduce) { .btn-pill::after { display: none; } .sidebar-slide-in { animation: none; } }
      `}</style>
    </>
  );
}
