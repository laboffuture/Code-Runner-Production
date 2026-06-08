'use client';

import { useState, useEffect } from 'react';
import { Box, Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Layers, Cpu } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/lib/api-client';

type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

export default function DockerMetricsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [poolStatusData, setPoolStatusData] = useState<Array<{ time: string; ready: number; busy: number }>>([]);
  const [acquisitionTimeData, setAcquisitionTimeData] = useState<Array<{ time: string; value: number }>>([]);
  const [lifecycleData, setLifecycleData] = useState<Array<{ time: string; created: number; destroyed: number; reused: number }>>([]);
  const [resourceUsageData, setResourceUsageData] = useState<Array<{ time: string; cpu: number; memory: number }>>([]);
  const [containerDetails, setContainerDetails] = useState<Array<{ id: string; status: string; age: string; jobs: number; memory: string }>>([]);
  const [stats, setStats] = useState({
    totalContainers: 0,
    readyContainers: 0,
    busyContainers: 0,
    targetSize: 0,
    saturation: 0,
    avgAcquisitionTime: 0,
    totalJobsExecuted: 0,
    avgContainerAge: '0h',
    healthStatus: 'healthy' as 'healthy' | 'warning' | 'critical',
  });

  const timeRanges = [
    { label: '1H', value: '1h' as TimeRange },
    { label: '6H', value: '6h' as TimeRange },
    { label: '1D', value: '1d' as TimeRange },
    { label: '7D', value: '7d' as TimeRange },
    { label: '30D', value: '30d' as TimeRange },
  ];

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.admin.dockerMetrics(timeRange);
      setPoolStatusData(data.poolStatus || []);
      setAcquisitionTimeData(data.acquisitionTime || []);
      setLifecycleData(data.lifecycle || []);
      setResourceUsageData(data.resourceUsage || []);
      setContainerDetails(data.containerDetails || []);
      setStats(data.stats || stats);
    } catch (err: any) {
      console.error('Failed to fetch Docker metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const healthStatusConfig = {
    healthy: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    warning: { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
    critical: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  };

  const StatusIcon = healthStatusConfig[stats.healthStatus].icon;

  const getContainerStatusColor = (status: string) => {
    if (status === 'ready') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status === 'busy') return 'text-amber-600 bg-amber-50 border-amber-200';
    if (status === 'warming') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider">DOCKER POOL METRICS</h1>
          <p className="text-sm text-gray-600 mt-2 font-fira">
            Container Pool Management · python-code-runner
            {loading && <span className="ml-2 text-[#76B900]">· Loading...</span>}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron text-sm font-bold text-gray-900 tracking-wider">TIME RANGE</h3>
          <div className="flex gap-2">
            {timeRanges.map((tr) => (
              <button
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-colors ${
                  timeRange === tr.value
                    ? 'bg-[#76B900] text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-500 hover:border-[#76B900]/40'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Health Status */}
            <div className={`${healthStatusConfig[stats.healthStatus].bg} border border-gray-200 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`w-4 h-4 ${healthStatusConfig[stats.healthStatus].color}`} />
                <p className="text-xs text-gray-500 font-rajdhani">Status</p>
              </div>
              <p className={`text-lg font-orbitron font-bold ${healthStatusConfig[stats.healthStatus].color} uppercase`}>
                {stats.healthStatus}
              </p>
            </div>

            {/* Total Containers */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Box className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Total</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-gray-900">{stats.totalContainers}</p>
            </div>

            {/* Ready Containers */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Ready</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-emerald-600">{stats.readyContainers}</p>
            </div>

            {/* Busy Containers */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Busy</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-amber-600">{stats.busyContainers}</p>
            </div>

            {/* Saturation */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Saturation</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-red-600">{stats.saturation}%</p>
            </div>

            {/* Acquisition Time */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Acq. Time</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-purple-600">{stats.avgAcquisitionTime}ms</p>
            </div>
          </div>

          {/* Pool Status Over Time */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Pool Status</h3>
                <p className="text-xs text-gray-500 font-rajdhani">Ready vs Busy containers over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={poolStatusData}>
                <defs>
                  <linearGradient id="readyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="busyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Containers', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="ready" stackId="1" stroke="#10b981" fill="url(#readyGradient)" name="Ready" />
                <Area type="monotone" dataKey="busy" stackId="1" stroke="#f59e0b" fill="url(#busyGradient)" name="Busy" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Acquisition Time & Lifecycle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Container Acquisition Time */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Acquisition Time</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Time to get a container from pool</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={acquisitionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Container Lifecycle */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Container Lifecycle</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Created, Destroyed, Reused</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={lifecycleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="created" fill="#10b981" name="Created" />
                  <Bar dataKey="destroyed" fill="#ef4444" name="Destroyed" />
                  <Bar dataKey="reused" fill="#3b82f6" name="Reused" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Resource Usage */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Resource Usage (All Containers)</h3>
                <p className="text-xs text-gray-500 font-rajdhani">Total CPU and Memory used by container pool</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={resourceUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} name="CPU Usage" />
                <Line type="monotone" dataKey="memory" stroke="#f59e0b" strokeWidth={2} name="Memory Usage" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Container Details Table */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Box className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Container Details</h3>
                <p className="text-xs text-gray-500 font-rajdhani">Individual container status and metrics</p>
              </div>
            </div>
            {containerDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-orbitron text-gray-400 tracking-wider">CONTAINER ID</th>
                      <th className="px-4 py-3 text-xs font-orbitron text-gray-400 tracking-wider">STATUS</th>
                      <th className="px-4 py-3 text-xs font-orbitron text-gray-400 tracking-wider">AGE</th>
                      <th className="px-4 py-3 text-xs font-orbitron text-gray-400 tracking-wider">JOBS</th>
                      <th className="px-4 py-3 text-xs font-orbitron text-gray-400 tracking-wider">MEMORY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {containerDetails.map((container, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-fira text-gray-600">{container.id}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-orbitron font-bold uppercase border ${getContainerStatusColor(container.status)}`}>
                            {container.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-rajdhani text-gray-600">{container.age}</td>
                        <td className="px-4 py-3 text-sm font-orbitron font-bold text-gray-900">{container.jobs}</td>
                        <td className="px-4 py-3 text-sm font-rajdhani text-gray-600">{container.memory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-rajdhani text-center py-8">No containers active</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
