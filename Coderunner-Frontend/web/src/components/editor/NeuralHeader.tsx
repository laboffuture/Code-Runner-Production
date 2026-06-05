'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Moon, Sun, User, Settings, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SoundToggle } from '@/components/audio/SoundToggle';
import { useGlobalAudio } from '@/contexts/AudioContext';

interface NeuralHeaderProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  /** When set, shows a prominent "back to arena" button at top-left (problem page). */
  backHref?: string;
}

const NAV_LINKS = [
  { href: '/missions',  label: 'HOME'        },
  { href: '/compiler',  label: 'COMPILER'    },
  { href: '/rank',      label: 'LEADERBOARD' },
  { href: '/contest',   label: 'CONTEST'     },
];

export default function NeuralHeader({ backHref }: NeuralHeaderProps) {
  const { character, accentColor, accentLight } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);

  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const { logout } = useAuth();
  const router = useRouter();
  const { playProjectTextSound } = useGlobalAudio();
  const [isDark, setIsDark] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialise dark/light from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('neural-theme') || 'light';
    const dark = stored === 'dark';
    setIsDark(dark);
    const html = document.documentElement;
    if (dark) { html.classList.add('dark'); html.classList.remove('light'); }
    else       { html.classList.remove('dark'); html.classList.add('light'); }
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newDark = !isDark;
    if (newDark) { html.classList.add('dark'); html.classList.remove('light'); }
    else         { html.classList.remove('dark'); html.classList.add('light'); }
    localStorage.setItem('neural-theme', newDark ? 'dark' : 'light');
    setIsDark(newDark);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsDropdownOpen(false);
  };

  return (
    <header
      className={`neural-header relative z-50 border-b flex items-center justify-between flex-shrink-0 px-6 h-16 shadow-lg rounded-t-2xl ${
        hasCompilerTheme
          ? ''
          : 'backdrop-blur-xl bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950 border-purple-200/50 dark:border-purple-500/20 shadow-purple-500/5'
      }`}
      style={hasCompilerTheme ? {
        background:           'rgba(10, 15, 30, 0.65)',
        backdropFilter:       'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderColor:          accentRgba(0.18),
        boxShadow:            `0 1px 0 ${accentRgba(0.12)}`,
      } : {}}
    >
      {/* Accent gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-t-2xl"
        style={{ background: 'linear-gradient(to right, var(--accent-5), transparent, var(--accent-5))' }}
      />

      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 pointer-events-none rounded-tl-2xl" style={{ borderColor: 'var(--accent-40)' }} />
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 pointer-events-none rounded-tr-2xl" style={{ borderColor: 'var(--accent-40)' }} />

      {/* ── Left: Back-to-Arena + Logo ─────────────────── */}
      <div className="flex items-center gap-5 relative z-10">
        {backHref && (
          <Link href={backHref} onClick={() => playProjectTextSound()}>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-orbitron font-bold text-sm text-white transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: '#dc2626', boxShadow: '0 0 16px rgba(220, 38, 38, 0.55)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
            >
              <ArrowLeft className="w-4 h-4" />
              ARENA
            </button>
          </Link>
        )}
        <Link href="/home" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"
              style={{ background: hasCompilerTheme ? accentRgba(0.4) : 'linear-gradient(to bottom right, rgb(168 85 247), rgb(6 182 212))' }}
            />
            <Terminal
              className="relative w-9 h-9"
              style={{ color: hasCompilerTheme ? accentColor : undefined }}
            />
          </div>
          <div className="leading-tight">
            <h1
              className={`font-orbitron font-bold text-2xl tracking-tight bg-clip-text text-transparent ${
                hasCompilerTheme ? '' : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400'
              }`}
              style={hasCompilerTheme ? { backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentLight})` } : {}}
            >
              CodeRunner
            </h1>
            <p className="text-[10px] tracking-wider font-semibold" style={{ color: hasCompilerTheme ? accentRgba(0.7) : undefined }}>
              STUDIO v3.0
            </p>
          </div>
        </Link>
      </div>

      {/* ── Centre: Nav links ──────────────────────────── */}
      <nav className="flex items-center gap-1 relative z-10">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative group px-4 py-2 text-sm font-orbitron font-medium transition-all duration-300"
            style={{ color: 'rgba(203,213,225,0.8)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(203,213,225,0.8)')}
            onClick={() => playProjectTextSound()}
          >
            <span className="relative z-10">{item.label}</span>
            <div
              className="absolute inset-0 border rounded opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'var(--accent-10)', borderColor: 'var(--accent-20)' }}
            />
          </Link>
        ))}
      </nav>

      {/* ── Right: Sound + Dark-mode toggle + Avatar ──── */}
      <div className="flex items-center gap-4 relative z-10">
        {/* Sound Toggle */}
        <SoundToggle />

        {/* Dark / Light toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User avatar + dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            className="relative group"
            onClick={() => { setIsDropdownOpen(!isDropdownOpen); playProjectTextSound(); }}
          >
            <Avatar
              className="h-10 w-10 border-2 transition-colors cursor-pointer"
              style={{ borderColor: 'var(--accent-40)' }}
            >
              <AvatarImage src="https://placehold.co/100x100" alt="User" />
              <AvatarFallback className="bg-slate-800" style={{ color: accentColor }}>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute -inset-1 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'var(--accent-20)' }}
            />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border backdrop-blur-xl overflow-hidden"
              style={{ backgroundColor: 'var(--accent-dark-90)', borderColor: 'var(--accent-20)', zIndex: 100 }}
            >
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 transition-colors text-white"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-10)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => { setIsDropdownOpen(false); playProjectTextSound(); }}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-orbitron">Profile</span>
              </Link>
              <Link
                href="/profile/settings"
                className="flex items-center gap-3 px-4 py-3 transition-colors text-white"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-10)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => { setIsDropdownOpen(false); playProjectTextSound(); }}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-orbitron">Settings</span>
              </Link>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-red-400 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-orbitron">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scanning line at bottom */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-full opacity-60 animate-pulse pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }}
      />
    </header>
  );
}
