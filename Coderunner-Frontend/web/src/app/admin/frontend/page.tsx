'use client';

import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Network, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api-client';

type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

export default function FrontendMetricsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cpuData, setCpuData] = useState<Array<{ time: string; value: number }>>([]);
  const [memoryData, setMemoryData] = useState<Array<{ time: string; value: number }>>([]);
  const [networkData, setNetworkData] = useState<Array<{ time: string; value: number }>>([]);
  const [httpLogs, setHttpLogs] = useState<Array<{ method: string; path: string; status: number; time: string }>>([]);

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.admin.railwayMetrics(timeRange, 'frontend');
      setCpuData(data.cpu || []);
      setMemoryData(data.memory || []);
      setNetworkData(data.network || []);
      setHttpLogs(data.httpLogs || []);
    } catch (err: any) {
      console.error('Failed to fetch Railway metrics:', err);
      setError(err.message || 'Failed to fetch metrics');

      // Fallback to mock data on error
      const points = timeRange === '1h' ? 12 : timeRange === '6h' ? 24 : timeRange === '1d' ? 48 : 72;
      const interval = timeRange === '1h' ? 5 : timeRange === '6h' ? 15 : 30;

      setCpuData(Array.from({ length: points }, (_, i) => ({
        time: `${i * interval}m`,
        value: Math.random() * 20 + 5,
      })));
      setMemoryData(Array.from({ length: points }, (_, i) => ({
        time: `${i * interval}m`,
        value: Math.random() * 50 + 100,
      })));
      setNetworkData(Array.from({ length: points }, (_, i) => ({
        time: `${i * interval}m`,
        value: Math.random() * 1000 + 500,
      })));
      setHttpLogs([
        { method: 'GET', path: '/', status: 200, time: '45ms' },
        { method: 'GET', path: '/api/health', status: 200, time: '12ms' },
        { method: 'POST', path: '/api/auth/login', status: 200, time: '234ms' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1h' },
    { value: '6h', label: '6h' },
    { value: '1d', label: '1d' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider">FRONTEND METRICS</h1>
          <p className="text-sm text-gray-600 mt-2 font-fira">
            Railway · Production Environment
            {loading && <span className="ml-2 text-[#76B900]">· Loading...</span>}
            {error && <span className="ml-2 text-amber-600">· Using mock data</span>}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-4 mb-6 flex items-center justify-between">
          <span className="text-xs font-orbitron text-gray-500 tracking-wider font-bold">TIME RANGE</span>
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

        {/* Metrics Content */}
        <div className="space-y-6">
          {/* CPU Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#76B900]/10 border border-[#76B900]/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#76B900]" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">CPU Usage</h3>
                <p className="text-xs text-gray-500 font-rajdhani">vCPU utilization over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#76B900" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#76B900" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'vCPU %', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Area type="monotone" dataKey="value" stroke="#76B900" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Current</p>
                <p className="text-lg font-orbitron font-black text-[#76B900] mt-1">{cpuData[cpuData.length - 1]?.value.toFixed(2)}%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Average</p>
                <p className="text-lg font-orbitron font-black text-gray-900 mt-1">
                  {(cpuData.reduce((sum, d) => sum + d.value, 0) / cpuData.length).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Peak</p>
                <p className="text-lg font-orbitron font-black text-red-600 mt-1">
                  {Math.max(...cpuData.map(d => d.value)).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Memory Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Memory Usage</h3>
                <p className="text-xs text-gray-500 font-rajdhani">RAM consumption over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memoryData}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'MB', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMemory)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Current</p>
                <p className="text-lg font-orbitron font-black text-blue-600 mt-1">{memoryData[memoryData.length - 1]?.value.toFixed(0)} MB</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Average</p>
                <p className="text-lg font-orbitron font-black text-gray-900 mt-1">
                  {(memoryData.reduce((sum, d) => sum + d.value, 0) / memoryData.length).toFixed(0)} MB
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Peak</p>
                <p className="text-lg font-orbitron font-black text-red-600 mt-1">
                  {Math.max(...memoryData.map(d => d.value)).toFixed(0)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Network Chart */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                <Network className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Network Traffic</h3>
                <p className="text-xs text-gray-500 font-rajdhani">Public network egress</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'KB/s', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Current</p>
                <p className="text-lg font-orbitron font-black text-purple-600 mt-1">{networkData[networkData.length - 1]?.value.toFixed(0)} KB/s</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Average</p>
                <p className="text-lg font-orbitron font-black text-gray-900 mt-1">
                  {(networkData.reduce((sum, d) => sum + d.value, 0) / networkData.length).toFixed(0)} KB/s
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-rajdhani">Peak</p>
                <p className="text-lg font-orbitron font-black text-red-600 mt-1">
                  {Math.max(...networkData.map(d => d.value)).toFixed(0)} KB/s
                </p>
              </div>
            </div>
          </div>

          {/* HTTP Logs */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Recent HTTP Logs</h3>
                <p className="text-xs text-gray-500 font-rajdhani">Latest requests from Railway</p>
              </div>
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto font-fira text-xs">
              {httpLogs.length > 0 ? (
                httpLogs.map((log, i) => {
                  const isError = log.status >= 400;
                  const methodColor = log.method === 'GET' ? 'text-blue-600' :
                                    log.method === 'POST' ? 'text-green-600' :
                                    log.method === 'PUT' ? 'text-amber-600' :
                                    log.method === 'DELETE' ? 'text-red-600' :
                                    'text-purple-600';

                  const statusColor = log.status >= 500 ? 'text-red-700' :
                                     log.status >= 400 ? 'text-orange-600' :
                                     log.status >= 300 ? 'text-blue-500' :
                                     log.status >= 200 ? 'text-emerald-600' :
                                     'text-gray-600';

                  const bgColor = log.status >= 500 ? 'bg-red-50 border-l-4 border-red-500' :
                                 log.status >= 400 ? 'bg-orange-50 border-l-4 border-orange-500' :
                                 log.status === 304 ? 'bg-blue-50' :
                                 'bg-gray-50';

                  return (
                    <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${bgColor}`}>
                      <span className={`font-bold ${methodColor} w-14`}>{log.method}</span>
                      <span className={`flex-1 truncate ${isError ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{log.path}</span>
                      <span className={`font-bold w-12 text-right ${statusColor}`}>{log.status}</span>
                      <span className={`w-16 text-right ${isError ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{log.time}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-400 font-rajdhani">
                  {loading ? 'Loading logs...' : 'No logs available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
