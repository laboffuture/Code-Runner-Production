'use client';

import ConsoleTabs from './ConsoleTabs';
import ActionButtons from './ActionButtons';
import type { ExecutionResult, SubmissionResult } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

interface ConsolePanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  customInput: string;
  setCustomInput: (input: string) => void;
  result: ExecutionResult | null;
  submissionResult: SubmissionResult | null;
  isRunning: boolean;
  isSubmitting: boolean;
  onRunCode: () => void;
  onSubmitCode: () => void;
  showFilesTab?: boolean;
  renderFilesContent?: () => React.ReactNode;
  height?: number;
  problemId?: number;
}

export default function ConsolePanel({
  activeTab,
  setActiveTab,
  customInput,
  setCustomInput,
  result,
  submissionResult,
  isRunning,
  isSubmitting,
  onRunCode,
  onSubmitCode,
  showFilesTab = false,
  renderFilesContent,
  height = 300,
  problemId,
}: ConsolePanelProps) {
  const { character, accentColor, accentLight } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Animated frame viewer for pygame output
  function PygameFrameViewer({ files }: { files: any[] }) {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
      if (!isPlaying || files.length <= 1) return;
      const interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % files.length);
      }, 500);
      return () => clearInterval(interval);
    }, [isPlaying, files.length]);

    const file = files[currentFrame];
    if (!file) return null;

    return (
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: accentRgba(0.3) }}>
        <img
          src={`data:${file.mimeType || 'image/png'};base64,${file.data}`}
          alt={`Frame ${currentFrame + 1}`}
          className="max-w-full block"
        />
        {files.length > 1 && (
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="text-xs font-mono"
              style={{ color: accentColor }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <span className="text-xs text-gray-400 font-mono">
              Frame {currentFrame + 1}/{files.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentFrame(p => Math.max(0, p - 1))}
                className="text-xs font-mono"
                style={{ color: accentColor }}
              >◀</button>
              <button
                onClick={() => setCurrentFrame(p => Math.min(files.length - 1, p + 1))}
                className="text-xs font-mono"
                style={{ color: accentColor }}
              >▶</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render execution output
  const renderOutput = () => {
    if (submissionResult) {
      return (
        <div className="font-mono text-sm whitespace-pre-wrap">
          <div className={`p-4 rounded-lg mb-4 ${
            submissionResult.status === 'Accepted'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30'
              : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30'
          }`}>
            <div className={`font-bold mb-2 ${
              submissionResult.status === 'Accepted'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {submissionResult.status === 'Accepted' ? '✓ SUBMISSION ACCEPTED' : '✗ SUBMISSION REJECTED'}
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              Status: {submissionResult.status}<br />
              Test Cases: {submissionResult.passed}/{submissionResult.total} passed
            </div>
          </div>
        </div>
      );
    }

    if (result) {
      return (
        <div className="font-mono text-sm">
          {result.status === 'Error' ? (
            <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap">{result.stderr || result.stdout}</div>
          ) : (
            <div className="text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">{result.stdout}</div>
          )}

          {result.stderr && result.status !== 'Error' && (
            <div className="text-amber-600 dark:text-amber-400 mt-2 whitespace-pre-wrap">{result.stderr}</div>
          )}

          {result.executionTime && (
            <div className="text-slate-500 dark:text-slate-400 mt-2 text-xs">
              Execution time: {result.executionTime}ms
            </div>
          )}

          {/* Render plots if available */}
          {result.plots && result.plots.length > 0 && (
            <div className="mt-4 space-y-2">
              {result.plots.map((plot, index) => (
                <img
                  key={index}
                  src={`data:image/png;base64,${plot}`}
                  alt={`Plot ${index + 1}`}
                  className="max-w-full rounded border border-slate-300 dark:border-slate-600"
                />
              ))}
            </div>
          )}

          {/* Render visual outputs if available */}
          {result.files && result.files.some((f: any) => f.type === 'image' && f.data) && (
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>
                Visual Output
              </div>
              <PygameFrameViewer files={result.files.filter((f: any) => f.type === 'image' && f.data)} />
            </div>
          )}
        </div>
      );
    }

    return <div className="text-slate-500 dark:text-slate-400 font-mono text-xs">Awaiting sequence execution...</div>;
  };

  return (
    <div
      className={`console-panel flex-shrink-0 border-t-2 flex flex-col shadow-xl ${hasCompilerTheme ? '' : 'border-purple-200/50 dark:border-purple-700/30 backdrop-blur-xl bg-gradient-to-br from-purple-50/50 via-blue-50/50 to-cyan-50/50 dark:from-slate-900/50 dark:via-purple-950/20 dark:to-slate-900/50 shadow-purple-500/5'}`}
      style={{ height: `${height}px`, ...(hasCompilerTheme ? { background: 'rgba(10,15,30,0.65)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderColor: accentRgba(0.2) } : {}) }}
    >
      {/* Console Tabs + Action Buttons */}
      <div
        className={`h-16 border-b flex items-center justify-between px-6 flex-shrink-0 ${hasCompilerTheme ? '' : 'border-purple-100 dark:border-purple-900/30'}`}
        style={hasCompilerTheme ? { borderColor: accentRgba(0.15) } : {}}
      >
        <ConsoleTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showFilesTab={showFilesTab}
        />
        <ActionButtons
          onRunCode={onRunCode}
          onSubmitCode={onSubmitCode}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          problemId={problemId}
        />
      </div>

      {/* Console Content Area */}
      <div className="flex-1 p-6 overflow-hidden relative">
        {/* Input Pane */}
        {activeTab === 'customInput' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-orbitron text-sm font-bold text-purple-600 dark:text-purple-400">
                System Input
              </span>
            </div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className={`flex-1 rounded-2xl p-5 font-mono text-base outline-none focus:ring-2 transition-all resize-none custom-scrollbar shadow-inner ${hasCompilerTheme ? 'ring-cyan-500/30 placeholder-slate-500' : 'bg-white dark:bg-slate-950 border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 ring-purple-500/30 focus:border-purple-400 dark:focus:border-purple-600 placeholder-slate-400 dark:placeholder-slate-600'}`}
              style={hasCompilerTheme ? { background: accentRgba(0.06), border: `1.5px solid ${accentRgba(0.4)}` } : {}}
              placeholder="Enter your input data here..."
            />
          </div>
        )}

        {/* Output Pane */}
        {activeTab === 'output' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-orbitron text-sm font-bold" style={{ color: hasCompilerTheme ? accentColor : undefined }}>
                Console Output
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                {(isRunning || isSubmitting) ? 'PROCESSING...' : 'READY'}
              </span>
            </div>
            <div
              className={`console-output-area flex-1 rounded-2xl p-5 font-mono text-sm whitespace-pre overflow-y-auto custom-scrollbar shadow-inner ${hasCompilerTheme ? '' : 'bg-white dark:bg-slate-950 border-2 border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-emerald-300'}`}
              style={hasCompilerTheme ? { background: accentRgba(0.06), border: `1.5px solid ${accentRgba(0.35)}` } : {}}
            >
              {renderOutput()}
            </div>
          </div>
        )}

        {/* Files Pane */}
        {activeTab === 'files' && renderFilesContent && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                File System
              </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderFilesContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
