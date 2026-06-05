'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Bug, HelpCircle, Radar } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { DelayBadge } from './DelayBadge';

interface Ticket {
  id: string;
  type: 'bug_report' | 'doubt';
  status: 'open' | 'in_progress' | 'resolved';
  targetRole: 'developer' | 'teacher';
  title: string;
  student: string;
  classroom: string | null;
  createdAt: string;
  delayHours: number;
  isBreached: boolean;
  thresholdHours: number;
}

type Filter = 'all' | 'open' | 'breached';

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

function TicketRow({ t }: { t: Ticket }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-orbitron font-bold text-sm text-gray-900 truncate">{t.title}</span>
          <DelayBadge delayHours={t.delayHours} isBreached={t.isBreached} />
        </div>
        <div className="flex items-center gap-2 text-xs font-rajdhani text-gray-500">
          <span className="text-gray-700">{t.student}</span>
          <span>·</span>
          <span>{t.classroom || '—'}</span>
          <span>·</span>
          <span>{relativeTime(t.createdAt)}</span>
          <span>·</span>
          <span className={`font-orbitron font-bold tracking-wide ${STATUS_STYLE[t.status]}`}>
            {t.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

function Column({
  title,
  icon: Icon,
  tickets,
}: {
  title: string;
  icon: React.ElementType;
  tickets: Ticket[];
}) {
  const openCount = tickets.filter((t) => t.status !== 'resolved').length;
  const breachedCount = tickets.filter((t) => t.isBreached).length;

  return (
    <Card className="bg-white border-2 border-gray-200 rounded-xl p-6 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-indigo-500" />
          <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">{title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-orbitron font-bold">
          <span className="text-amber-600">{openCount} OPEN</span>
          <span className="text-red-600">{breachedCount} BREACHED</span>
        </div>
      </div>

      {tickets.length === 0 ? (
        <p className="text-center py-8 text-gray-400 font-rajdhani text-sm">No tickets</p>
      ) : (
        <div>
          {tickets.map((t) => (
            <TicketRow key={t.id} t={t} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function AccountabilityPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = (await api.oversight.getTickets()) as any;
        setTickets(res.tickets || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch oversight tickets:', err);
        setError('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'breached') return tickets.filter((t) => t.isBreached === true);
    if (filter === 'open') return tickets.filter((t) => t.status !== 'resolved');
    return tickets;
  }, [tickets, filter]);

  const bugReports = filtered.filter((t) => t.targetRole === 'developer');
  const doubts = filtered.filter((t) => t.targetRole === 'teacher');

  const filterBtn = (f: Filter) =>
    `px-4 py-1.5 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-colors ${
      filter === f ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Radar className="w-6 h-6 text-indigo-500" />
        <h2 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">Accountability Radar</h2>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <button className={filterBtn('all')} onClick={() => setFilter('all')}>
          ALL
        </button>
        <button className={filterBtn('open')} onClick={() => setFilter('open')}>
          OPEN
        </button>
        <button className={filterBtn('breached')} onClick={() => setFilter('breached')}>
          BREACHED
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-sm text-gray-500 font-rajdhani">Loading tickets...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 font-rajdhani">{error}</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <Radar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-rajdhani">No tickets yet</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <Column title="Bug Reports" icon={Bug} tickets={bugReports} />
          <Column title="Doubts" icon={HelpCircle} tickets={doubts} />
        </div>
      )}
    </div>
  );
}
