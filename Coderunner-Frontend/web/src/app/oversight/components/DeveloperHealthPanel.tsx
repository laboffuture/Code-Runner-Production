'use client';

import { useEffect, useState } from 'react';
import { Loader2, Bug } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { DelayBadge } from './DelayBadge';

interface Summary {
  totalOpen: number;
  breached: number;
  avgResolutionHours: number | null;
  totalResolved: number;
}

interface OldestOpen {
  id: string;
  title: string;
  delayHours: number;
  isBreached: boolean;
  thresholdHours: number;
}

function Chip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      className="flex-1 rounded-xl px-4 py-3 text-center"
      style={{ backgroundColor: `${color}1a`, border: `1px solid ${color}55` }}
    >
      <p className="text-2xl font-orbitron font-black" style={{ color }}>{value}</p>
      <p className="text-[10px] font-orbitron tracking-widest mt-1" style={{ color }}>{label}</p>
    </div>
  );
}

export function DeveloperHealthPanel() {
  const [summary, setSummary] = useState<Summary>({ totalOpen: 0, breached: 0, avgResolutionHours: null, totalResolved: 0 });
  const [oldestOpen, setOldestOpen] = useState<OldestOpen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = (await api.oversight.getDeveloperHealth()) as any;
        setSummary(res.summary || { totalOpen: 0, breached: 0, avgResolutionHours: null, totalResolved: 0 });
        setOldestOpen(res.oldestOpen || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch developer health:', err);
        setError('Failed to load developer health');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bug className="w-6 h-6 text-indigo-500" />
        <h2 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">Developer Health</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-sm text-gray-500 font-rajdhani">Loading developer health...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 font-rajdhani">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-6">
            <Chip label="OPEN BUGS" value={summary.totalOpen} color="#6366f1" />
            <Chip label="BREACHED" value={summary.breached} color="#dc2626" />
            <Chip
              label="AVG RESOLUTION"
              value={summary.avgResolutionHours == null ? '—' : `${Math.round(summary.avgResolutionHours)}h`}
              color="#0ea5e9"
            />
            <Chip label="RESOLVED" value={summary.totalResolved} color="#16a34a" />
          </div>

          <h3 className="text-[11px] font-orbitron tracking-widest text-gray-500 mb-3">OLDEST OPEN</h3>
          {oldestOpen.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 font-rajdhani">No open bugs</p>
            </div>
          ) : (
            <div>
              {oldestOpen.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                  <span className="font-orbitron font-bold text-sm text-gray-900 truncate">{b.title}</span>
                  <DelayBadge delayHours={b.delayHours} isBreached={b.isBreached} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
