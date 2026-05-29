'use client';

import { BookOpen, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TopicProgress {
  name: string;
  solved: number;
  total: number;
  percentage: number;
}

interface TopicProgressProps {
  data: any;
}

export function TopicProgress({ data }: TopicProgressProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Extract topic progress from API data
  const topicProgress = data?.topicProgress || [];
  const topics = topicProgress.length > 0
    ? [...topicProgress].sort((a: TopicProgress, b: TopicProgress) => b.percentage - a.percentage)
    : [];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-[#0367A6]';
    if (percentage >= 60) return 'bg-[#034AA6]';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-[#91D2D9]/20';
    if (percentage >= 60) return 'bg-[#91D2D9]/10';
    if (percentage >= 40) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="bg-white border-2 border-[#91D2D9]/60 rounded-xl p-6 hover:border-[#0367A6]/60 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-[#0367A6]" />
        <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">TOPIC PROGRESS</h3>
      </div>

      {topics.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-center">
          <div>
            <p className="text-gray-400 font-rajdhani">No topic progress yet</p>
            <p className="text-xs text-gray-400 font-rajdhani mt-2">Start solving problems to see your progress!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {topics.map((topic) => (
          <div key={topic.name} className={`p-3 rounded-lg ${getProgressBg(topic.percentage)} border border-[#91D2D9]/60`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-rajdhani font-bold text-gray-900">{topic.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-fira text-gray-500">
                  {topic.solved}/{topic.total}
                </span>
                <span className="text-sm font-orbitron font-black" style={{ color: getProgressColor(topic.percentage).replace('bg-', '') }}>
                  {topic.percentage}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(topic.percentage)}`}
                style={{ width: `${topic.percentage}%` }}
              />
            </div>
          </div>
        ))}
          </div>

          {/* Overall Stats */}
          <div className="mt-6 pt-4 border-t border-[#91D2D9]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0367A6]" />
                <span className="text-sm font-rajdhani text-gray-600">Overall Progress</span>
              </div>
              <span className="text-lg font-orbitron font-black text-[#0367A6]">
                {Math.round(topics.reduce((sum, t) => sum + t.percentage, 0) / topics.length)}%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
