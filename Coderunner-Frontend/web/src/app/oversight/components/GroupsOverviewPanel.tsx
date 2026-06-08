'use client';

import { useEffect, useState } from 'react';
import { Users2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { PanelCard } from '@/components/dashboard/PanelCard';

interface Group {
  classroomId: string;
  name: string;
  ageGroup: '11-14' | '15-18';
  teacherCount: number;
  studentCount: number;
  activeToday: number;
  levelDistribution: Record<string, number>;
}

// Fixed per-level colors for the distribution mini-bar (L1-L4).
const LEVEL_COLORS = ['#76B900', '#0ea5e9', '#16a34a', '#f59e0b'];

function LevelBar({ dist }: { dist: Record<string, number> }) {
  const segs = ['1', '2', '3', '4'].map((k) => dist?.[k] || 0);
  const sum = segs.reduce((a, b) => a + b, 0);

  if (sum === 0) {
    return <div className="h-2.5 w-40 rounded-full bg-gray-100" title="No level data" />;
  }

  return (
    <div className="h-2.5 w-40 rounded-full overflow-hidden flex bg-gray-100" title={`L1:${segs[0]} L2:${segs[1]} L3:${segs[2]} L4:${segs[3]}`}>
      {segs.map((v, i) =>
        v > 0 ? (
          <div key={i} style={{ width: `${(v / sum) * 100}%`, backgroundColor: LEVEL_COLORS[i] }} />
        ) : null
      )}
    </div>
  );
}

export function GroupsOverviewPanel() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = (await api.oversight.getGroups()) as any;
        setGroups(res.groups || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch oversight groups:', err);
        setError('Failed to load groups');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <PanelCard
      icon={Users2}
      title="Groups Overview"
      isLoading={isLoading}
      error={error}
      loadingLabel="Loading groups..."
      isEmpty={groups.length === 0}
      emptyIcon={Users2}
      emptyLabel="No groups yet"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-orbitron tracking-widest text-gray-500 border-b border-gray-200">
              <th className="py-3 pr-4">GROUP</th>
              <th className="py-3 pr-4">AGE</th>
              <th className="py-3 pr-4">TEACHERS</th>
              <th className="py-3 pr-4">STUDENTS</th>
              <th className="py-3 pr-4">ACTIVE TODAY</th>
              <th className="py-3 pr-4">LEVELS (L1-L4)</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.classroomId} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 font-orbitron font-bold text-gray-900">{g.name}</td>
                <td className="py-3 pr-4">
                  <Badge variant="outline" className="font-rajdhani border-gray-300 text-gray-600">
                    {g.ageGroup}
                  </Badge>
                </td>
                <td className="py-3 pr-4 font-rajdhani text-gray-700">{g.teacherCount}</td>
                <td className="py-3 pr-4 font-rajdhani text-gray-700">{g.studentCount}</td>
                <td className="py-3 pr-4">
                  {g.activeToday === 0 ? (
                    <Badge
                      variant="outline"
                      className="font-rajdhani"
                      style={{ color: '#d97706', backgroundColor: '#d977061a', borderColor: '#d9770655' }}
                    >
                      No activity today
                    </Badge>
                  ) : (
                    <span className="font-orbitron font-bold text-gray-900">{g.activeToday}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <LevelBar dist={g.levelDistribution} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelCard>
  );
}
