'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Inbox, Loader2, HelpCircle } from 'lucide-react';
import { DelayBadge } from '@/app/oversight/components/DelayBadge';

interface Ticket {
  id: string;
  type: 'bug_report' | 'doubt';
  status: 'open' | 'in_progress' | 'resolved';
  targetRole: string;
  title: string;
  description: string;
  student: string;
  classroom: string | null;
  createdAt: string;
  delayHours: number;
  isBreached: boolean;
  thresholdHours: number;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATUS_STYLE: Record<Ticket['status'], string> = {
  open: 'text-amber-600',
  in_progress: 'text-indigo-600',
  resolved: 'text-emerald-600',
};

export default function TeacherInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.tickets.mine()) as any;
      setTickets(data.tickets || []);
    } catch (e: any) {
      const msg = e?.message || '';
      setError(
        msg.includes('403') || msg.includes('401')
          ? 'Access denied. Teacher privileges required.'
          : 'Failed to load inbox.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id: string, action: 'respond' | 'resolve') => {
    setPendingId(id);
    try {
      if (action === 'respond') await api.tickets.respond(id);
      else await api.tickets.resolve(id);
      await load();
    } catch {
      alert(`Failed to ${action} this doubt. Please try again.`);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center gap-3">
          <Inbox className="w-7 h-7 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider">INBOX</h1>
            <p className="text-sm text-gray-600 font-fira">Student doubts awaiting your response</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-rajdhani">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-rajdhani">No doubts in your inbox.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-orbitron font-bold text-base text-gray-900">{t.title}</span>
                      <DelayBadge delayHours={t.delayHours} isBreached={t.isBreached} />
                      <span className={`font-orbitron font-bold text-xs tracking-wide ${STATUS_STYLE[t.status]}`}>
                        {t.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-rajdhani mb-2 whitespace-pre-wrap">{t.description}</p>
                    <div className="flex items-center gap-2 text-xs font-rajdhani text-gray-500">
                      <span className="font-bold text-gray-700">{t.student}</span>
                      <span>·</span>
                      <span>{t.classroom || '—'}</span>
                      <span>·</span>
                      <span>{relativeTime(t.createdAt)}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {t.status === 'open' && (
                      <button
                        onClick={() => act(t.id, 'respond')}
                        disabled={pendingId === t.id}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-orbitron font-bold text-xs tracking-wider"
                      >
                        {pendingId === t.id ? 'WORKING…' : 'RESPOND'}
                      </button>
                    )}
                    {t.status === 'in_progress' && (
                      <button
                        onClick={() => act(t.id, 'resolve')}
                        disabled={pendingId === t.id}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-orbitron font-bold text-xs tracking-wider"
                      >
                        {pendingId === t.id ? 'WORKING…' : 'RESOLVE'}
                      </button>
                    )}
                    {t.status === 'resolved' && (
                      <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 font-orbitron font-bold text-xs tracking-wider">
                        RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
