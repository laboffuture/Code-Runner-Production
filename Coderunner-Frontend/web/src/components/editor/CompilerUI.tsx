'use client';

import type { Problem, ExecutionResult, SubmissionResult, TestCase, FileInfo } from '@/lib/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { PygameCanvas } from './PygameCanvas';
import ProblemPanel from './problem-panel';
import EditorPanel from './editor-panel';
import NeuralSidebar from './NeuralSidebar';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileOutput, ArrowRight, X, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProgress, syncProgressFromServer } from '@/lib/utilities/progress';
import { api } from '@/lib/api-client';

interface CompilerUIProps {
  problem: Problem;
  /** If present, submissions are recorded in this contest's leaderboard */
  contestId?: string;
}

export function CompilerUI({ problem, contestId }: CompilerUIProps) {
  console.log('CompilerUI received problem:', {
    problem_id: problem.problem_id,
    title: problem.title,
    has_case_code: !!problem.case_code,
    case_code_length: problem.case_code?.length || 0
  });

  // ===== STATE MANAGEMENT =====
  const [code, setCode] = useState<string>(problem.compiler_comment || '# Write your code here\n');
  const [customInput, setCustomInput] = useState<string>(problem.sample_input || '');
  const [result, setResult] = useState<ExecutionResult>({
    stdout: '',
    stderr: '',
    status: '',
    executionTime: null,
  });
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [pygameConsoleOutput, setPygameConsoleOutput] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [userSessionId, setUserSessionId] = useState<string>('');
  const [editorStatus, setEditorStatus] = useState<'Ready' | 'EXECUTING...' | 'SUCCESS' | 'ERROR'>('Ready');
  const [sidebarOpen] = useState(false);

  // ===== HORIZONTAL RESIZE (problem panel ↔ editor) =====
  const [leftWidth, setLeftWidth] = useState(650);
  const isHResizing = useRef(false);
  const hStartX = useRef(0);
  const hStartWidth = useRef(0);

  const handleHMouseDown = useCallback((e: React.MouseEvent) => {
    isHResizing.current = true;
    hStartX.current = e.clientX;
    hStartWidth.current = leftWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [leftWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isHResizing.current) return;
      const delta = e.clientX - hStartX.current;
      const newWidth = Math.min(Math.max(hStartWidth.current + delta, 280), 900);
      setLeftWidth(newWidth);
    };
    const onMouseUp = () => {
      if (isHResizing.current) {
        isHResizing.current = false;
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

  const { character, accentColor } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const { playProjectTextSound } = useGlobalAudio();
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('customInput');
  const [problemTestCases, setProblemTestCases] = useState<TestCase[]>([]);
  const { toast } = useToast();
  const progress = useProgress();
  const pathname = usePathname();

  // Check if this is a file handling session (Level 4, Sessions 4-8: session_ids 37-41)
  const isFileHandlingSession = problem.session_id >= 37 && problem.session_id <= 41;

  // ===== INITIALIZATION =====
  // Initialize or retrieve user session ID from localStorage
  useEffect(() => {
    const getOrCreateSessionId = () => {
      let sessionId = localStorage.getItem('user_file_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_file_session_id', sessionId);
      }
      return sessionId;
    };

    setUserSessionId(getOrCreateSessionId());
  }, []);

  // ===== FILE HANDLING =====
  // Load persistent files for file handling sessions
  const loadPersistentFiles = useCallback(async () => {
    if (!isFileHandlingSession || !userSessionId) return;

    try {
      const response = await fetch('/api/files/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.files && data.files.length > 0) {
          setResult(prev => ({ ...prev, files: data.files }));
        }
      }
    } catch (error) {
      console.error('Failed to load persistent files:', error);
    }
  }, [isFileHandlingSession, userSessionId]);

  // Load persistent files on mount
  useEffect(() => {
    loadPersistentFiles();
  }, [loadPersistentFiles]);

  // Auto-switch to FILES tab when files are detected
  useEffect(() => {
    if (isFileHandlingSession && result.files && result.files.length > 0) {
      setActiveTab('files');
    }
  }, [isFileHandlingSession, result.files]);

  // Handle file click to view contents
  const handleFileClick = async (fileName: string, _filePath: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSessionId, fileName }),
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedFile({ name: fileName, content: data.content });
        setIsFileViewerOpen(true);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load file content',
        variant: 'destructive',
      });
    }
  };

  // Handle file download
  const handleFileDownload = async (fileName: string, _filePath: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSessionId, fileName }),
      });

      const data = await response.json();

      if (response.ok) {
        const blob = new Blob([data.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: `Downloaded ${fileName}`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to download file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  // Handle file deletion
  const handleFileDelete = async (fileName: string, _filePath: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSessionId, fileName }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadPersistentFiles();
        toast({
          title: 'Success',
          description: `Deleted ${fileName}`,
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete file',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  // ===== IMAGE HANDLING =====
  const handleImageUpload = (file: File) => {
    setUploadedImages(prev => [...prev, file]);
    // Create URL for preview
    const url = URL.createObjectURL(file);
    setUploadedImageUrls(prev => [...prev, url]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    if (uploadedImageUrls[index]) {
      URL.revokeObjectURL(uploadedImageUrls[index]);
    }
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // ===== PYGAME HANDLING =====
  const handleConsoleOutput = useCallback((message: string) => {
    setPygameConsoleOutput(prev => {
      if (prev.includes(message)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // ===== LOAD TEST CASES =====
  useEffect(() => {
    async function loadTestCases() {
      try {
        console.log('[CompilerUI] Fetching test cases for problem:', problem.problem_id);
        const cases = await api.problems.getTestCases(problem.problem_id);
        console.log('[CompilerUI] Received test cases:', cases.length);
        setProblemTestCases(cases);
      } catch (error) {
        console.error('[CompilerUI] Failed to load test cases:', error);
      }
    }
    loadTestCases();
  }, [problem.problem_id]);

  // ===== CODE EXECUTION =====
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setResult({ stdout: '', stderr: '', status: 'Running', executionTime: null });
    setSubmissionResult(null);
    setPygameConsoleOutput([]);
    setActiveTab('output');
    setEditorStatus('EXECUTING...');
    playProjectTextSound();

    try {
      const images = await Promise.all(
        uploadedImages.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          return { name: file.name, data: base64 };
        })
      );

      const submission = await api.execution.submit(
        code,
        customInput,
        images,
        isFileHandlingSession ? userSessionId : undefined
      );

      setResult({ stdout: '', stderr: '', status: 'Queued...', executionTime: null });
      const resultData = await api.execution.waitForResult(submission.jobId);

      const data: ExecutionResult = resultData.result || {
        stdout: resultData.stdout || '',
        stderr: resultData.stderr || resultData.error || '',
        status: resultData.status === 'completed' ? 'Success' : 'Error',
        executionTime: resultData.executionTime || null,
      };

      setResult(data);
      setEditorStatus(data.status === 'Success' ? 'SUCCESS' : 'ERROR');

      if (data.pygameBundle && data.stdout) {
        setPygameConsoleOutput(data.stdout.trim().split('\n'));
      }
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Execution failed';
      // Detect warming-up / timeout: show a friendly retry hint
      const isWarmup = rawMessage.includes('warming up') || rawMessage.includes('Timeout');
      const errorMessage = isWarmup
        ? 'The execution service is warming up. Please click Run Code again in a few seconds.'
        : rawMessage;
      setResult({ stdout: '', stderr: errorMessage, status: 'Error', executionTime: null });
      setEditorStatus('ERROR');
    } finally {
      setIsRunning(false);
    }
  };

  // ===== CODE SUBMISSION =====
  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setResult({ stdout: '', stderr: '', status: 'Submitting', executionTime: null });
    setSubmissionResult(null);
    setPygameConsoleOutput([]);
    setActiveTab('output');
    setEditorStatus('EXECUTING...');
    playProjectTextSound();

    try {
      const submission = await api.execution.submitForGrading(code, problem.problem_id, contestId);

      setResult({ stdout: '', stderr: '', status: 'Grading...', executionTime: null });
      const resultData = await api.execution.waitForResult(submission.jobId);

      const submissionSummary = resultData.submissionResult || resultData.result?.summary;

      if (submissionSummary) {
        setSubmissionResult(submissionSummary);
        setEditorStatus(submissionSummary.status === 'Accepted' ? 'SUCCESS' : 'ERROR');

        if (submissionSummary.status === 'Accepted') {
          progress.markProblemComplete(problem.problem_id);
          // Only mark the level complete when the Code Convergence ultimate challenge is accepted
          const isCodeConvergence = pathname?.includes('/code-convergence/');
          if (isCodeConvergence && problem.metadata?.unlocks_next_level && problem.age_group && problem.level_number) {
            progress.markLevelComplete(problem.age_group, problem.level_number);
          }
          // Re-sync from server after a short delay so the worker has time to
          // write solvedProblemIds before we pull the updated list.
          setTimeout(syncProgressFromServer, 3000);
        }

        toast({
          title: `Submission ${submissionSummary.status}`,
          description: `Passed ${submissionSummary.passed}/${submissionSummary.total} test cases.`,
          variant: submissionSummary.status === 'Accepted' ? 'default' : 'destructive',
        });

        const executionResult = resultData.result;
        if (executionResult?.pygameBundle && executionResult?.stdout) {
          setPygameConsoleOutput(executionResult.stdout.trim().split('\n'));
        }
      } else {
        throw new Error('No submission result received');
      }
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      const isWarmup = rawMessage.includes('warming up') || rawMessage.includes('Timeout');
      const errorMessage = isWarmup
        ? 'The execution service is warming up. Please click Submit again in a few seconds.'
        : rawMessage;
      setResult({ stdout: '', stderr: errorMessage, status: 'Error', executionTime: null });
      setEditorStatus('ERROR');
      toast({
        title: isWarmup ? 'Service Warming Up' : 'Submission Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== RENDER FILES CONTENT =====
  const renderFilesContent = () => {
    if (!result.files || result.files.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Database className="h-12 w-12 text-slate-400/40 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No files created yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Run your code to create files
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {result.files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded border border-purple-500/40">
                <FileOutput className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-left flex-1">
                <div className="font-mono text-sm text-slate-700 dark:text-slate-200">
                  {file.name}
                </div>
                <div className="font-mono text-xs text-slate-500">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFileClick(file.name, file.path)}
                className="h-8 px-2 text-xs hover:bg-cyan-500/20 hover:text-cyan-500"
              >
                <FileOutput className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFileDownload(file.name, file.path)}
                className="h-8 px-2 text-xs hover:bg-green-500/20 hover:text-green-500"
              >
                <ArrowRight className="h-3 w-3 mr-1 rotate-90" />
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFileDelete(file.name, file.path)}
                className="h-8 px-2 text-xs hover:bg-red-500/20 hover:text-red-400"
              >
                <X className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className="flex flex-col h-full overflow-hidden font-rajdhani">
      {/* Neural Sidebar */}
      <NeuralSidebar isOpen={sidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Panel - Problem Description (resizable) */}
      <div
        className={`problem-panel flex-shrink-0 flex flex-col shadow-xl hidden md:flex ${hasCompilerTheme ? '' : 'border-purple-200/50 dark:border-purple-700/30 backdrop-blur-xl bg-white/90 dark:bg-slate-900/90'}`}
        style={{
          width: `${leftWidth}px`,
          ...(hasCompilerTheme ? {
            background: 'rgba(10, 15, 30, 0.55)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          } : {}),
        }}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <ProblemPanel problem={problem} testCases={problemTestCases} />
        </div>
      </div>

      {/* Horizontal Resize Handle */}
      <div
        className={`hidden md:flex w-2 flex-shrink-0 cursor-col-resize items-center justify-center group z-10 select-none ${hasCompilerTheme ? '' : 'bg-slate-100 dark:bg-slate-900'}`}
        onMouseDown={handleHMouseDown}
        style={hasCompilerTheme ? { borderLeft: `1px solid ${accentRgba(0.18)}`, borderRight: `1px solid ${accentRgba(0.18)}` } : { borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}
      >
        <div className="w-0.5 h-10 rounded-full opacity-20 group-hover:opacity-70 transition-opacity"
          style={{ background: hasCompilerTheme ? accentColor : '#94a3b8' }} />
      </div>

      {/* Right Panel - Editor + Console (Flexible) */}
      <div
        className={`editor-right-panel flex-1 flex flex-col min-w-0 ${hasCompilerTheme ? '' : 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm'}`}
        style={hasCompilerTheme ? {
          background: 'rgba(10, 15, 30, 0.2)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        } : {}}
      >
        <EditorPanel
          code={code}
          setCode={setCode}
          customInput={customInput}
          setCustomInput={setCustomInput}
          result={result}
          submissionResult={submissionResult}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRunCode={handleRunCode}
          onSubmitCode={handleSubmitCode}
          problem={problem}
          uploadedImages={uploadedImageUrls}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          status={editorStatus}
          showFilesTab={isFileHandlingSession}
          renderFilesContent={renderFilesContent}
        />
      </div>
      </div>

      {/* Pygame Canvas (if applicable) */}
      {result.pygameBundle && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <PygameCanvas
              pygameBundle={result.pygameBundle}
              onConsoleOutput={handleConsoleOutput}
            />
            {pygameConsoleOutput.length > 0 && (
              <div className="mt-4 bg-slate-900 rounded-lg p-4 max-h-40 overflow-y-auto custom-scrollbar">
                <div className="text-xs font-mono text-emerald-400 space-y-1">
                  {pygameConsoleOutput.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      <Dialog open={isFileViewerOpen} onOpenChange={setIsFileViewerOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] bg-white dark:bg-slate-900 border-purple-500/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-space text-purple-600 dark:text-purple-400">
              <FileOutput className="h-5 w-5" />
              {selectedFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-slate-100 dark:bg-slate-950 border border-purple-500/30 rounded-lg p-4 max-h-[60vh] overflow-auto custom-scrollbar">
              <pre className="font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {selectedFile?.content}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
