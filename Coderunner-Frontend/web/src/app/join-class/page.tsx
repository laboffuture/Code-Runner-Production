'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

export default function JoinClass() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login?redirect=/join-class');
  }, [isLoading, isAuthenticated, router]);

  const join = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = (await api.classroom.join(code.trim())) as { classroomName: string };
      setJoined(r.classroomName);
    } catch (e: any) {
      // api-client attaches the HTTP status as e.status; match on that rather
      // than substring-scanning the message (the message is the backend's
      // `error` string like "Not Found", which never contains "404"/"403").
      const status = e?.status;
      setError(
        status === 404
          ? 'No class found for that code. Check with your teacher.'
          : status === 403
          ? 'Only students can join a class.'
          : 'Could not join. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] to-[#111827] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-xl text-white tracking-wider">JOIN A CLASS</h1>
            <p className="text-sm text-gray-400 font-rajdhani">Enter the code your teacher gave you</p>
          </div>
        </div>

        {joined ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-rajdhani text-lg">
              You joined <span className="font-bold">{joined}</span>!
            </p>
            <button
              onClick={() => router.push('/home')}
              className="mt-5 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-orbitron text-xs tracking-wider"
            >
              GO TO HOME
            </button>
          </div>
        ) : (
          <>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CLASS CODE"
              maxLength={6}
              className="w-full text-center tracking-[0.4em] font-fira text-2xl px-4 py-3 rounded-xl bg-black/30 border-2 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-400 outline-none mb-4 uppercase"
            />
            {error && <p className="text-rose-400 text-sm font-rajdhani mb-3 text-center">{error}</p>}
            <button
              onClick={join}
              disabled={busy || !code.trim()}
              className="w-full px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-orbitron font-bold text-sm tracking-wider flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {busy ? 'JOINING…' : 'JOIN CLASS'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
