// Local type definitions for the frontend.
//
// These mirror the backend's `@code-runner/shared` types but are defined
// locally so the frontend (deployed separately on Railway) does not depend on
// the backend monorepo package — importing `@code-runner/shared` here never
// resolved and broke `tsc`. Keep loosely in sync with
// Coderunner-Backend/packages/shared/src/types when the API contract changes.

// ===== Curriculum =====

export interface Problem {
  problem_id: number;
  session_id: number;
  title: string;
  description: string;
  question?: string;
  objectives?: string;
  concepts?: string;
  difficulty: 'Intro' | 'Easy' | 'Medium' | 'Hard';
  estimated_minutes?: number;
  example_code: string;
  sample_input: string;
  sample_output: string;

  // Session-level content
  session_title?: string;
  session_introduction?: string;

  // Case-specific content
  case_number?: number;
  case_title?: string;
  case_overview?: string;
  case_code?: string;
  case_explanation?: string;

  // Additional metadata
  age_group?: '11-14' | '15-18';
  level_number?: number;
  metadata?: {
    concepts?: string[];
    space_theme?: boolean;
    is_code_convergence?: boolean;
    story_linked?: boolean;
    estimated_time_minutes?: number;
    prerequisites?: string[];
    [key: string]: any;
  };
}

export interface Session {
  session_id: number;
  level_id: number;
  session_number: number;
  title: string;
  description: string;
  introduction_content?: string;
  age_group?: '11-14' | '15-18';
  problems: Problem[];
}

export interface Level {
  level_id: number;
  level_number: number;
  title: string;
  age_group: '11-14' | '15-18';
  description?: string;
  sessions: Session[];
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
  weight?: number;
}

// ===== Execution / results =====

/** Legacy file info (path-based). */
export interface FileInfo {
  name: string;
  size: number;
  path: string;
}

/** Generated file from code execution (images, text files, etc.). */
export interface ExecutionFile {
  name: string;
  type: 'image' | 'text' | 'data';
  data: string; // base64 for binary files, plain text for text files
  mimeType: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  status: 'Success' | 'Error' | 'Timeout' | 'Running' | 'Submitting' | '';
  executionTime: number | null;
  exitCode?: number;

  // Generated files — ExecutionFile (base64) or FileInfo (path-based)
  files?: ExecutionFile[] | FileInfo[];

  // Legacy fields
  plots?: string[];
  executionDir?: string;

  // Pygame interactive bundle (for web export)
  pygameBundle?: {
    html: string;
    wasm: string;
    data: string;
    js: string;
  };
}

export interface SubmissionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Error';
  passed: number;
  total: number;
  results?: Array<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    error?: string;
  }>;
}
