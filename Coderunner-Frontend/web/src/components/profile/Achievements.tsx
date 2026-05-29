'use client';

import { Trophy, Award, Medal, Star, Zap, Target, Flame, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useTheme } from '@/contexts/ThemeContext';

const ACHIEVEMENT_DEFINITIONS: Record<string, { name: string; description: string; icon: string }> = {
  first_solve:   { name: 'First Blood',      description: 'Solved your first problem',        icon: 'target' },
  solver_5:      { name: 'Rookie',            description: 'Solved 5 problems',                icon: 'zap'    },
  solver_10:     { name: 'Apprentice',        description: 'Solved 10 problems',               icon: 'zap'    },
  solver_25:     { name: 'Challenger',        description: 'Solved 25 problems',               icon: 'trophy' },
  solver_50:     { name: 'Expert',            description: 'Solved 50 problems',               icon: 'trophy' },
  solver_100:    { name: 'Legend',            description: 'Solved 100 problems',              icon: 'star'   },
  streak_3:      { name: 'On Fire',           description: '3-day submission streak',          icon: 'flame'  },
  streak_7:      { name: 'Weekly Warrior',    description: '7-day submission streak',          icon: 'flame'  },
  streak_30:     { name: 'Unstoppable',       description: '30-day submission streak',         icon: 'flame'  },
  easy_master:   { name: 'Easy Master',       description: 'Solved 10 easy problems',          icon: 'medal'  },
  medium_master: { name: 'Medium Master',     description: 'Solved 5 medium problems',         icon: 'medal'  },
  hard_master:   { name: 'Hard Master',       description: 'Solved 3 hard problems',           icon: 'medal'  },
};

interface Achievement {
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  unlockedAt?: Date;
  category?: string;
}

export function Achievements() {
  const { accentColor } = useTheme();
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    setMounted(true);
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const data = await api.users.getAchievements();
      setAchievements((data as any).achievements || []);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="bg-white border-2 rounded-xl p-6 flex items-center justify-center min-h-[300px]" style={{ borderColor: hexToRgba(accentColor, 0.4) }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: accentColor }} />
          <p className="text-sm text-gray-500 font-rajdhani">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const iconProps = { className: 'w-8 h-8' };
    switch (iconName) {
      case 'target': return <Target {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      case 'flame': return <Flame {...iconProps} />;
      case 'trophy': return <Trophy {...iconProps} />;
      case 'medal': return <Medal {...iconProps} />;
      case 'star': return <Star {...iconProps} />;
      default: return <Award {...iconProps} />;
    }
  };

  return (
    <div className="bg-white border-2 rounded-xl p-6 transition-colors h-full" style={{ borderColor: hexToRgba(accentColor, 0.4) }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">ACHIEVEMENTS</h3>
        </div>
        <span className="text-sm text-gray-500 font-rajdhani">{achievements.length} unlocked</span>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-rajdhani">No achievements yet</p>
          <p className="text-xs text-gray-400 font-rajdhani mt-2">
            Start solving problems to unlock achievements!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((achievementId, index) => {
            const def = ACHIEVEMENT_DEFINITIONS[achievementId];
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-white"
                style={{ borderColor: hexToRgba(accentColor, 0.4) }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-white shadow-lg" style={{ backgroundColor: accentColor }}>
                  {getIcon(def?.icon || 'trophy')}
                </div>
                <h4 className="font-orbitron font-bold text-gray-900 text-sm mb-1">{def?.name || achievementId}</h4>
                <p className="text-xs text-gray-600 mb-2 font-rajdhani">{def?.description || 'Achievement unlocked'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
