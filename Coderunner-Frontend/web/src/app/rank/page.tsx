'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Trophy, TrendingUp, Users, Medal, Star, Crown, Zap, Activity, Loader2, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface LeaderboardUser {
  position: number; // Position in leaderboard (1, 2, 3, etc.)
  userId: string;
  username: string;
  level: number;
  experience: number;
  rank: 'NOVICE' | 'ADVANCED' | 'EXPERT' | 'MASTER'; // User tier/rank badge
  contestRating: number;
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    acceptanceRate: number;
  };
  streak: {
    current: number;
    longest: number;
  };
}

const getRankColor = (rankTier: string) => {
  switch (rankTier) {
    case 'MASTER': return '#023373';
    case 'EXPERT': return '#034AA6';
    case 'ADVANCED': return '#0367A6';
    case 'NOVICE': return '#91D2D9';
    default: return '#6B7280';
  }
};

const getRankIcon = (position: number) => {
  switch (position) {
    case 1: return <Crown className="w-6 h-6" style={{ color: '#ffd700' }} />;
    case 2: return <Trophy className="w-6 h-6" style={{ color: '#c0c0c0' }} />;
    case 3: return <Medal className="w-6 h-6" style={{ color: '#cd7f32' }} />;
    default: return <span className="text-lg font-orbitron font-bold text-gray-400">#{position}</span>;
  }
};

