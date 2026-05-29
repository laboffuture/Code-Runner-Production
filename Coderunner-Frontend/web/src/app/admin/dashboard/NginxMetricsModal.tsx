import { useState, useEffect } from 'react';
import { X, Server, TrendingUp, Activity, Zap, AlertCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/lib/api-client';

interface NginxMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

export default function NginxMetricsModal({ isOpen, onClose }: NginxMetricsModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [requestData, setRequestData] = useState<Array<{ time: string; api1: number; api2: number }>>([]);
  const [upstreamData, setUpstreamData] = useState<Array<{ name: string; value: number }>>([]);
  const [responseTimeData, setResponseTimeData] = useState<Array<{ time: string; api1: number; api2: number }>>([]);
  const [routingLogs, setRoutingLogs] = useState<Array<{ timestamp: string; upstream: string; method: string; path: string; status: number; time: string }>>([]);

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
  }, [timeRange, isOpen]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.admin.nginxMetrics(timeRange);
      setRequestData(data.requestDistribution || []);
      setUpstreamData(data.upstreamStats || []);
      setResponseTimeData(data.responseTimes || []);
      setRoutingLogs(data.routingLogs || []);
    } catch (err: any) {
      console.error('Failed to fetch NGINX metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const totalRequests = upstreamData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[95vw] max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-orbitron text-xl font-bold text-gray-900 tracking-wider">NGINX LOAD BALANCER</h2>
            <p className="text-sm text-gray-500 font-rajdhani mt-0.5">
              Load Balancing · least_conn Algorithm
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

            {/* Upstream Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Pie Chart - Request Distribution */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Request Distribution</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Traffic split between upstreams</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={upstreamData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {upstreamData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-2xl font-orbitron font-black text-[#76B900]">{totalRequests.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 font-rajdhani mt-1">Total Requests</p>
                </div>
              </div>

              {/* Upstream Stats */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <Server className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Upstream Health</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Backend server status</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {upstreamData.map((upstream, i) => (
                    <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-orbitron font-bold text-gray-900">{upstream.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-orbitron font-bold text-emerald-600 tracking-wider">ONLINE</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-rajdhani">Requests</span>
                        <span className="font-fira font-bold text-gray-900">{upstream.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-500 font-rajdhani">Load</span>
                        <span className="font-fira font-bold text-blue-600">{((upstream.value / totalRequests) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Request Distribution Over Time */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Request Rate Over Time</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Requests per interval by upstream</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Requests', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="api1" fill="#3b82f6" name="API-1" />
                  <Bar dataKey="api2" fill="#10b981" name="API-2" />
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
                  <p className="text-xs text-gray-500 font-rajdhani">Average response time by upstream</p>
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
                  <Line type="monotone" dataKey="api1" stroke="#3b82f6" strokeWidth={2} name="API-1" />
                  <Line type="monotone" dataKey="api2" stroke="#10b981" strokeWidth={2} name="API-2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Routing Logs */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Request Routing Logs</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Recent proxied requests</p>
                </div>
              </div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto font-fira text-xs">
                {routingLogs.length > 0 ? (
                  routingLogs.map((log, i) => {
                    const isError = log.status >= 400;
                    const upstreamColor = log.upstream === 'API-1' ? 'text-blue-600' : 'text-emerald-600';
                    const methodColor = log.method === 'GET' ? 'text-blue-600' :
                                      log.method === 'POST' ? 'text-green-600' :
                                      log.method === 'PUT' ? 'text-amber-600' :
                                      'text-red-600';

                    const statusColor = log.status >= 500 ? 'text-red-700' :
                                       log.status >= 400 ? 'text-orange-600' :
                                       log.status >= 300 ? 'text-blue-500' :
                                       'text-emerald-600';

                    const bgColor = log.status >= 500 ? 'bg-red-50 border-l-4 border-red-500' :
                                   log.status >= 400 ? 'bg-orange-50 border-l-4 border-orange-500' :
                                   'bg-gray-50';

                    return (
                      <div key={i} className={`flex items-center gap-2 py-2 px-3 rounded-lg ${bgColor}`}>
                        <span className={`font-bold ${upstreamColor} w-12 text-xs`}>{log.upstream}</span>
                        <span className={`font-bold ${methodColor} w-14`}>{log.method}</span>
                        <span className={`flex-1 truncate ${isError ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{log.path}</span>
                        <span className={`font-bold w-12 text-right ${statusColor}`}>{log.status}</span>
                        <span className={`w-16 text-right ${isError ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{log.time}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-400 font-rajdhani">
                    {loading ? 'Loading routing logs...' : 'No routing logs available'}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
