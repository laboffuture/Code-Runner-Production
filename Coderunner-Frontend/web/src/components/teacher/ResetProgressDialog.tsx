'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface SessionOpt { session_id: number; level_number: number; session_title: string; }

export function ResetProgressDialog({
  studentId, studentUsername, onClose, onComplete,
}: {
  studentId: string;
  studentUsername: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [scope, setScope] = useState<'full' | 'from-session'>('full');
  const [sessions, setSessions] = useState<SessionOpt[]>([]);
  const [fromSessionId, setFromSessionId] = useState<number | ''>('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.teacher.getResetOptions(studentId)
      .then((d: any) => {
        const s: SessionOpt[] = d.sessions || [];
        setSessions(s);
        if (s.length > 0) setFromSessionId(s[0].session_id);
      })
      .catch(() => {});
  }, [studentId]);

  const canSubmit =
    confirmText === studentUsername &&
    !busy &&
    (scope === 'full' || (scope === 'from-session' && fromSessionId !== ''));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.teacher.resetStudent(studentId, {
        scope,
        fromSessionId: scope === 'from-session' ? Number(fromSessionId) : undefined,
      });
      onComplete();
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
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h3 className="font-orbitron text-lg font-bold text-gray-900">Reset Progress</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          This permanently resets <span className="font-semibold">{studentUsername}</span>&apos;s learning progress.
          Their account, character, class, and integrity record are kept. This cannot be undone.
        </p>

        <div className="mb-4 space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="radio" name="scope" checked={scope === 'full'} onChange={() => setScope('full')} />
            Full reset (back to the start)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="radio" name="scope" checked={scope === 'from-session'} onChange={() => setScope('from-session')} disabled={sessions.length === 0} />
            From a session onward
          </label>
          {scope === 'from-session' && (
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={fromSessionId}
              onChange={(e) => setFromSessionId(Number(e.target.value))}
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  L{s.level_number} · {s.session_title}
                </option>
              ))}
            </select>
          )}
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
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
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
