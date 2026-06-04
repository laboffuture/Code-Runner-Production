'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Star } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useAnimations } from '@/hooks/useAnimations';
import { usePageAudio } from '@/hooks/usePageAudio';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getMissionCardImage } from '@/lib/view-backgrounds';
import FloatingParticles from '@/components/ui/FloatingParticles';

function AgeSelectionPageContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { theme } = useTheme(); // Get current character theme

  // Check authentication and session boot status
  useEffect(() => {
    if (authLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login?redirect=/home');
      return;
    }

    // Staff (teacher/developer) don't belong on the student home — route them
    // through the root page, which dispatches to /admin or /teacher by role.
    if (user && user.role !== 'student') {
      router.push('/');
      return;
    }
    // First-time students must finish onboarding (character selection) before home.
    if (user && !user.onboardingComplete) {
      router.push('/onboarding');
      return;
    }

    // If authenticated but hasn't gone through boot sequence this session, redirect to boot
    const sessionBooted = sessionStorage.getItem('sessionBooted');
    if (!sessionBooted) {
      router.push('/boot');
      return;
    }
  }, [isAuthenticated, authLoading, user, router]);
  const { 
    playCardHover, 
    playButtonClick,
    playBeepsSound,
    playProjectTextSound
  } = useGlobalAudio();
  
  
  // Use the new page audio hook for smooth transitions
  usePageAudio({ audioType: 'background' });

  const {
    createFloatingParticles,
    animateHeroEntrance,
    animateCardsEntrance,
    animateCardHover,
    addGlitchEffect,
    isLoaded
  } = useAnimations();

  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean;
    cardType: 'novice' | 'advanced' | null;
  }>({
    isLoading: false,
    cardType: null
  });

  // Initialize animations and background when loaded
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        // Start entrance animations
        animateHeroEntrance();
        animateCardsEntrance();
        addGlitchEffect();
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isLoaded]);

  const handleCardHover = (e: React.MouseEvent<HTMLAnchorElement>, isEntering: boolean) => {
    playCardHover();
    if (isLoaded) {
      animateCardHover(e.currentTarget as HTMLElement, isEntering);
    }
    
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, cardType: 'novice' | 'advanced') => {
    e.preventDefault();
    playProjectTextSound(); // Play deploy click sound for training protocols

    // Show loading state
    setLoadingState({
      isLoading: true,
      cardType
    });

    // Simulate loading data, then navigate
    setTimeout(() => {
      router.push(href);
    }, 1500); // 1.5 seconds of loading
  };

  const ageGroups = [
    {
      title: 'Mission Card 1',
      href: '/levels/11-14',
      cardType: 'novice' as const,
      ageGroup: '11-14',
    },
    {
      title: 'Mission Card 2',
      href: '/levels/15-18',
      cardType: 'advanced' as const,
      ageGroup: '15-18',
    },
  ];

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#12100f' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto" style={{ borderColor: theme.colors.primary }}></div>
          <p className="mt-4 text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden" style={{ backgroundColor: '#12100f', color: '#f3ede9' }}>
      {/* Character Themed Background */}
      <div
        className="fixed inset-0 z-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url("${theme.wallpaper}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Grid Overlay */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 240, 230, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 240, 230, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      ></div>

      {/* Floating Particles Container - CSS-based, lightweight */}
      <FloatingParticles color={theme.colors.primary} />
      
      <Header />
      
      <main className="flex-1 flex flex-col justify-center container mx-auto px-4 py-4 relative z-10 overflow-hidden">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-3" style={{
            backgroundColor: `${theme.colors.primary}20`,
            borderColor: `${theme.colors.primary}50`
          }}>
            <Star className="w-4 h-4 animate-pulse" style={{ color: theme.colors.primary }} />
            <span className="text-sm font-space font-medium" style={{ color: '#ffffff' }}>INITIATE PROTOCOL</span>
            <Star className="w-4 h-4 animate-pulse" style={{ color: theme.colors.primary }} />
          </div>

          <h1 className="text-5xl md:text-6xl font-space font-black tracking-tight mb-2 glitch-text" style={{ color: '#f3ede9' }}>
            CODE RUNNER
          </h1>
          <div className="text-xl font-space mb-2 font-semibold" style={{ color: theme.colors.primary }}>
            Programming Interface
          </div>
          <p className="text-sm max-w-3xl mx-auto leading-relaxed mb-4" style={{ color: '#f3ede9', opacity: 0.8 }}>
            Welcome to Code Runner, your gateway to the Python training matrix.
            Select your clearance level, execute your code, and unlock your coding potential.
          </p>
        </div>

        {/* Mission Selection Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ageGroups.map((group) => (
            <Link
              href={group.href}
              key={group.title}
              className="block group"
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
              onClick={(e) => handleCardClick(e, group.href, group.cardType)}
            >
              {/* Clickable themed Mission-Card image. The art IS the card, so no
                  CSS frame/shadow — just the image (themed per character + age
                  group; falls back to the default art when not yet themed). */}
              <div className="relative transition-all duration-500 hover:scale-105 cursor-pointer">
                <img
                  src={getMissionCardImage(theme.id, group.ageGroup)}
                  alt={group.title || "Mission Card"}
                  className="w-full h-auto"
                />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}

      {/* Simple CSS Loading Overlay - No Three.js */}
      {loadingState.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center">
            {/* Animated Loading Ring */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: `${theme.colors.primary}30` }}></div>
              <div className="absolute inset-0 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: theme.colors.primary }}></div>
              <div className="absolute inset-2 border-2 border-transparent rounded-full animate-spin" style={{
                borderTopColor: theme.colors.primary,
                animationDirection: 'reverse',
                animationDuration: '1.5s'
              }}></div>
            </div>
            {/* Loading Text */}
            <p className="font-mono text-sm animate-pulse" style={{ color: theme.colors.primary }}>
              {`// Initializing ${loadingState.cardType?.toUpperCase()} protocol...`}
            </p>
          </div>
        </div>
      )}


    </div>
  );
}

export default function AgeSelectionPage() {
  return <AgeSelectionPageContent />;
}