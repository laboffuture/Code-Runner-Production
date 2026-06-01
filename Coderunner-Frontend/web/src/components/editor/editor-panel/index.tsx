'use client';

import EditorHeader from './EditorHeader';
import CodeEditorSection from './CodeEditorSection';
import ConsolePanel from './ConsolePanel';
import type { Problem, ExecutionResult, SubmissionResult } from '@/lib/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  customInput: string;
  setCustomInput: (input: string) => void;
  result: ExecutionResult | null;
  submissionResult: SubmissionResult | null;
  isRunning: boolean;
  isSubmitting: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunCode: () => void;
  onSubmitCode: () => void;
  problem: Problem;
  uploadedImages?: string[];
  onImageUpload?: (file: File) => void;
  onRemoveImage?: (index: number) => void;
  status: 'Ready' | 'EXECUTING...' | 'SUCCESS' | 'ERROR';
  showFilesTab?: boolean;
  renderFilesContent?: () => React.ReactNode;
  onPaste?: (chars: number) => void;
}

export default function EditorPanel({
  code,
  setCode,
  customInput,
  setCustomInput,
  result,
  submissionResult,
  isRunning,
  isSubmitting,
  activeTab,
  setActiveTab,
  onRunCode,
  onSubmitCode,
  problem,
  uploadedImages,
  onImageUpload,
  onRemoveImage,
  status,
  showFilesTab,
  renderFilesContent,
  onPaste,
}: EditorPanelProps) {
  const isPending = isRunning || isSubmitting;
  const { character, accentColor } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);

  // ===== VERTICAL RESIZE (editor ↔ console) =====
  const [consoleHeight, setConsoleHeight] = useState(300);
  const isVResizing = useRef(false);
  const vStartY = useRef(0);
  const vStartHeight = useRef(0);

  const handleVMouseDown = useCallback((e: React.MouseEvent) => {
    isVResizing.current = true;
    vStartY.current = e.clientY;
    vStartHeight.current = consoleHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [consoleHeight]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isVResizing.current) return;
      const delta = vStartY.current - e.clientY; // drag up = taller console
      const newHeight = Math.min(Math.max(vStartHeight.current + delta, 150), 600);
      setConsoleHeight(newHeight);
    };
    const onMouseUp = () => {
      if (isVResizing.current) {
        isVResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      <EditorHeader status={status} isPending={isPending} />
      <CodeEditorSection
        code={code}
        onChange={setCode}
        problem={problem}
        uploadedImages={uploadedImages}
        onImageUpload={onImageUpload}
        onRemoveImage={onRemoveImage}
        onPaste={onPaste}
      />

      {/* Vertical Resize Handle */}
      <div
        className={`h-2 flex-shrink-0 cursor-row-resize flex items-center justify-center group z-10 select-none ${hasCompilerTheme ? '' : 'bg-slate-100 dark:bg-slate-900'}`}
        onMouseDown={handleVMouseDown}
        style={hasCompilerTheme
          ? { borderTop: `1px solid rgba(${parseInt(accentColor.slice(1,3),16)},${parseInt(accentColor.slice(3,5),16)},${parseInt(accentColor.slice(5,7),16)},0.2)` }
          : { borderTop: '1px solid #e2e8f0' }}
      >
        <div className="h-0.5 w-10 rounded-full opacity-20 group-hover:opacity-70 transition-opacity"
          style={{ background: hasCompilerTheme ? accentColor : '#94a3b8' }} />
      </div>

      <ConsolePanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customInput={customInput}
        setCustomInput={setCustomInput}
        result={result}
        submissionResult={submissionResult}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
        onRunCode={onRunCode}
        onSubmitCode={onSubmitCode}
        showFilesTab={showFilesTab}
        renderFilesContent={renderFilesContent}
        height={consoleHeight}
        problemId={problem.problem_id}
      />
    </>
  );
}

// Export individual components for flexibility
export {
  EditorHeader,
  CodeEditorSection,
  ConsolePanel,
};
