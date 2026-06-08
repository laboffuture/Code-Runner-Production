'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { api } from '@/lib/api-client';

interface ErrorAnalytics {
  errorRate: Array<{ time: string; rate: number }>;
  errorsByType: Array<{ name: string; value: number }>;
  errorsByEndpoint: Array<{ endpoint: string; count: number }>;
  errorLoadCorrelation: Array<{ time: string; errors: number; requests: number }>;
  timePatternsHourly: Array<{ hour: string; count: number }>;
  topErrorMessages: Array<{ message: string; count: number; lastSeen: string }>;
  recentErrors: Array<{ timestamp: string; endpoint: string; type: string; message: string; userId?: string }>;
  stats: {
    totalErrors24h: number;
    errorRate: number;
    mostCommonType: string;
    peakErrorHour: string;
    affectedEndpoints: number;
    errorTrend: 'up' | 'down' | 'stable';
  };
}

export default function ErrorAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '1d' | '7d' | '30d'>('1h');
  const [metrics, setMetrics] = useState<ErrorAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  // Red/Orange color scheme for errors
  const colors = {
    primary: '#EF4444',    // red-500
    secondary: '#F97316',  // orange-500
    accent: '#DC2626',     // red-600
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.admin.errorAnalytics(timeRange);
      setMetrics(data as any);
    } catch (error) {
      console.error('Failed to fetch error analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const PIE_COLORS = [colors.primary, colors.secondary, '#F59E0B', '#EAB308', '#84CC16'];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            ERROR ANALYTICS
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-fira">Application Health & Error Monitoring</p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
          <span className="text-xs font-orbitron font-bold text-gray-500 tracking-widest">TIME RANGE</span>
          {(['1h', '6h', '1d', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-all ${
                timeRange === range
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-red-600 hover:bg-red-100 border-2 border-red-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-fira">Loading error analytics...</p>
            </div>
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                label="Total Errors (24h)"
                value={metrics.stats.totalErrors24h}
                color="text-red-600"
              />
              <StatCard
                icon={<Activity className="w-5 h-5 text-orange-600" />}
                label="Error Rate"
                value={`${metrics.stats.errorRate}%`}
                color="text-orange-600"
              />
              <StatCard
                icon={
                  metrics.stats.errorTrend === 'up' ? <TrendingUp className="w-5 h-5 text-red-600" /> :
                  metrics.stats.errorTrend === 'down' ? <TrendingDown className="w-5 h-5 text-green-600" /> :
                  <Minus className="w-5 h-5 text-gray-600" />
                }
                label="Trend"
                value={metrics.stats.errorTrend.toUpperCase()}
                color={
                  metrics.stats.errorTrend === 'up' ? 'text-red-600' :
                  metrics.stats.errorTrend === 'down' ? 'text-green-600' :
                  'text-gray-600'
                }
              />
              <StatCard
                icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                label="Most Common"
                value={metrics.stats.mostCommonType}
                color="text-amber-600"
              />
              <StatCard
                icon={<Activity className="w-5 h-5 text-purple-600" />}
                label="Peak Hour"
                value={metrics.stats.peakErrorHour}
              />
              <StatCard
                icon={<AlertTriangle className="w-5 h-5 text-blue-600" />}
                label="Affected Endpoints"
                value={metrics.stats.affectedEndpoints}
                subtext="endpoints"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Error Rate Over Time */}
              <ChartCard title="Error Rate Over Time" subtitle="Errors per interval">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={metrics.errorRate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} label={{ value: 'Errors', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="rate" stroke={colors.primary} strokeWidth={2} dot={{ r: 4 }} name="Error Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Error Distribution by Type */}
              <ChartCard title="Error Distribution by Type" subtitle="Breakdown of error categories">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.errorsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics.errorsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Error Distribution by Endpoint */}
              <ChartCard title="Errors by Endpoint" subtitle="Top failing API endpoints">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.errorsByEndpoint}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                    <XAxis dataKey="endpoint" tick={{ fontSize: 10, fill: '#6B7280' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill={colors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Error-Load Correlation */}
              <ChartCard title="Error-Load Correlation" subtitle="Errors vs request volume">
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={metrics.errorLoadCorrelation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6B7280' }} label={{ value: 'Errors', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6B7280' }} label={{ value: 'Requests', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="errors" stroke={colors.primary} strokeWidth={2} name="Errors" />
                    <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} name="Requests" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Hourly Pattern */}
            <ChartCard title="Hourly Error Pattern" subtitle="Error distribution across 24 hours">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.timePatternsHourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill={colors.secondary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Top Error Messages & Recent Errors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Error Messages */}
              <ChartCard title="Top Error Messages" subtitle="Most frequent error messages">
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {metrics.topErrorMessages.map((error, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {error.count}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-fira text-gray-900 break-words">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-1">Last seen: {new Date(error.lastSeen).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              {/* Recent Errors Table */}
              <ChartCard title="Recent Errors" subtitle="Latest error occurrences">
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-red-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-orbitron font-bold text-red-700">TIME</th>
                        <th className="px-3 py-2 text-left font-orbitron font-bold text-red-700">ENDPOINT</th>
                        <th className="px-3 py-2 text-left font-orbitron font-bold text-red-700">TYPE</th>
                        <th className="px-3 py-2 text-left font-orbitron font-bold text-red-700">MESSAGE</th>
                      </tr>
                    </thead>
                    <tbody className="font-fira">
                      {metrics.recentErrors.map((error, idx) => (
                        <tr key={idx} className="border-t border-red-100 hover:bg-red-50">
                          <td className="px-3 py-2 text-gray-600">{new Date(error.timestamp).toLocaleTimeString()}</td>
                          <td className="px-3 py-2 text-gray-600 truncate max-w-[150px]">{error.endpoint}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              {error.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600 text-[10px] truncate max-w-xs">{error.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 font-fira">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color }: { icon: React.ReactNode; label: string; value: string | number; subtext?: string; color?: string }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] font-orbitron font-bold text-gray-500 tracking-widest uppercase">{label}</p>
      </div>
      <p className={`text-2xl font-orbitron font-black ${color || 'text-gray-900'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtext && <p className="text-[10px] text-gray-400 font-fira mt-1">{subtext}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="font-orbitron font-bold text-sm text-gray-900 tracking-wide">{title}</h3>
        <p className="text-xs text-gray-500 font-fira mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
