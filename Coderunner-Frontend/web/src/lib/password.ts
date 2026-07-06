// Client-side mirror of the server password policy (@code-runner/shared
// validation.utils.ts `passwordSchema`: 8–100 chars, upper + lower + digit).
// This is for INSTANT feedback only — the API remains the authoritative gate.
// Keep it in sync with the server schema if that policy ever changes.
export function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return 'At least 8 characters';
  if (pw.length > 100) return 'At most 100 characters';
  if (!/[a-z]/.test(pw)) return 'Include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Include an uppercase letter';
  if (!/\d/.test(pw)) return 'Include a number';
  return null;
}
