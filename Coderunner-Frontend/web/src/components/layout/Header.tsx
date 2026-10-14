'use client';

import Link from 'next/link';
import { Terminal, Cpu, Activity, Zap, User, Power, Settings, LogOut, LayoutDashboard, KeyRound, Bug, HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { Leaderboard } from '@/components/lists/Leaderboard';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { SoundToggle } from '@/components/audio/SoundToggle';
import { NovasChip } from '@/components/novas/NovasChip';
import { NOVAS } from '@/lib/novas';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getCharacterEmblem } from '@/lib/view-backgrounds';
import { ReportModal } from '@/components/support/ReportModal';

export function Header() {
  const { playProjectTextSound } = useGlobalAudio();
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isDeveloper, user } = useAuth();
  const { theme } = useTheme(); // Get character theme
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [reportType, setReportType] = useState<'bug_report' | 'doubt' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  // Initialize Railway theme immediately based on pathname to prevent flash
  const [isRailwayTheme, setIsRailwayTheme] = useState(() => {
    return pathname?.includes('/profile') || pathname?.includes('/rank') || false;
  });

  // Initialize currentAgeGroup based on pathname to prevent flash
  const [currentAgeGroup, setCurrentAgeGroup] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !pathname) return null;
    if (pathname.includes('/11-14') ||
        pathname.includes('/introduction') || pathname.includes('/code-convergence') ||
        pathname.includes('/cheat-sheet')) {
      return '11-14';
    }
    if (pathname.includes('/problems/')) {
      return typeof window !== 'undefined' ? localStorage.getItem('currentAgeGroup') : null;
    }
    return null;
  });

  // Check if we're on 11-14 age group pages or if age group is stored
  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    // Check for profile or rank page - use Railway theme
    if (pathname.includes('/profile') || pathname.includes('/rank')) {
      setIsRailwayTheme(true);
      setCurrentAgeGroup(null);
      return;
    } else {
      setIsRailwayTheme(false);
    }

    // Check pathname first
    if (pathname.includes('/11-14') || pathname.includes('/introduction') || pathname.includes('/code-convergence') || pathname.includes('/cheat-sheet')) {
      // Apply blue theme for 11-14 age group pages, introduction pages, code convergence, cheat sheet
      setCurrentAgeGroup('11-14');
      localStorage.setItem('currentAgeGroup', '11-14');
    } else if (pathname === '/home' || pathname === '/' || pathname === '/compiler') {
      // Clear age group for main pages - they should use default red theme
      setCurrentAgeGroup(null);
      localStorage.removeItem('currentAgeGroup');
    } else if (pathname.includes('/problems/')) {
      // For problem pages, check localStorage
      const stored = localStorage.getItem('currentAgeGroup');
      setCurrentAgeGroup(stored);
    } else {
      // For other pages, clear the age group
      setCurrentAgeGroup(null);
      localStorage.removeItem('currentAgeGroup');
    }
  }, [pathname]);

  // Header background is always dark (accentDark20), so text is always light
  const useBlackText = false;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Darken the header background once the page is scrolled past ~10%.
  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setIsScrolled(pct >= 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsDropdownOpen(false);
  };

  // Always use CSS variables set synchronously by ThemeContext's useLayoutEffect — no flash.
  const accentColor  = 'var(--accent)';
  const accentDark   = 'var(--accent-dark)';
  const accent05     = 'var(--accent-5)';
  const accent10     = 'var(--accent-10)';
  const accent20     = 'var(--accent-20)';
  const accent40     = 'var(--accent-40)';
  const accentDark20 = 'var(--accent-dark-20)';
  const accentDark90 = 'var(--accent-dark-90)';

  return (
    <header
      className="sticky top-0 z-50 w-full border-b rounded-t-2xl"
      style={{
        backgroundColor: pathname?.includes('/introduction') ? 'rgba(5, 8, 18, 0.97)' : accentDark20,
      }}
    >
      {/* Scroll-reactive header background: solid dark once scrolled, accent
          gradient at the top. Intentionally flat — the prior backdrop-blur, the
          accent border tint, and the HUD corner brackets were dropped for a
          cleaner header; the never-defined header-bg-new/scrolled classes went
          with them. */}
      <div
        className="absolute inset-0 rounded-t-2xl"
        style={{
          background: isScrolled
            ? '#000000d1'
            : `linear-gradient(to right, ${accent05}, transparent, ${accent05})`,
        }}
      ></div>

      <div className="container flex h-16 max-w-screen-2xl items-center justify-between relative z-10">
        {/* Logo Section */}
        <div className="flex items-center space-x-4 flex-1">
          <Link href="/home" className="flex items-center space-x-3 group">
            <div className="relative">
              <Terminal className="h-7 w-7 group-hover:animate-pulse" style={{
                color: accentColor
              }} />
              <div className="absolute -inset-1 rounded blur opacity-0 group-hover:opacity-100 transition-opacity" style={{
                backgroundColor: accent20
              }}></div>
            </div>
            <div className="flex flex-col">
              <span className="font-space font-bold text-lg transition-all group-hover:glow-text" style={{
                color: useBlackText ? '#000000' : '#f3ede9'
              }}>
                CODE RUNNER
              </span>
              <span className="font-mono text-xs opacity-80" style={{
                color: accentColor
              }}>
                v2.847.x
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation - Centered */}
        <nav className="flex items-center space-x-6">
          {[
            { href: '/home', label: 'HOME' },
            { href: '/compiler', label: 'COMPILER' },
            { href: '/rank', label: 'LEADERBOARD' },
            { href: '/contest', label: 'CONTEST' },
            { href: '/challenge', label: 'CHALLENGE ME' },
            ...(NOVAS.VISIBLE ? [{ href: '/store', label: 'STORE' }] : [])
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative group px-4 py-2 text-sm font-space font-medium transition-all duration-300"
              style={{ color: useBlackText ? '#000000' : '#f3ede9' }}
              onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
              onMouseLeave={(e) => e.currentTarget.style.color = useBlackText ? '#000000' : '#f3ede9'}
              onClick={() => playProjectTextSound()}
            >
              <span className="relative z-10">{item.label}</span>
              <div
                className="absolute inset-0 border rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundColor: accent10,
                  borderColor: accent20
                }}
              ></div>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Novas balance (✨) — releasing soon */}
          <NovasChip />

          {/* Sound Toggle */}
          <SoundToggle />

          {/* User Avatar with Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              className="relative group"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                playProjectTextSound();
              }}
            >
              <Avatar
                className="h-10 w-10 border-2 transition-colors cursor-pointer"
                style={{
                  borderColor: accent40
                }}
              >
                {/* Selected character's emblem; falls back to the User icon
                    until that character's profile art is uploaded. Header is
                    rendered fresh on every page (not a shared layout), so this
                    remounts on every navigation — delayMs keeps the fallback
                    icon from flashing in first while the (browser-cached, same
                    URL every time) real image finishes its own reload. */}
                <AvatarImage data-ai-hint="character emblem" src={getCharacterEmblem(theme.id) ?? undefined} alt={theme.name} />
                <AvatarFallback delayMs={600} className="bg-slate-800 font-space" style={{
                  color: accentColor
                }}>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -inset-1 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" style={{
                backgroundColor: accent20
              }}></div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border backdrop-blur-xl overflow-hidden"
                style={{
                  backgroundColor: accentDark90,
                  borderColor: accent20,
                  zIndex: 100
                }}
              >
                {isDeveloper && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 px-4 py-3 transition-colors text-amber-400 border-b"
                    style={{ borderColor: accent20 }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent10}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      playProjectTextSound();
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm font-space">Developer Dashboard</span>
                  </Link>
                )}

                {user?.role === 'student' && (
                  <Link
                    href="/join-class"
                    className="flex items-center gap-3 px-4 py-3 transition-colors text-white"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent10}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      playProjectTextSound();
                    }}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span className="text-sm font-space">Join a Class</span>
                  </Link>
                )}

                {user?.role === 'student' && (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-white"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent10}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      setReportType('doubt');
                      setIsDropdownOpen(false);
                      playProjectTextSound();
                    }}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm font-space">Ask a doubt</span>
                  </button>
                )}

                {user?.role === 'student' && (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-white"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent10}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      setReportType('bug_report');
                      setIsDropdownOpen(false);
                      playProjectTextSound();
                    }}
                  >
                    <Bug className="w-4 h-4" />
                    <span className="text-sm font-space">Report a bug</span>
                  </button>
                )}

                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 transition-colors text-white"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent10}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    playProjectTextSound();
                  }}
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-space">Profile</span>
                </Link>

                <Link
                  href="/profile/settings"
                  className="flex items-center gap-3 px-4 py-3 transition-colors text-white"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accent10}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    playProjectTextSound();
                  }}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-space">Settings</span>
                </Link>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-red-400 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-space">Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Scanning Line Effect */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-full opacity-60 animate-pulse"
        style={{
          background: accentColor
        }}
      ></div>

      <ReportModal
        type={reportType ?? 'doubt'}
        open={reportType !== null}
        onClose={() => setReportType(null)}
      />
    </header>
  );
}
