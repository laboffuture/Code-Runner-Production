'use client';

import { useEffect, useState } from 'react';
import { Bug } from 'lucide-react';
import { api } from '@/lib/api-client';
import { DelayBadge } from './DelayBadge';
import { PanelCard } from '@/components/dashboard/PanelCard';
import { StatChip } from '@/components/dashboard/StatChip';

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
    <PanelCard
      icon={Bug}
      title="Developer Health"
      isLoading={isLoading}
      error={error}
      loadingLabel="Loading developer health..."
    >
      <div className="flex gap-3 mb-6">
        <StatChip label="OPEN BUGS" value={summary.totalOpen} color="#d97706" />
        <StatChip label="BREACHED" value={summary.breached} color="#dc2626" />
        <StatChip
          label="AVG RESOLUTION"
          value={summary.avgResolutionHours == null ? '—' : `${Math.round(summary.avgResolutionHours)}h`}
          color="#0ea5e9"
        />
        <StatChip label="RESOLVED" value={summary.totalResolved} color="#16a34a" />
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
    </PanelCard>
  );
}
