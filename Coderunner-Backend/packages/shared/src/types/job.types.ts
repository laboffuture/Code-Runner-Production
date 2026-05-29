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
  userSessionId?: string; // For persistent file storage
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
  /** Optional: if set the worker also records a ContestEntry result */
  contestId?: string;
}

