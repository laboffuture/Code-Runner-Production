import { useState, useEffect } from 'react';
import { X, Server, Activity, Zap, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/lib/api-client';

interface ApiMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiName: 'API-1' | 'API-2';
}

type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

export default function ApiMetricsModal({ isOpen, onClose, apiName }: ApiMetricsModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cpuData, setCpuData] = useState<Array<{ time: string; value: number }>>([]);
  const [memoryData, setMemoryData] = useState<Array<{ time: string; value: number }>>([]);
  const [requestData, setRequestData] = useState<Array<{ time: string; requests: number }>>([]);
  const [responseTimeData, setResponseTimeData] = useState<Array<{ time: string; avg: number; p95: number }>>([]);
  const [errorRateData, setErrorRateData] = useState<Array<{ time: string; rate: number }>>([]);
  const [stats, setStats] = useState({
    uptime: '0h 0m',
    activeConnections: 0,
    totalRequests: 0,
    errorRate: 0,
    avgResponseTime: 0,
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
    if (isOpen) {
      fetchMetrics();
    }
  }, [timeRange, isOpen, apiName]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.admin.apiMetrics(timeRange, apiName);
      setCpuData(data.cpu || []);
      setMemoryData(data.memory || []);
      setRequestData(data.requests || []);
      setResponseTimeData(data.responseTimes || []);
      setErrorRateData(data.errorRate || []);
      setStats(data.stats || stats);
    } catch (err: any) {
      console.error('Failed to fetch API metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const apiColor = apiName === 'API-1' ? '#3b82f6' : '#10b981';
  const apiColorLight = apiName === 'API-1' ? '#dbeafe' : '#d1fae5';
  const apiColorBorder = apiName === 'API-1' ? '#93c5fd' : '#6ee7b7';

  const healthStatusConfig = {
    healthy: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    warning: { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
    critical: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  };

  const StatusIcon = healthStatusConfig[stats.healthStatus].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[95vw] max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-orbitron text-xl font-bold text-gray-900 tracking-wider">{apiName} BACKEND SERVER</h2>
            <p className="text-sm text-gray-500 font-rajdhani mt-0.5">
              Backend Instance Metrics · Express.js API
              {loading && <span className="ml-2 text-[#76B900]">· Loading...</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

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

              {/* Uptime */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Uptime</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-gray-900">{stats.uptime}</p>
              </div>

              {/* Active Connections */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Connections</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-gray-900">{stats.activeConnections}</p>
              </div>

              {/* Total Requests */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Requests</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
              </div>

              {/* Error Rate */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Error Rate</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-red-600">{stats.errorRate.toFixed(2)}%</p>
              </div>

              {/* Avg Response Time */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Avg Response</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-amber-600">{stats.avgResponseTime}ms</p>
              </div>
            </div>

            {/* Resource Usage Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* CPU Usage */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center`} style={{ backgroundColor: apiColorLight, borderColor: apiColorBorder }}>
                    <Server className="w-5 h-5" style={{ color: apiColor }} />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">CPU Usage</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Process CPU utilization</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id={`cpuGradient${apiName}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={apiColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={apiColor} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                    />
                    <Area type="monotone" dataKey="value" stroke={apiColor} fill={`url(#cpuGradient${apiName})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Memory Usage */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center`} style={{ backgroundColor: apiColorLight, borderColor: apiColorBorder }}>
                    <Activity className="w-5 h-5" style={{ color: apiColor }} />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Memory Usage</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Heap memory consumption</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={memoryData}>
                    <defs>
                      <linearGradient id={`memGradient${apiName}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={apiColor} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={apiColor} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'MB', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                    />
                    <Area type="monotone" dataKey="value" stroke={apiColor} fill={`url(#memGradient${apiName})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* Request Throughput */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Request Throughput</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Requests per interval</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Requests', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Bar dataKey="requests" fill={apiColor} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Response Times */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Response Times</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Average and P95 latency</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2} name="Average" />
                  <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} name="P95" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Error Rate */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Error Rate</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Failed requests percentage</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={errorRateData}>
                  <defs>
                    <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#ef4444" fill="url(#errorGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
