'use client';

import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Submission {
  problemId: number;
  problemTitle: string;
  difficulty: string;
  status: 'ACCEPTED' | 'FAILED';
  timestamp: Date;
}

interface RecentActivityProps {
  data: any;
}

export function RecentActivity({ data }: RecentActivityProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const submissions = data?.recentActivity || [];

  const normalizeDifficulty = (difficulty: string): string => {
    if (difficulty === 'Intro' || difficulty === 'Easy') return 'Easy';
    if (difficulty === 'Medium') return 'Medium';
    if (difficulty === 'Hard') return 'Hard';
    return 'Easy';
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = normalizeDifficulty(difficulty);
    switch (d) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-[#91D2D9]/60';
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white border-2 border-[#91D2D9]/60 rounded-xl p-6 hover:border-[#0367A6]/60 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#0367A6]" />
          <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">RECENT ACTIVITY</h3>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-rajdhani">No recent activity</p>
          <p className="text-xs text-gray-400 font-rajdhani mt-2">
            Start solving problems to see your activity here!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {submissions.slice(0, 8).map((submission, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#91D2D9]/60 hover:border-[#0367A6]/60 transition-colors cursor-pointer"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {submission.status === 'ACCEPTED' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>

                {/* Problem Name */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-rajdhani font-bold text-gray-900 truncate">
                    {submission.problemTitle}
                  </h4>
                  <p className="text-xs text-gray-500 font-fira">{getTimeAgo(new Date(submission.timestamp))}</p>
                </div>

                {/* Difficulty Badge */}
                <div className={`px-2 py-1 rounded text-xs font-orbitron font-bold border ${getDifficultyColor(submission.difficulty)}`}>
                  {normalizeDifficulty(submission.difficulty)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-[#91D2D9]/60 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-orbitron font-black text-green-600">
                {submissions.filter(s => s.status === 'ACCEPTED').length}
              </div>
              <div className="text-xs text-gray-500 font-rajdhani">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-orbitron font-black text-red-600">
                {submissions.filter(s => s.status === 'FAILED').length}
              </div>
              <div className="text-xs text-gray-500 font-rajdhani">Failed</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
