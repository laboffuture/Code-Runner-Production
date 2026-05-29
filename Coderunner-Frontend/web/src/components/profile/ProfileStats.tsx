'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Award,
  CheckCircle,
  Target,
  TrendingUp,
  Flame,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type ProfileSection = 'identity' | 'progress' | 'meta';

interface ProfileStatsProps {
  data: any;
  section?: ProfileSection;
}

export function ProfileStats({ data, section = 'identity' }: ProfileStatsProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const profile = data;
  const nextLevelXP = (profile.level + 1) * 500;
  const currentLevelXP = profile.level * 500;
  const progressXP = profile.experience - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.max(0, Math.min((progressXP / neededXP) * 100, 100));

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'NOVICE': return theme.colors.light;
      case 'ADVANCED': return theme.colors.primary;
      case 'EXPERT': return theme.colors.dark;
      case 'MASTER': return theme.colors.dark;
      default: return '#6B7280';
    }
  };

  return (
    <div className="bg-white border-2 rounded-xl overflow-hidden flex flex-col h-full" style={{ borderColor: `${theme.colors.light}99` }}>
      {/* Accent bar */}
      <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.light})` }} />

      <div className="p-6 flex flex-col flex-1">

        {/* ── ROW 1: Identity — pairs with Problem Solving Statistics ── */}
        {section === 'identity' && (
          <>
            {/* Avatar + Name + Rank */}
            <div className="flex flex-col items-center text-center mb-5">
              <Avatar
                className="w-20 h-20 mb-3 shadow-lg"
                style={{ border: `3px solid ${theme.colors.primary}`, boxShadow: `0 0 20px ${theme.colors.glow}` }}
              >
                <AvatarImage src={profile.avatar} alt={profile.username} />
                <AvatarFallback className="text-white text-xl font-orbitron font-bold" style={{ backgroundColor: getRankColor(profile.rank) }}>
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">{profile.username}</h2>
              <Badge className="mt-1.5 text-white border-0 px-3 py-0.5 font-orbitron text-[10px] tracking-wider" style={{ backgroundColor: getRankColor(profile.rank) }}>
                {profile.rank} OPERATIVE
              </Badge>
            </div>

            {/* Solved + Streak */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="text-center py-3 rounded-lg border" style={{ borderColor: `${theme.colors.light}60`, backgroundColor: `${theme.colors.primary}08` }}>
                <Target className="w-4 h-4 mx-auto mb-1" style={{ color: theme.colors.primary }} />
                <div className="text-xl font-orbitron font-black text-gray-900">{profile.stats.totalSolved}</div>
                <div className="text-[10px] text-gray-500 font-rajdhani tracking-widest">SOLVED</div>
              </div>
              <div className="text-center py-3 rounded-lg border" style={{ borderColor: `${theme.colors.light}60`, backgroundColor: `${theme.colors.primary}08` }}>
                <Flame className="w-4 h-4 mx-auto mb-1" style={{ color: theme.colors.primary }} />
                <div className="text-xl font-orbitron font-black text-gray-900">{profile.streak.current}</div>
                <div className="text-[10px] text-gray-500 font-rajdhani tracking-widest">STREAK</div>
              </div>
            </div>

            <div className="h-px w-full mb-4" style={{ backgroundColor: `${theme.colors.light}40` }} />

            {/* Level Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-orbitron font-bold text-gray-600 tracking-wider">LEVEL PROGRESS</span>
                <span className="text-sm font-orbitron font-black" style={{ color: theme.colors.primary }}>LVL {profile.level}</span>
              </div>
              <div className="w-full rounded-full h-3" style={{ backgroundColor: `${theme.colors.light}25` }}>
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%`, background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.light})` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-fira mt-1">
                <span>{progressXP} XP earned</span>
                <span>{neededXP} XP to next</span>
              </div>
            </div>
          </>
        )}

        {/* ── ROW 2: Progress — pairs with Submission Activity ── */}
        {section === 'progress' && (
          <div>
            <span className="text-xs font-orbitron font-bold text-gray-600 tracking-wider">ACTIVITY STATS</span>
            <div className="mt-3 space-y-2.5">
              {[
                { icon: TrendingUp, label: 'Acceptance Rate', value: `${profile.stats.acceptanceRate}%` },
                { icon: CheckCircle, label: 'Total Submissions', value: profile.stats.totalSubmissions },
                { icon: Flame, label: 'Current Streak', value: `${profile.streak.current} days` },
                { icon: Award, label: 'Longest Streak', value: `${profile.streak.longest} days` },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <stat.icon className="w-3.5 h-3.5 mr-2" />
                    <span className="text-xs font-rajdhani">{stat.label}</span>
                  </div>
                  <span className="text-xs font-orbitron font-bold text-gray-800">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ROW 3: Meta — pairs with Achievements ── */}
        {section === 'meta' && (
          <>
            {/* Featured: Contest Rating */}
            <div
              className="flex flex-col items-center text-center mb-5 py-5 rounded-xl"
              style={{ backgroundColor: `${theme.colors.primary}08`, border: `1px solid ${theme.colors.light}40` }}
            >
              <Star className="w-6 h-6 mb-2" style={{ color: theme.colors.primary }} />
              <div className="text-4xl font-orbitron font-black text-gray-900">{profile.contestRating}</div>
              <div className="text-[10px] text-gray-500 font-rajdhani tracking-widest mt-1">CONTEST RATING</div>
            </div>

            <div className="h-px w-full mb-4" style={{ backgroundColor: `${theme.colors.light}40` }} />

            {/* Mission intel */}
            <div>
              <span className="text-xs font-orbitron font-bold text-gray-600 tracking-wider">MISSION INTEL</span>
              <div className="mt-3 space-y-2.5">
                {[
                  { icon: Calendar, label: 'Joined', value: new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                  { icon: Target, label: 'Total Solved', value: profile.stats.totalSolved },
                  { icon: CheckCircle, label: 'Total Submissions', value: profile.stats.totalSubmissions },
                  { icon: TrendingUp, label: 'Acceptance Rate', value: `${profile.stats.acceptanceRate}%` },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <stat.icon className="w-3.5 h-3.5 mr-2" />
                      <span className="text-xs font-rajdhani">{stat.label}</span>
                    </div>
                    <span className="text-xs font-orbitron font-bold text-gray-800">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
