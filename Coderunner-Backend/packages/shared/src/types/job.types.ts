// Queue Job Types for async execution

/**
 * Job data for simple code execution (test runs)
 */
export interface CodeExecutionJobData {
  jobId: string;
  userId: string;
  code: string;
  input?: string; // User input for stdin
  language: 'python';
  problemId?: number;
  userSessionId?: string; // Legacy: no longer used for file storage
  /**
   * When set, the runner persists files the student's code writes into a
   * durable per-student workspace and injects prior files before the run.
   * Set by the API only for file-handling problems run by a logged-in user.
   */
  persistFileScope?: 'file-handling';
  timestamp: number;
}

/**
 * Job data for code submission (grading with test cases)
 */
export interface SubmissionJobData {
  jobId: string;
  userId: string;
  code: string;
  problemId: number;
  testCases: Array<{
    input: string;
    expected_output: string;
    is_hidden?: boolean;
  }>;
  timestamp: number;
  /**
   * When set, the runner persists the student's file workspace from the first
   * (sample-input) test case run, so a graded submission also surfaces the file
   * the student's code created. Set by the API for file-handling problems.
   */
  persistFileScope?: 'file-handling';
  /** Optional: if set the worker also records a ContestEntry result */
  contestId?: string;
  /** Optional behavioural metrics from the editor for the integrity engine. */
  metrics?: {
    timeOnProblemMs?: number;
    runsBeforeSubmit?: number;
    pasteCount?: number;
    pasteChars?: number;
    codeLength?: number;
  };
}

