'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface EditorHeaderProps {
  status: 'Ready' | 'EXECUTING...' | 'SUCCESS' | 'ERROR';
  isPending: boolean;
}

const statusStyles = {
  'Ready': { dot: 'bg-emerald-500 shadow-emerald-500/50 animate-pulse', text: 'text-emerald-600 dark:text-emerald-400' },
  'EXECUTING...': { dot: 'bg-amber-500 shadow-amber-500/50 animate-pulse', text: 'text-amber-600 dark:text-amber-400' },
  'SUCCESS': { dot: 'bg-emerald-500 shadow-emerald-500/50', text: 'text-emerald-600 dark:text-emerald-400' },
  'ERROR': { dot: 'bg-red-500 shadow-red-500/50', text: 'text-red-600 dark:text-red-400' },
};

export default function EditorHeader({ status, isPending }: EditorHeaderProps) {
  const { character, accentColor } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const currentStatus = isPending ? 'EXECUTING...' : status;
  const styles = statusStyles[currentStatus];

  return (
    <div
      className={`editor-header relative z-40 border-b px-6 py-4 flex items-center justify-between flex-shrink-0 ${hasCompilerTheme ? '' : 'backdrop-blur-xl border-purple-200/50 dark:border-purple-700/30 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-cyan-50/80 dark:from-slate-900/80 dark:via-purple-950/30 dark:to-slate-900/80'}`}
      style={hasCompilerTheme ? {
        background: 'rgba(10, 15, 30, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: accentRgba(0.2),
      } : {}}
    >
      <div className="flex items-center gap-6">
        {/* Language Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
          </div>
          <div className="leading-tight">
            <span className="font-orbitron text-base font-bold text-slate-900 dark:text-white">Python 3.10</span>
            <p className="font-orbitron text-xs font-semibold" style={{ color: hasCompilerTheme ? accentColor : undefined }}>solution.py</p>
          </div>
        </div>

      </div>

      {/* Right Side - Status Pill */}
      <div
        className={`hidden sm:flex items-center gap-3 rounded-full px-5 py-2 border-2 shadow-lg ${hasCompilerTheme ? '' : 'bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/40 dark:to-cyan-900/40 border-purple-200 dark:border-purple-700/50 shadow-purple-500/20'}`}
        style={hasCompilerTheme ? { background: accentRgba(0.08), borderColor: accentRgba(0.3) } : {}}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${styles.dot}`} />
          <span className={`font-orbitron text-xs font-bold ${hasCompilerTheme ? '' : styles.text}`} style={{ color: hasCompilerTheme ? accentColor : undefined }}>
            {currentStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