export default function RankPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('global');
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await api.leaderboard.getGlobal({ limit: 100, sortBy: 'contestRating' });
      const data = response as any;
      setLeaderboardData(data.leaderboard || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
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

  const currentUser = user ? leaderboardData.find(u => u.userId === user.id) : null;
  const currentUserRank = currentUser ? currentUser.position : null;

  return (
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
          {/* Page Header */}
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
                <Trophy className="w-8 h-8" style={{ color: theme.colors.primary }} />
                GLOBAL LEADERBOARD
              </h1>
              <p className="font-rajdhani text-gray-200">
                Compete with elite programmers worldwide
              </p>
            </div>
          </div>

          {/* Current User Stats */}
          {currentUser && (
            <div className="bg-white border-2 rounded-xl p-6 mb-8 transition-colors" style={{
              borderColor: `${theme.colors.light}99`,
            }}>
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6" style={{ color: theme.colors.primary }} />
                <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">YOUR CURRENT STANDING</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2" style={{ borderColor: theme.colors.primary }}>
                    <AvatarFallback
                      className="text-white text-xl font-orbitron font-bold"
                      style={{ backgroundColor: getRankColor(currentUser.rank) }}
                    >
                      {currentUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-orbitron font-bold text-gray-900">{currentUser.username}</h3>
                    <Badge
                      className="mt-1 font-orbitron text-xs border-0"
                      style={{
                        backgroundColor: getRankColor(currentUser.rank),
                        color: 'white'
                      }}
                    >
                      {currentUser.rank}
                    </Badge>
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gray-50 border" style={{ borderColor: `${theme.colors.light}99` }}>
                  <div className="text-3xl font-orbitron font-black" style={{ color: theme.colors.primary }}>#{currentUserRank}</div>
                  <div className="text-sm text-gray-500 font-rajdhani tracking-wider">GLOBAL RANK</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gray-50 border" style={{ borderColor: `${theme.colors.light}99` }}>
                  <div className="text-3xl font-orbitron font-black" style={{ color: theme.colors.primary }}>{currentUser.stats.totalSolved}</div>
                  <div className="text-sm text-gray-500 font-rajdhani tracking-wider">PROBLEMS SOLVED</div>
                </div>

                <div className="text-center p-4 rounded-lg bg-gray-50 border" style={{ borderColor: `${theme.colors.light}99` }}>
                  <div className="text-3xl font-orbitron font-black" style={{ color: theme.colors.dark }}>{currentUser.contestRating}</div>
                  <div className="text-sm text-gray-500 font-rajdhani tracking-wider">CONTEST RATING</div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border-2" style={{ borderColor: `${theme.colors.light}99` }}>
              <TabsTrigger
                value="global"
                className="font-orbitron data-[state=active]:text-white"
                style={{
                  backgroundColor: activeTab === 'global' ? theme.colors.primary : 'transparent'
                }}
              >
                GLOBAL RANKINGS
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="font-orbitron data-[state=active]:text-white"
                style={{
                  backgroundColor: activeTab === 'weekly' ? theme.colors.primary : 'transparent'
                }}
              >
                WEEKLY CHAMPIONS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="global">
              <div className="bg-white border-2 rounded-xl p-6 transition-colors" style={{
                borderColor: `${theme.colors.light}99`,
              }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6" style={{ color: theme.colors.primary }} />
                    <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">GLOBAL LEADERBOARD</h3>
                  </div>
                  <Badge
                    className="font-orbitron border"
                    style={{
                      backgroundColor: `${theme.colors.light}33`,
                      color: theme.colors.primary,
                      borderColor: `${theme.colors.light}99`
                    }}
                  >
                    {leaderboardData.length} USERS
                  </Badge>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: theme.colors.primary }} />
                      <p className="text-sm text-gray-500 font-rajdhani">Loading leaderboard...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 font-rajdhani">{error}</p>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-rajdhani">No users on the leaderboard yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboardData.map((leaderUser, index) => (
                      <div
                        key={leaderUser.userId}
                        className="flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300"
                        style={{
                          backgroundColor: user && leaderUser.userId === user.id ? `${theme.colors.light}1a` : '#f9fafb',
                          borderColor: user && leaderUser.userId === user.id ? theme.colors.primary : `${theme.colors.light}66`,
                          boxShadow: user && leaderUser.userId === user.id ? `0 4px 6px -1px ${theme.colors.glow}` : 'none'
                        }}
                      >
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(index + 1)}
                        </div>

                        <Avatar className="h-12 w-12 border-2" style={{ borderColor: `${theme.colors.light}99` }}>
                          <AvatarFallback
                            className="text-white font-orbitron font-bold"
                            style={{ backgroundColor: getRankColor(leaderUser.rank) }}
                          >
                            {leaderUser.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-orbitron font-bold text-gray-900 truncate">
                              {leaderUser.username}
                              {user && leaderUser.userId === user.id && (
                                <span className="ml-2" style={{ color: theme.colors.primary }}>(You)</span>
                              )}
                            </h3>
                            <Badge
                              className="font-orbitron text-xs border-0"
                              style={{
                                backgroundColor: getRankColor(leaderUser.rank),
                                color: 'white'
                              }}
                            >
                              {leaderUser.rank}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4" style={{ color: theme.colors.primary }} />
                              <span className="text-gray-500 font-rajdhani">Solved:</span>
                              <span className="font-orbitron font-bold" style={{ color: theme.colors.primary }}>{leaderUser.stats.totalSolved}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" style={{ color: theme.colors.primary }} />
                              <span className="text-gray-500 font-rajdhani">Level:</span>
                              <span className="font-orbitron font-bold" style={{ color: theme.colors.primary }}>{leaderUser.level}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" style={{ color: theme.colors.dark }} />
                              <span className="text-gray-500 font-rajdhani">Rating:</span>
                              <span className="font-orbitron font-bold" style={{ color: theme.colors.dark }}>{leaderUser.contestRating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="w-4 h-4" style={{ color: theme.colors.light }} />
                              <span className="text-gray-500 font-rajdhani">Streak:</span>
                              <span className="font-orbitron font-bold" style={{ color: theme.colors.light }}>{leaderUser.streak.current}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="weekly">
              <div className="bg-white border-2 rounded-xl p-6 transition-colors" style={{
                borderColor: `${theme.colors.light}99`,
              }}>
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-6 h-6" style={{ color: theme.colors.primary }} />
                  <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">WEEKLY CHAMPIONS</h3>
                </div>

                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: theme.colors.primary }} />
                  <h3 className="text-xl font-orbitron font-bold mb-2" style={{ color: theme.colors.primary }}>
                    WEEKLY LEADERBOARD
                  </h3>
                  <p className="text-gray-500 font-rajdhani">
                    Weekly rankings will be available soon. Train hard, Commander!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
