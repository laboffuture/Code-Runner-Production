'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Loader2, HelpCircle } from 'lucide-react';
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
  in_progress: 'text-sky-600',
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
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <p className="mb-6 font-rajdhani text-sm text-gray-600">Student doubts awaiting your response</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#76B900]" />
        </div>
      ) : error ? (
        <div className="py-20 text-center font-rajdhani text-red-600">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center">
          <HelpCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="font-rajdhani text-gray-400">No doubts in your inbox.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border-2 border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-orbitron text-base font-bold text-gray-900">{t.title}</span>
                    <DelayBadge delayHours={t.delayHours} isBreached={t.isBreached} />
                    <span className={`font-orbitron text-xs font-bold tracking-wide ${STATUS_STYLE[t.status]}`}>
                      {t.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="mb-2 whitespace-pre-wrap font-rajdhani text-sm text-gray-700">{t.description}</p>
                  <div className="flex items-center gap-2 font-rajdhani text-xs text-gray-500">
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
                      className="rounded-lg bg-[#76B900] px-4 py-2 font-orbitron text-xs font-bold tracking-wider text-white hover:bg-[#68a300] disabled:opacity-50"
                    >
                      {pendingId === t.id ? 'WORKING…' : 'RESPOND'}
                    </button>
                  )}
                  {t.status === 'in_progress' && (
                    <button
                      onClick={() => act(t.id, 'resolve')}
                      disabled={pendingId === t.id}
                      className="rounded-lg bg-emerald-600 px-4 py-2 font-orbitron text-xs font-bold tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {pendingId === t.id ? 'WORKING…' : 'RESOLVE'}
                    </button>
                  )}
                  {t.status === 'resolved' && (
                    <span className="rounded-lg bg-gray-100 px-4 py-2 font-orbitron text-xs font-bold tracking-wider text-gray-400">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
