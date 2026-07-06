'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { KeyRound, Loader2, X, Eye, EyeOff, Check } from 'lucide-react';

// Mirrors the server passwordSchema for instant feedback; the API is the real gate.
function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return 'At least 8 characters';
  if (pw.length > 100) return 'At most 100 characters';
  if (!/[a-z]/.test(pw)) return 'Include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Include an uppercase letter';
  if (!/\d/.test(pw)) return 'Include a number';
  return null;
}

export function ResetPasswordDialog({
  studentId, studentUsername, onClose,
}: {
  studentId: string;
  studentUsername: string;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneValue, setDoneValue] = useState<string | null>(null);

  const issue = newPassword ? passwordIssue(newPassword) : null;
  const canSubmit = !busy && !issue && newPassword.length > 0 && confirmText === studentUsername;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.teacher.resetStudentPassword(studentId, { newPassword });
      setDoneValue(newPassword);
    } catch (e: any) {
      setError(e?.message || 'Reset failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#76B900]" />
            <h3 className="font-orbitron text-lg font-bold text-gray-900">Reset Password</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {doneValue ? (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-5 w-5 text-[#76B900]" />
              <span><span className="font-semibold">{studentUsername}</span>&apos;s password has been reset.</span>
            </div>
            <p className="mb-2 text-sm text-gray-600">Give them this new password — it won&apos;t be shown again:</p>
            <div className="mb-4 break-all rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900">
              {doneValue}
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="rounded-lg bg-[#76B900] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Done</button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Set a new password for <span className="font-semibold">{studentUsername}</span>. Read it to them so they can sign in — there is no email reset.
            </p>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">New password</label>
            <div className="relative mb-1">
              <input
                type={show ? 'text' : 'password'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {issue && <p className="mb-2 text-xs text-amber-600">{issue}</p>}

            <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Type <span className="font-mono text-gray-800">{studentUsername}</span> to confirm
            </label>
            <input
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={studentUsername}
            />

            {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-lg bg-[#76B900] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
