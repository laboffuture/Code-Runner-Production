'use client';

import { Header } from '@/components/layout/Header';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ActivityCalendar } from '@/components/profile/ActivityCalendar';
import { Achievements } from '@/components/profile/Achievements';
import { ProblemChart } from '@/components/profile/ProblemChart';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { theme } = useTheme(); // Get current character theme
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default profile built from auth user — always shown even if backend fails
  const buildDefaultProfile = (authUser: any) => ({
    id: authUser?.id || '',
    username: authUser?.username || 'Operative',
    email: authUser?.email || '',
    avatar: '',
    joinDate: authUser?.createdAt || new Date().toISOString(),
    rank: 'NOVICE',
    level: 1,
    experience: 0,
    streak: { current: 0, longest: 0, lastSubmissionDate: null },
    stats: { totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, totalSubmissions: 0, acceptedSubmissions: 0, acceptanceRate: 0 },
    contestRating: 1000,
    achievements: [],
    skills: [],
    recentActivity: [],
    submissionCalendar: [],
    topicProgress: [],
    selectedCharacter: authUser?.selectedCharacter || 'astra',
    unlockedCharacters: ['astra', 'nila', 'kenji', 'leo'],
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await api.users.getStats();
      setProfileData(data);
    } catch (err) {
      console.error('Failed to fetch profile data, using defaults:', err);
      // Fall back to default profile — never block the page
      setProfileData(buildDefaultProfile(user));
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure particles are always initialized on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      initFloatingParticles();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Initialize floating particles
  const initFloatingParticles = () => {
    const container = document.getElementById('floating-particles');
    if (!container) return;

    const numParticles = 800;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    container.innerHTML = '';
    const particles: any[] = [];

    // Convert hex color to RGB for particle variations
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 46, g: 117, b: 178 };
    };

    const baseColor = hexToRgb(theme.colors.primary);

    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '2px';
      particle.style.height = '2px';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';

      // Create variations around the character's primary color
      const redValue = Math.floor(Math.random() * 30) + Math.max(0, baseColor.r - 15);
      const greenValue = Math.floor(Math.random() * 40) + Math.max(0, baseColor.g - 20);
      const blueValue = Math.floor(Math.random() * 50) + Math.max(0, baseColor.b - 25);
      const opacity = Math.random() * 0.5 + 0.2;
      particle.style.backgroundColor = `rgba(${redValue}, ${greenValue}, ${blueValue}, ${opacity})`;

      const x = Math.random() * windowWidth;
      const y = Math.random() * windowHeight;
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';

      const particleObj = {
        element: particle,
        x: x,
        y: y,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
        size: 2
      };

      particles.push(particleObj);
      container.appendChild(particle);
    }

    // Animate particles
    let time = 0;
    const animateParticles = () => {
      time += 0.01;
      particles.forEach((particle) => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;

        if (particle.x < 0) particle.x = windowWidth;
        if (particle.x > windowWidth) particle.x = 0;
        if (particle.y < 0) particle.y = windowHeight;
        if (particle.y > windowHeight) particle.y = 0;

        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';
      });
      requestAnimationFrame(animateParticles);
    };
    requestAnimationFrame(animateParticles);
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${theme.wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Floating Particles Container */}
        <div id="floating-particles" className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }}></div>

        <div className="relative z-10">
          <Header />

          <main className="max-w-[1600px] mx-auto px-6 py-8">
            {/* Profile Header Section */}
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
                  <LayoutDashboard className="w-8 h-8" style={{ color: theme.colors.primary }} />
                  PROFILE DASHBOARD
                </h1>
                <p className="font-rajdhani text-gray-200">
                  Track your progress, skills, and achievements
                </p>
              </div>
            </div>

            {/* Loading State */}
            {(authLoading || isLoading) && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                  <p className="text-white font-rajdhani">
                    {authLoading ? 'Checking authentication...' : 'Loading profile...'}
                  </p>
                </div>
              </div>
            )}

            {/* Main Content — 3 separate rows with gaps */}
            {!isLoading && !authLoading && profileData && (
              <div className="flex flex-col gap-6">
                {/* Row 1: Identity card + Problem Solving Statistics */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  <div className="xl:col-span-3 h-full">
                    <ProfileStats data={profileData} section="identity" />
                  </div>
                  <div className="xl:col-span-9 h-full">
                    <ProblemChart data={profileData} />
                  </div>
                </div>

                {/* Row 2: Progress card + Submission Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  <div className="xl:col-span-3">
                    <ProfileStats data={profileData} section="progress" />
                  </div>
                  <div className="xl:col-span-9">
                    <ActivityCalendar data={profileData} />
                  </div>
                </div>

                {/* Row 3: Meta card + Achievements */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  <div className="xl:col-span-3 h-full">
                    <ProfileStats data={profileData} section="meta" />
                  </div>
                  <div className="xl:col-span-9 h-full">
                    <Achievements />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
