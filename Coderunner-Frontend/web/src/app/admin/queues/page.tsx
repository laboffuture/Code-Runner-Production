'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { api } from '@/lib/api-client';
import AdminHeader from '../components/AdminHeader';

interface QueueMetrics {
  queueDepth: Array<{ time: string; waiting: number; active: number; delayed: number }>;
  throughput: Array<{ time: string; added: number; completed: number }>;
  waitTime: Array<{ time: string; avgWait: number; p95Wait: number }>;
  ageDistribution: Array<{ bucket: string; count: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
  recentJobs: Array<{ id: string; timestamp: string; status: string; duration: number; error?: string }>;
  stats: {
    currentWaiting: number;
    currentActive: number;
    jobsPerHour: number;
    avgWaitTime: number;
    successRate: number;
    totalProcessed: number;
    healthStatus: 'healthy' | 'warning' | 'critical';
  };
}

export default function QueuesPage() {
  const [queueType, setQueueType] = useState<'execution' | 'submission'>('execution');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '1d' | '7d' | '30d'>('1h');
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  // Color schemes based on queue type
  const colors = queueType === 'execution'
    ? { primary: '#3B82F6', secondary: '#06B6D4', accent: '#0EA5E9' }  // Blue/Cyan
    : { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#7C3AED' }; // Purple/Violet

  const queueTitle = queueType === 'execution' ? 'EXECUTION QUEUE' : 'SUBMISSION QUEUE';
  const queueSubtitle = queueType === 'execution'
    ? 'Code Execution Jobs · Python Runtime'
    : 'Problem Grading Jobs · Test Case Validation';

  useEffect(() => {
    fetchMetrics();
  }, [timeRange, queueType]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.admin.queueMetrics(timeRange, queueType);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch queue metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const PIE_COLORS = [colors.primary, '#10B981', '#EF4444', '#F59E0B', '#6B7280'];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider flex items-center gap-3">
            <Activity className="w-8 h-8" style={{ color: colors.primary }} />
            {queueTitle}
          </h1>
          <p className="text-sm text-gray-600 mt-2 font-fira">{queueSubtitle}</p>
        </div>

        {/* Queue Type Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mb-6 flex items-center gap-4">
          <span className="text-xs font-orbitron font-bold text-gray-500 tracking-widest">QUEUE TYPE:</span>
          <button
            onClick={() => setQueueType('execution')}
            className={`px-4 py-2 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-all ${
              queueType === 'execution'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            EXECUTION
          </button>
          <button
            onClick={() => setQueueType('submission')}
            className={`px-4 py-2 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-all ${
              queueType === 'submission'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            SUBMISSION
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mb-6 flex items-center gap-2">
          <span className="text-xs font-orbitron font-bold text-gray-500 tracking-widest">TIME RANGE:</span>
          {(['1h', '6h', '1d', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-all ${
                timeRange === range
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              style={timeRange === range ? { backgroundColor: colors.primary } : {}}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
              <p className="text-gray-500 font-fira">Loading metrics...</p>
            </div>
          </div>
        ) : metrics ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <StatCard
                icon={<Activity className="w-5 h-5" style={{ color: colors.primary }} />}
                label="Health Status"
                value={metrics.stats.healthStatus.toUpperCase()}
                color={
                  metrics.stats.healthStatus === 'healthy' ? 'text-emerald-600' :
                  metrics.stats.healthStatus === 'warning' ? 'text-amber-600' :
                  'text-red-600'
                }
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-amber-600" />}
                label="Waiting"
                value={metrics.stats.currentWaiting}
                subtext="jobs"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                label="Active"
                value={metrics.stats.currentActive}
                subtext="processing"
              />
              <StatCard
                icon={<Activity className="w-5 h-5" style={{ color: colors.accent }} />}
                label="Throughput"
                value={metrics.stats.jobsPerHour}
                subtext="jobs/hour"
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-gray-600" />}
                label="Avg Wait"
                value={`${metrics.stats.avgWaitTime.toFixed(1)}s`}
              />
              <StatCard
                icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                label="Success Rate"
                value={`${metrics.stats.successRate.toFixed(1)}%`}
              />
              <StatCard
                icon={<Activity className="w-5 h-5" style={{ color: colors.secondary }} />}
                label="Total Processed"
                value={metrics.stats.totalProcessed}
                subtext="jobs"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Queue Depth Over Time */}
              <ChartCard title="Queue Depth Over Time" subtitle="Waiting, Active, and Delayed jobs">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={metrics.queueDepth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="waiting" stackId="1" stroke={colors.primary} fill={colors.primary} name="Waiting" />
                    <Area type="monotone" dataKey="active" stackId="1" stroke={colors.accent} fill={colors.accent} name="Active" />
                    <Area type="monotone" dataKey="delayed" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Delayed" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Job Throughput */}
              <ChartCard title="Job Throughput" subtitle="Jobs added vs completed per interval">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={metrics.throughput}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="added" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Jobs Added" />
                    <Line type="monotone" dataKey="completed" stroke={colors.primary} strokeWidth={2} dot={{ r: 3 }} name="Jobs Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Wait Time Trends */}
              <ChartCard title="Wait Time Trends" subtitle="Average and P95 wait times">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={metrics.waitTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} label={{ value: 'Seconds', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6B7280' } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="avgWait" stroke={colors.primary} strokeWidth={2} dot={{ r: 3 }} name="Avg Wait" />
                    <Line type="monotone" dataKey="p95Wait" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="P95 Wait" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Job Age Distribution */}
              <ChartCard title="Job Age Distribution" subtitle="How long jobs have been waiting">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill={colors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Status Distribution & Recent Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Distribution Pie Chart */}
              <ChartCard title="Job Status Distribution" subtitle="Completed, failed, timeout breakdown">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Recent Jobs Table */}
              <div className="lg:col-span-2">
                <ChartCard title="Recent Jobs" subtitle="Latest processed jobs">
                  <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-orbitron font-bold text-gray-600">JOB ID</th>
                          <th className="px-3 py-2 text-left font-orbitron font-bold text-gray-600">TIMESTAMP</th>
                          <th className="px-3 py-2 text-left font-orbitron font-bold text-gray-600">STATUS</th>
                          <th className="px-3 py-2 text-left font-orbitron font-bold text-gray-600">DURATION</th>
                          <th className="px-3 py-2 text-left font-orbitron font-bold text-gray-600">ERROR</th>
                        </tr>
                      </thead>
                      <tbody className="font-fira">
                        {metrics.recentJobs.map((job, idx) => (
                          <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-600">{job.id}</td>
                            <td className="px-3 py-2 text-gray-600">{new Date(job.timestamp).toLocaleString()}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                  job.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                  job.status === 'failed' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {job.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600">{job.duration ? job.duration.toFixed(2) + 's' : '-'}</td>
                            <td className="px-3 py-2 text-red-600 text-[10px] truncate max-w-xs">{job.error || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ChartCard>
              </div>
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="font-orbitron font-bold text-sm text-gray-900 tracking-wide">{title}</h3>
        <p className="text-xs text-gray-500 font-fira mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
