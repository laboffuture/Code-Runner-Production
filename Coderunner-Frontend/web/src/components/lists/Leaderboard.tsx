'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Medal, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

// Shape returned by GET /leaderboard/global (mirrors the /rank page).
interface LeaderboardUser {
  position: number;
  userId: string;
  username: string;
  level: number;
  contestRating: number;
  rank: 'NOVICE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  stats: {
    totalSolved: number;
  };
}

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'MASTER': return '#ff6b35';
    case 'EXPERT': return '#9f40ff';
    case 'ADVANCED': return '#40ffff';
    case 'NOVICE': return '#40ff80';
    default: return '#a0b3c4';
  }
};

const getRankIcon = (position: number) => {
  switch (position) {
    case 1: return <Trophy className="w-4 h-4" style={{ color: '#ffd700' }} />;
    case 2: return <Medal className="w-4 h-4" style={{ color: '#c0c0c0' }} />;
    case 3: return <Medal className="w-4 h-4" style={{ color: '#cd7f32' }} />;
    default: return <span className="text-xs font-mono text-muted-foreground">#{position}</span>;
  }
};

export function Leaderboard() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const response = await api.leaderboard.getGlobal({ limit: 100, sortBy: 'contestRating' });
        const data = response as any;
        if (!cancelled) {
          setLeaderboardData(data.leaderboard || []);
          setError(false);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const currentUser = user ? leaderboardData.find(u => u.userId === user.id) : null;
  const currentUserRank = currentUser ? currentUser.position : null;
  const displayUsers = showFullLeaderboard ? leaderboardData : leaderboardData.slice(0, 5);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 px-3 py-1 h-8 rounded bg-slate-800/50 border border-orange-500/30 hover:border-orange-400/50 transition-colors"
        >
          <TrendingUp className="w-3 h-3" style={{ color: '#ff6b35' }} />
          <span className="text-xs font-mono" style={{ color: '#ff6b35' }}>
            {currentUserRank ? `RANK #${currentUserRank}` : 'RANK —'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-slate-900/95 border border-orange-500/30 backdrop-blur-xl"
        align="center"
        sideOffset={8}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" style={{ color: '#ffd700' }} />
              <h3 className="font-space font-bold text-sm" style={{ color: '#ff6b35' }}>
                {showFullLeaderboard ? 'FULL LEADERBOARD' : 'TOP RANKINGS'}
              </h3>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20">
              <Users className="w-3 h-3" style={{ color: '#ff6b35' }} />
              <span className="text-xs font-mono" style={{ color: '#ff6b35' }}>
                {leaderboardData.length} USERS
              </span>
            </div>
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#ff6b35' }} />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-xs font-mono text-muted-foreground">
              Failed to load leaderboard
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-muted-foreground">
              No users ranked yet
            </div>
          ) : (
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {displayUsers.map((u, index) => (
                <div
                  key={u.userId}
                  className="flex items-center space-x-3 p-2 rounded bg-slate-800/30 border border-slate-700/50 hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex items-center justify-center w-6">
                    {getRankIcon(index + 1)}
                  </div>

                  <Avatar className="h-6 w-6 border border-slate-600">
                    <AvatarFallback className="bg-slate-700 text-xs" style={{ color: getRankColor(u.rank) }}>
                      {u.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate">
                        {u.username}
                        {user && u.userId === user.id && (
                          <span className="ml-1.5 text-xs" style={{ color: '#ff6b35' }}>(You)</span>
                        )}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-xs font-mono px-1 rounded"
                          style={{
                            color: getRankColor(u.rank),
                            backgroundColor: `${getRankColor(u.rank)}20`
                          }}
                        >
                          {u.rank}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{u.stats.totalSolved} solved</span>
                      <span>Lv.{u.level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <div className="flex justify-center space-x-2">
              {!showFullLeaderboard ? (
                <Link href="/rank">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono hover:bg-orange-500/10"
                    style={{ color: '#ff6b35' }}
                    onClick={() => setIsOpen(false)}
                  >
                    VIEW FULL LEADERBOARD
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-mono hover:bg-orange-500/10"
                  style={{ color: '#ff6b35' }}
                  onClick={() => setShowFullLeaderboard(false)}
                >
                  SHOW TOP 5
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono hover:bg-slate-600/10"
                style={{ color: '#a0b3c4' }}
                onClick={() => setIsOpen(false)}
              >
                CLOSE
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
