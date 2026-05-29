'use client';

import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';
import type { Problem } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { getDifficultyLabel } from '@/lib/utils';

interface ProblemHeaderProps {
  problem: Problem;
}

export default function ProblemHeader({ problem }: ProblemHeaderProps) {
  const { accentColor } = useTheme();

  const hex = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const badgeStyle = {
    color:           accentColor,
    borderColor:     hex(0.5),
    backgroundColor: hex(0.08),
    boxShadow:       `0 4px 14px ${hex(0.2)}`,
  };

  return (
    <div className="mb-8">
      {/* Back Button */}
      <Link
        href={`/levels/${problem.age_group}/${problem.level_number}`}
        className="back-link inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-all text-sm font-semibold mb-6 group"
        style={{ ['--hover-color' as string]: accentColor }}
        onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
        onMouseLeave={(e) => (e.currentTarget.style.color = '')}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-orbitron">Back to Sessions</span>
      </Link>

      {/* Problem Header */}
      <div className="flex items-start gap-5">
        <div className="relative">
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-30"
            style={{ background: `linear-gradient(to bottom right, ${accentColor}, ${hex(0.5)})` }}
          />
          <div
            className="relative w-14 h-14 rounded-2xl border-2 backdrop-blur-xl flex items-center justify-center shadow-xl"
            style={{
              borderColor:     hex(0.4),
              backgroundColor: hex(0.12),
            }}
          >
            <Target className="w-7 h-7" style={{ color: accentColor }} />
          </div>
        </div>

        <div className="flex-1">
          <h2 className="font-orbitron text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
            {problem.title}
          </h2>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 text-xs font-bold rounded-full border-2 shadow-lg" style={badgeStyle}>
              {getDifficultyLabel(problem.session_id, problem.case_number === 6 || problem.metadata?.is_final_task).toUpperCase()}
            </span>
            {problem.case_number === 6 && (
              <span className="px-4 py-1.5 text-xs font-bold rounded-full border-2 shadow-lg" style={badgeStyle}>
                FINAL TASK
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
