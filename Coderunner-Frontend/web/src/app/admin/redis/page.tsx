'use client';

import { useState, useEffect } from 'react';
import { Database, Activity, Zap, HardDrive, TrendingUp, Clock, Layers, BarChart3 } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/lib/api-client';
import AdminHeader from '../components/AdminHeader';

type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

export default function RedisMetricsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [memoryData, setMemoryData] = useState<Array<{ time: string; used: number; peak: number }>>([]);
  const [opsData, setOpsData] = useState<Array<{ time: string; ops: number }>>([]);
  const [hitRateData, setHitRateData] = useState<Array<{ time: string; rate: number }>>([]);
  const [queueDepthData, setQueueDepthData] = useState<Array<{ time: string; execution: number; submission: number }>>([]);
  const [clientsData, setClientsData] = useState<Array<{ time: string; connected: number; blocked: number }>>([]);
  const [commandDistribution, setCommandDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [stats, setStats] = useState({
    uptime: '0h 0m',
    connectedClients: 0,
    totalKeys: 0,
    memoryUsed: '0 MB',
    hitRate: 0,
    opsPerSec: 0,
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
      const data: any = await api.admin.redisMetrics(timeRange);
      setMemoryData(data.memory || []);
      setOpsData(data.ops || []);
      setHitRateData(data.hitRate || []);
      setQueueDepthData(data.queueDepth || []);
      setClientsData(data.clients || []);
      setCommandDistribution(data.commandDistribution || []);
      setStats(data.stats || stats);
    } catch (err: any) {
      console.error('Failed to fetch Redis metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const COMMAND_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider">REDIS METRICS</h1>
          <p className="text-sm text-gray-600 mt-2 font-fira">
            Queue System · BullMQ · In-Memory Data Store
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
            <div className={`${
              stats.healthStatus === 'healthy' ? 'bg-emerald-50' :
              stats.healthStatus === 'warning' ? 'bg-amber-50' : 'bg-red-50'
            } border border-gray-200 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1">
                <Database className={`w-4 h-4 ${
                  stats.healthStatus === 'healthy' ? 'text-emerald-600' :
                  stats.healthStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
                }`} />
                <p className="text-xs text-gray-500 font-rajdhani">Status</p>
              </div>
              <p className={`text-lg font-orbitron font-bold uppercase ${
                stats.healthStatus === 'healthy' ? 'text-emerald-600' :
                stats.healthStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
              }`}>
                {stats.healthStatus}
              </p>
            </div>

            {/* Uptime */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Uptime</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-gray-900">{stats.uptime}</p>
            </div>

            {/* Connected Clients */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Clients</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-gray-900">{stats.connectedClients}</p>
            </div>

            {/* Total Keys */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-cyan-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Total Keys</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-gray-900">{stats.totalKeys.toLocaleString()}</p>
            </div>

            {/* Memory Used */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <HardDrive className="w-4 h-4 text-red-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Memory</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-red-600">{stats.memoryUsed}</p>
            </div>

            {/* Hit Rate */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="text-xs text-gray-500 font-rajdhani">Hit Rate</p>
              </div>
              <p className="text-lg font-orbitron font-bold text-emerald-600">{stats.hitRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Memory Usage</h3>
                <p className="text-xs text-gray-500 font-rajdhani">Used vs Peak memory consumption</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={memoryData}>
                <defs>
                  <linearGradient id="memUsedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="memPeakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'MB', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="used" stroke="#ef4444" fill="url(#memUsedGradient)" name="Used Memory" />
                <Area type="monotone" dataKey="peak" stroke="#f97316" fill="url(#memPeakGradient)" name="Peak Memory" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Operations & Hit Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Operations Per Second */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Operations/Sec</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Commands executed per second</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={opsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'OPS', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Line type="monotone" dataKey="ops" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Hit Rate */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Cache Hit Rate</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Successful cache lookups</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={hitRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Queue Depth (BullMQ) */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Queue Depth (BullMQ)</h3>
                <p className="text-xs text-gray-500 font-rajdhani">Execution & Submission queue backlogs</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={queueDepthData}>
                <defs>
                  <linearGradient id="execGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Jobs', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="execution" stackId="1" stroke="#8b5cf6" fill="url(#execGradient)" name="Execution Queue" />
                <Area type="monotone" dataKey="submission" stackId="1" stroke="#ec4899" fill="url(#subGradient)" name="Submission Queue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Connected Clients & Command Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Connected Clients */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Connected Clients</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Active Redis connections</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={clientsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="connected" stroke="#06b6d4" strokeWidth={2} name="Connected" />
                  <Line type="monotone" dataKey="blocked" stroke="#f59e0b" strokeWidth={2} name="Blocked" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Command Distribution */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Command Distribution</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Most frequent Redis commands</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={commandDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {commandDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COMMAND_COLORS[index % COMMAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
