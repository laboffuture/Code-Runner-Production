'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';

const ACCENT = '#76B900';

// Mirrors the server passwordSchema (8–100 chars, upper + lower + digit) for
// instant feedback only — the API remains the real gate.
function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return 'At least 8 characters';
  if (pw.length > 100) return 'At most 100 characters';
  if (!/[a-z]/.test(pw)) return 'Include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Include an uppercase letter';
  if (!/\d/.test(pw)) return 'Include a number';
  return null;
}

export function ChangePasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const issue = next ? passwordIssue(next) : null;
  const mismatch = confirm.length > 0 && next !== confirm;
  const sameAsCurrent = next.length > 0 && next === current;
  const canSubmit =
    !busy && current.length > 0 && next.length > 0 && confirm.length > 0 &&
    !issue && !mismatch && !sameAsCurrent;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      await api.auth.changePassword(current, next);
      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) {
      setError(err?.message || 'Could not update password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm text-gray-900 focus:border-[#76B900] focus:outline-none';

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <KeyRound className="h-4 w-4" style={{ color: ACCENT }} />
        <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-gray-700">Change Password</h3>
      </div>
      <p className="mb-4 font-rajdhani text-sm text-gray-500">
        Update the password you use to sign in. You&apos;ll need your current password.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Current password</label>
          <input
            type={show ? 'text' : 'password'}
            className={inputCls}
            value={current}
            onChange={(e) => { setCurrent(e.target.value); setSuccess(false); }}
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">New password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              className={inputCls}
              value={next}
              onChange={(e) => { setNext(e.target.value); setSuccess(false); }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={show ? 'Hide passwords' : 'Show passwords'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {issue && <p className="mt-1 text-xs text-amber-600">{issue}</p>}
          {sameAsCurrent && <p className="mt-1 text-xs text-amber-600">Choose a password different from your current one</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Confirm new password</label>
          <input
            type={show ? 'text' : 'password'}
            className={inputCls}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setSuccess(false); }}
            autoComplete="new-password"
          />
          {mismatch && <p className="mt-1 text-xs text-rose-600">Passwords don&apos;t match</p>}
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="text-sm font-semibold" style={{ color: ACCENT }}>Password updated.</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-orbitron text-sm font-bold uppercase tracking-wider text-white transition disabled:opacity-40"
          style={{ backgroundColor: ACCENT }}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
