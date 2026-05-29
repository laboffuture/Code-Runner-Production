'use client';

import { Calendar } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ActivityCalendarProps {
  data: any;
}

// Helper: format date as YYYY-MM-DD in LOCAL timezone (not UTC)
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_GAP = 8;  // px gap between month blocks
const CELL_GAP = 3;   // px gap between cells within a block

export function ActivityCalendar({ data }: ActivityCalendarProps) {
  const { accentColor } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cellSize, setCellSize] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridAreaRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean; x: number; y: number; date: string; count: number;
  }>({ visible: false, x: 0, y: 0, date: '', count: 0 });

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => { setMounted(true); }, []);

  // Build submission map from API data
  const submissionMap = useMemo(() => {
    const map = new Map<string, number>();
    const calendar = data?.submissionCalendar || [];
    calendar.forEach((item: any) => {
      const key = toLocalDateStr(new Date(item.date));
      map.set(key, (map.get(key) || 0) + (item.count || 0));
    });
    return map;
  }, [data]);

  // Build one grid per month, sized exactly to the real calendar for the current year.
  // Each month gets Math.ceil((daysInMonth + firstWeekday) / 7) week-columns,
  // so March 2026 (starts Sunday) gets 5 columns = 5 Sundays.
  const { monthGroups, totalSubmissions, currentStreak } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();

    let total = 0;
    type Cell = { date: string; count: number; padding: boolean };
    type Group = { label: string; numWeeks: number; grid: Cell[][] };
    const groups: Group[] = [];

    for (let m = 0; m < 12; m++) {
      const firstDay  = new Date(year, m, 1);
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const startDow  = firstDay.getDay(); // 0 = Sunday
      const numWeeks  = Math.ceil((daysInMonth + startDow) / 7);

      const weekCols: Cell[][] = [];
      for (let w = 0; w < numWeeks; w++) {
        const col: Cell[] = [];
        for (let dow = 0; dow < 7; dow++) {
          const dayNum = w * 7 + dow - startDow + 1; // 1-indexed
          if (dayNum < 1 || dayNum > daysInMonth) {
            // Padding: before the 1st or after the last — render transparently
            col.push({ date: '', count: -2, padding: true });
          } else {
            const dateObj = new Date(year, m, dayNum);
            const isFuture = dateObj > today;
            const dateStr = isFuture ? '' : toLocalDateStr(dateObj);
            const count = isFuture ? -1 : (submissionMap.get(dateStr) || 0);
            if (!isFuture) total += count;
            col.push({ date: dateStr, count, padding: false });
          }
        }
        weekCols.push(col);
      }

      groups.push({
        label: firstDay.toLocaleDateString('en-US', { month: 'short' }),
        numWeeks,
        grid: weekCols,
      });
    }

    // Current streak (days in a row up to today with submissions)
    let streak = 0;
    const sc = new Date(today);
    while (true) {
      const key = toLocalDateStr(sc);
      if (submissionMap.has(key) && (submissionMap.get(key) || 0) > 0) {
        streak++;
        sc.setDate(sc.getDate() - 1);
      } else break;
    }

    return { monthGroups: groups, totalSubmissions: total, currentStreak: streak };
  }, [submissionMap]);

  // Total week columns across all 12 months (e.g., 52–53 for most years)
  const totalWeekCols = useMemo(
    () => monthGroups.reduce((s, g) => s + g.numWeeks, 0),
    [monthGroups],
  );

  // Resize observer: recompute cell size whenever container width changes
  useEffect(() => {
    const el = gridAreaRef.current;
    if (!el || monthGroups.length === 0) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      const interGroupGaps = (monthGroups.length - 1) * MONTH_GAP;
      const intraGroupGaps = monthGroups.reduce((s, g) => s + (g.numWeeks - 1) * CELL_GAP, 0);
      const available = w - interGroupGaps - intraGroupGaps;
      setCellSize(Math.max(6, available / totalWeekCols));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [totalWeekCols, monthGroups.length]);

  if (!mounted) return null;

  const getIntensityStyle = (count: number, padding: boolean): React.CSSProperties => {
    if (padding) return { backgroundColor: 'transparent', border: 'none' };
    if (count < 0)  return { backgroundColor: '#f1f5f9', border: `1px dashed #cbd5e1` };
    if (count === 0) return { backgroundColor: '#e2e8f0', border: `1px solid ${hexToRgba(accentColor, 0.15)}` };
    if (count <= 2) return { backgroundColor: hexToRgba(accentColor, 0.3),  border: `1px solid ${hexToRgba(accentColor, 0.3)}` };
    if (count <= 4) return { backgroundColor: hexToRgba(accentColor, 0.55), border: `1px solid ${hexToRgba(accentColor, 0.4)}` };
    if (count <= 6) return { backgroundColor: hexToRgba(accentColor, 0.8),  border: `1px solid ${hexToRgba(accentColor, 0.5)}` };
    return { backgroundColor: accentColor, border: `1px solid ${accentColor}` };
  };

  const formatTooltipDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    cell: { date: string; count: number; padding: boolean },
  ) => {
    if (cell.padding || !cell.date || cell.count < 0) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    setTooltip({
      visible: true,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
      date: cell.date,
      count: cell.count,
    });
  };

  const handleMouseLeave = () => setTooltip(t => ({ ...t, visible: false }));

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div
      ref={containerRef}
      className="relative bg-white border-2 rounded-xl p-6 transition-colors"
      style={{ borderColor: hexToRgba(accentColor, 0.4) }}
    >
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 8, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl font-rajdhani whitespace-nowrap">
            <div className="font-bold text-center">
              {tooltip.count === 0
                ? 'No submissions'
                : `${tooltip.count} submission${tooltip.count !== 1 ? 's' : ''}`}
            </div>
            <div className="text-gray-400 text-center mt-0.5">{formatTooltipDate(tooltip.date)}</div>
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #111827' }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: accentColor }} />
          <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">SUBMISSION ACTIVITY</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="font-orbitron font-black text-gray-900">{totalSubmissions}</span>
            <span className="text-gray-500 ml-1 font-rajdhani">submissions</span>
          </div>
          <div>
            <span className="font-orbitron font-black text-gray-900">{currentStreak}</span>
            <span className="text-gray-500 ml-1 font-rajdhani">day streak</span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="w-full flex items-start gap-0">
        {/* Day-of-week labels — aligned with cell rows, offset by the 18px month label */}
        <div className="flex flex-col shrink-0 w-5 mt-[18px]" style={{ gap: `${CELL_GAP}px` }}>
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="flex items-center justify-end pr-1 text-[8px] text-gray-400 font-fira leading-none"
              style={{ height: `${cellSize}px` }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Month blocks — justify-between absorbs any sub-pixel rounding residue */}
        <div
          className="flex-1 min-w-0 flex items-start"
          style={{ justifyContent: 'space-between' }}
          ref={gridAreaRef}
        >
          {monthGroups.map((group, gi) => (
            <div
              key={gi}
              className="flex flex-col"
              style={{
                // Explicit block width so every month's cell = exactly cellSize px
                width: `${group.numWeeks * cellSize + (group.numWeeks - 1) * CELL_GAP}px`,
                flexShrink: 0,
              }}
            >
              {/* Month label */}
              <div className="h-[18px] flex items-end pb-[3px] text-[10px] text-gray-500 font-rajdhani whitespace-nowrap">
                {group.label}
              </div>
              {/* 1fr columns divide block width equally → cellSize per column */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${group.numWeeks}, 1fr)`,
                  gap: `${CELL_GAP}px`,
                }}
              >
                {group.grid.map((weekCol, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: `${CELL_GAP}px` }}>
                    {weekCol.map((cell, di) => (
                      <div
                        key={`${gi}-${wi}-${di}`}
                        className={`rounded-[3px] ${!cell.padding && cell.date && cell.count >= 0 ? 'cursor-pointer hover:opacity-75' : ''}`}
                        style={{
                          ...getIntensityStyle(cell.count, cell.padding),
                          // Uniform height on every cell = same cellSize → rows align perfectly
                          height: `${cellSize}px`,
                        }}
                        onMouseEnter={e => handleMouseEnter(e, cell)}
                        onMouseLeave={handleMouseLeave}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-gray-500 font-rajdhani">
        <span>Less</span>
        <div className="flex gap-[3px]">
          <div className="w-[10px] h-[10px] rounded-[3px]" style={{ backgroundColor: '#e2e8f0', border: `1px solid ${hexToRgba(accentColor, 0.15)}` }} />
          <div className="w-[10px] h-[10px] rounded-[3px]" style={{ backgroundColor: hexToRgba(accentColor, 0.3) }} />
          <div className="w-[10px] h-[10px] rounded-[3px]" style={{ backgroundColor: hexToRgba(accentColor, 0.55) }} />
          <div className="w-[10px] h-[10px] rounded-[3px]" style={{ backgroundColor: hexToRgba(accentColor, 0.8) }} />
          <div className="w-[10px] h-[10px] rounded-[3px]" style={{ backgroundColor: accentColor }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
