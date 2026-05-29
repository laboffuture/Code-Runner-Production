'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ProblemChartProps {
  data: any;
}

export function ProblemChart({ data }: ProblemChartProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const primaryColor = theme.colors.primary;
  const lightColor = theme.colors.light;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Extract real stats from API data
  const stats = data?.stats || {};
  const easySolved = stats.easySolved || 0;
  const mediumSolved = stats.mediumSolved || 0;
  const hardSolved = stats.hardSolved || 0;
  const totalSolved = stats.totalSolved || 0;

  // Build difficulty distribution from real data
  const difficultyData = [
    { name: 'Easy', value: easySolved, color: '#22C55E' },
    { name: 'Medium', value: mediumSolved, color: '#F59E0B' },
    { name: 'Hard', value: hardSolved, color: '#EF4444' }
  ];

  // Build progress data from submission calendar
  const submissionCalendar = data?.submissionCalendar || [];
  const progressData = buildProgressData(submissionCalendar);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 shadow-lg p-3 rounded-lg" style={{ borderColor: `${lightColor}99` }}>
          <p className="font-orbitron font-bold text-gray-900">{label}</p>
          <p className="text-sm font-rajdhani text-gray-600">
            Solved: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border-2 rounded-xl p-6 transition-colors h-full" style={{ borderColor: `${lightColor}99` }}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5" style={{ color: primaryColor }} />
        <h3 className="text-lg font-orbitron font-bold text-gray-900 tracking-wider">PROBLEM SOLVING STATISTICS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div>
          <h4 className="text-sm font-orbitron font-bold text-gray-700 mb-4 tracking-wider">PROGRESS OVER TIME</h4>
          {progressData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="solvedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'Rajdhani' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'Rajdhani' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="solved"
                    stroke={primaryColor}
                    strokeWidth={2}
                    fill="url(#solvedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <div className="text-2xl font-orbitron font-black text-gray-900">{totalSolved}</div>
                <div className="text-sm text-gray-500 font-rajdhani">Total Problems Solved</div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-center">
              <div>
                <p className="text-gray-400 font-rajdhani">No problems solved yet</p>
                <p className="text-xs text-gray-400 font-rajdhani mt-2">Start solving to see your progress!</p>
              </div>
            </div>
          )}
        </div>

        {/* Difficulty Distribution */}
        <div>
          <h4 className="text-sm font-orbitron font-bold text-gray-700 mb-4 tracking-wider">DIFFICULTY DISTRIBUTION</h4>
          {totalSolved > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={difficultyData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelStyle={{ fontSize: '12px', fontFamily: 'Rajdhani', fontWeight: 'bold' }}
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border-2 shadow-lg p-3 rounded-lg" style={{ borderColor: `${lightColor}99` }}>
                            <p className="font-orbitron font-bold text-gray-900">{data.name}</p>
                            <p className="text-sm font-rajdhani text-gray-600">Solved: {data.value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-lg font-orbitron font-black text-green-600">{easySolved}</div>
                  <div className="text-xs text-gray-500 font-rajdhani">Easy</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="text-lg font-orbitron font-black text-yellow-600">{mediumSolved}</div>
                  <div className="text-xs text-gray-500 font-rajdhani">Medium</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-lg font-orbitron font-black text-red-600">{hardSolved}</div>
                  <div className="text-xs text-gray-500 font-rajdhani">Hard</div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-center">
              <div>
                <p className="text-gray-400 font-rajdhani">No problems solved yet</p>
                <p className="text-xs text-gray-400 font-rajdhani mt-2">Solve your first problem to see stats!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to build progress data from submission calendar
function buildProgressData(submissionCalendar: any[]): any[] {
  if (!submissionCalendar || submissionCalendar.length === 0) {
    return [];
  }

  // Group by month and count cumulative problems solved
  const monthlyData: { [key: string]: number } = {};
  let cumulative = 0;

  // Sort by date
  const sorted = [...submissionCalendar].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sorted.forEach(day => {
    const date = new Date(day.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    cumulative += day.count || 0;
    monthlyData[monthKey] = cumulative;
  });

  // Convert to chart format with month names
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Object.entries(monthlyData).map(([key, solved]) => {
    const [year, month] = key.split('-');
    return {
      month: months[parseInt(month) - 1],
      solved
    };
  });
}
