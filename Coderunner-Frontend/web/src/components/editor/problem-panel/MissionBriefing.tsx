'use client';

import { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import type { Problem } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

interface MissionBriefingProps {
  problem: Problem;
}

export default function MissionBriefing({ problem }: MissionBriefingProps) {
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

  // Only show if description exists
  if (!problem.description) {
    return null;
  }

  return (
    <div
      className={`mission-card relative overflow-hidden rounded-2xl p-6 mb-6 border-2 shadow-lg ${hasCompilerTheme ? '' : 'border-purple-200/50 dark:border-purple-700/30 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/30 dark:via-blue-950/20 dark:to-cyan-950/30 shadow-purple-500/10'}`}
      style={hasCompilerTheme ? { background: 'rgba(10,15,30,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: accentRgba(0.35) } : {}}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      <h3 className="font-orbitron text-sm font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2 relative">
        <div className="p-1.5 rounded-lg bg-purple-200 dark:bg-purple-900/50">
          <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <span>Mission Objective</span>
      </h3>
      <p className="compiler-body-text text-base text-slate-900 dark:text-white leading-relaxed relative" style={textGlowStyle}>
        {problem.description}
      </p>
    </div>
  );
}
