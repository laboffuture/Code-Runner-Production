/**
 * Integrity-signal helpers (Phase 3).
 *
 * These are HEURISTICS to help a teacher decide where to look — never an
 * accusation. Copy from a worked example, a fast typist, or a genuinely easy
 * problem all trip the same wires. Always read them as "worth a conversation",
 * not "caught cheating".
 */

export interface AttemptFlags {
  solvedTooFast?: boolean;
  noIteration?: boolean;
  largePaste?: boolean;
}

export interface AttemptRecord {
  problemId?: string | number;
  accepted?: boolean;
  status?: string;
  flags?: AttemptFlags;
  timeOnProblemMs?: number | null;
  runsBeforeSubmit?: number | null;
  pasteCount?: number;
  pasteChars?: number;
  codeLength?: number | null;
  createdAt?: string;
}

export interface FlagMeta {
  key: keyof AttemptFlags;
  icon: string;
  label: string;
  /** Short plain-language explanation a teacher can read at a glance. */
  hint: string;
}

export const FLAG_META: Record<keyof AttemptFlags, FlagMeta> = {
  solvedTooFast: {
    key: 'solvedTooFast',
    icon: '⚡',
    label: 'Solved very fast',
    hint: 'Accepted in under 15 seconds on the page — little time to read and write.',
  },
  noIteration: {
    key: 'noIteration',
    icon: '🔁',
    label: 'No iteration',
    hint: 'Passed on the first attempt with no test runs — unusual for a new problem.',
  },
  largePaste: {
    key: 'largePaste',
    icon: '📋',
    label: 'Large paste',
    hint: 'A big chunk of the final code arrived via paste rather than being typed.',
  },
};

/** Return the active flags on an attempt, in display order. */
export function activeFlags(flags?: AttemptFlags): FlagMeta[] {
  if (!flags) return [];
  return (Object.keys(FLAG_META) as (keyof AttemptFlags)[])
    .filter((k) => flags[k])
    .map((k) => FLAG_META[k]);
}

export function hasFlags(flags?: AttemptFlags): boolean {
  return activeFlags(flags).length > 0;
}

/** Compact "why" string, e.g. "6s · 0 runs · pasted 42 chars". */
export function whyText(a: AttemptRecord): string {
  const parts: string[] = [];
  if (typeof a.timeOnProblemMs === 'number') parts.push(`${Math.round(a.timeOnProblemMs / 1000)}s on page`);
  if (typeof a.runsBeforeSubmit === 'number') parts.push(`${a.runsBeforeSubmit} run${a.runsBeforeSubmit === 1 ? '' : 's'}`);
  if (a.pasteChars && a.pasteChars > 0) parts.push(`pasted ${a.pasteChars} chars`);
  return parts.join(' · ');
}
