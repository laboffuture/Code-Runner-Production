'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Problem } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskSectionProps {
  problem: Problem;
}

export default function TaskSection({ problem }: TaskSectionProps) {
  const { character, accentColor } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const textGlowStyle = hasCompilerTheme && isDark
    ? { color: '#ffffff', textShadow: `0 0 15px ${accentColor}aa, 0 0 6px ${accentColor}66` }
    : {};
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Only show if question exists
  if (!problem.question) {
    return null;
  }

  const isFinalTask = problem.case_number === 6;

  return (
    <div
      className={`mission-card relative overflow-hidden rounded-2xl p-6 mb-6 border-2 shadow-lg ${hasCompilerTheme ? '' : isFinalTask
        ? 'border-purple-400/50 dark:border-purple-600/50 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-purple-950/40 shadow-purple-500/20'
        : 'border-cyan-200/50 dark:border-cyan-700/30 bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50 dark:from-cyan-950/30 dark:via-blue-950/20 dark:to-cyan-950/30 shadow-cyan-500/10'
      }`}
      style={hasCompilerTheme ? { background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: accentRgba(0.35) } : {}}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl ${
        isFinalTask
          ? 'bg-gradient-to-br from-purple-500/15 to-pink-500/15'
          : 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10'
      }`}></div>
      <h3 className={`font-orbitron text-sm font-bold mb-3 flex items-center gap-2 relative ${
        isFinalTask
          ? 'text-purple-700 dark:text-purple-300'
          : 'text-cyan-700 dark:text-cyan-300'
      }`}>
        <div className={`p-1.5 rounded-lg ${
          isFinalTask
            ? 'bg-purple-200 dark:bg-purple-900/50'
            : 'bg-cyan-200 dark:bg-cyan-900/50'
        }`}>
          <CheckCircle2 className={`w-4 h-4 ${
            isFinalTask
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-cyan-600 dark:text-cyan-400'
          }`} />
        </div>
        <span>{isFinalTask ? 'Final Challenge' : 'Your Task'}</span>
      </h3>
      <div className="compiler-body-text text-base text-slate-900 dark:text-white leading-relaxed space-y-2 relative" style={textGlowStyle}>
        {problem.question.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
}
