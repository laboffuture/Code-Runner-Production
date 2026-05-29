'use client';

import { Zap, Rocket, Loader2, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

interface ActionButtonsProps {
  onRunCode: () => void;
  onSubmitCode: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  canSubmit?: boolean;
  problemId?: number;
}

export default function ActionButtons({
  onRunCode,
  onSubmitCode,
  isRunning,
  isSubmitting,
  canSubmit = true,
  problemId,
}: ActionButtonsProps) {
  const router = useRouter();
  const { character, accentColor, accentDark } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isBusy = isRunning || isSubmitting;

  return (
    <div className="flex items-center gap-3">
      {/* RUN Button */}
      <button
        onClick={onRunCode}
        disabled={isBusy}
        className={`run-button relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${hasCompilerTheme ? '' : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-cyan-500/30 hover:shadow-cyan-500/50'}`}
        style={hasCompilerTheme ? { background: `linear-gradient(135deg, ${accentColor}, ${accentDark})`, border: 'none', color: 'white', boxShadow: `0 0 15px ${accentRgba(0.4)}`, borderRadius: '12px' } : {}}
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-orbitron">Running...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span className="font-orbitron">Run Code</span>
          </>
        )}
      </button>

      {/* SUBMIT Button */}
      <button
        onClick={onSubmitCode}
        disabled={isBusy || !canSubmit}
        className={`submit-button relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${hasCompilerTheme ? '' : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50'}`}
        style={hasCompilerTheme ? { background: `linear-gradient(135deg, ${accentDark}, ${accentColor})`, border: 'none', color: 'white', boxShadow: `0 0 15px ${accentRgba(0.4)}`, borderRadius: '12px' } : {}}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-orbitron">Submitting...</span>
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            <span className="font-orbitron">Submit</span>
          </>
        )}
      </button>

      {/* NEXT TASK Button */}
      {problemId !== undefined && (
        <button
          onClick={() => router.push(`/problems/${problemId + 1}`)}
          disabled={isBusy}
          className={`next-task-button relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${hasCompilerTheme ? '' : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-violet-500/30 hover:shadow-violet-500/50'}`}
          style={hasCompilerTheme ? { background: `linear-gradient(135deg, ${accentColor}cc, ${accentDark})`, border: `1px solid ${accentRgba(0.5)}`, color: 'white', boxShadow: `0 0 15px ${accentRgba(0.3)}`, borderRadius: '12px' } : {}}
        >
          <span className="font-orbitron">Next Task</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
