'use client';

import { useState, useEffect } from 'react';
import { Server, TrendingUp, Activity, Info } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api-client';

type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

// Status-class colors (2xx good → 5xx bad). Static hex for recharts fills.
const STATUS_COLORS: Record<string, string> = {
  '2xx': '#10b981',
  '3xx': '#3b82f6',
  '4xx': '#f59e0b',
  '5xx': '#ef4444',
};
const statusColor = (name: string) => STATUS_COLORS[name] ?? '#9ca3af';

export default function NginxMetricsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);

  const [totalRequests, setTotalRequests] = useState(0);
  const [requestData, setRequestData] = useState<Array<{ time: string; requests: number }>>([]);
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number }>>([]);
  const [recentRequests, setRecentRequests] = useState<Array<{ timestamp: string; method: string; path: string; status: number }>>([]);
  const [note, setNote] = useState<string | null>(null);

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
      const data: any = await api.admin.nginxMetrics(timeRange);
      if (data?._unavailable) {
        setUnavailable(data.message || 'Nginx metrics are not available.');
        setTotalRequests(0); setRequestData([]); setStatusData([]); setRecentRequests([]); setNote(null);
      } else {
        setUnavailable(null);
        setTotalRequests(data.totalRequests || 0);
        setRequestData(data.requestDistribution || []);
        setStatusData(data.statusDistribution || []);
        setRecentRequests(data.recentRequests || []);
        setNote(data.upstreamNote || null);
      }
    } catch (err: any) {
      // Never fabricate — surface the failure and show no data.
      console.error('Failed to fetch NGINX metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
      setTotalRequests(0); setRequestData([]); setStatusData([]); setRecentRequests([]); setNote(null);
    } finally {
      setLoading(false);
    }
  };

  const showEmpty = !loading && !error && totalRequests === 0 && requestData.length === 0 && recentRequests.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider">NGINX LOAD BALANCER</h1>
          <p className="text-sm text-gray-600 mt-2 font-fira">
            Load Balancing · least_conn Algorithm
            {loading && <span className="ml-2 text-[#76B900]">· Loading...</span>}
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

        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-4 font-rajdhani text-sm text-red-700">
            Couldn’t reach the metrics endpoint: {error}
          </div>
        )}

        {showEmpty ? (
          <div className="rounded-xl border-2 border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#76B900]/10 ring-1 ring-[#76B900]/20">
              <Info className="h-6 w-6 text-[#76B900]" />
            </div>
            <h3 className="font-orbitron text-sm font-bold tracking-wider text-gray-900">NO NGINX DATA</h3>
            <p className="mx-auto mt-2 max-w-xl font-rajdhani text-sm text-gray-500">
              {unavailable ?? 'No requests in this time range, or the access log is empty.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total + load-balancer note */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-3xl font-orbitron font-black text-[#76B900] leading-none">{totalRequests.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-rajdhani mt-1">Total requests in range</p>
              </div>
              {note && (
                <div className="flex items-start gap-2 max-w-xl rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                  <Info className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                  <p className="font-rajdhani text-xs text-gray-500">{note}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status distribution */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Status Codes</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Response status breakdown</p>
                  </div>
                </div>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {statusData.map((entry) => (
                          <Cell key={entry.name} fill={statusColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-400 font-rajdhani text-sm">No status data</div>
                )}
              </div>

              {/* Request rate over time */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Request Rate</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Total requests per hour</p>
                  </div>
                </div>
                {requestData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={requestData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Requests', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ fontWeight: 'bold', color: '#111827' }} />
                      <Bar dataKey="requests" fill="#76B900" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-400 font-rajdhani text-sm">No request data</div>
                )}
              </div>
            </div>

            {/* Recent requests */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <Server className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Recent Requests</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Latest proxied requests</p>
                </div>
              </div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto font-fira text-xs">
                {recentRequests.length > 0 ? (
                  recentRequests.map((log, i) => {
                    const isError = log.status >= 400;
                    const methodColor = log.method === 'GET' ? 'text-blue-600' :
                      log.method === 'POST' ? 'text-green-600' :
                      log.method === 'PUT' ? 'text-amber-600' : 'text-red-600';
                    const sc = log.status >= 500 ? 'text-red-700' :
                      log.status >= 400 ? 'text-orange-600' :
                      log.status >= 300 ? 'text-blue-500' : 'text-emerald-600';
                    const bgColor = log.status >= 500 ? 'bg-red-50 border-l-4 border-red-500' :
                      log.status >= 400 ? 'bg-orange-50 border-l-4 border-orange-500' : 'bg-gray-50';
                    return (
                      <div key={i} className={`flex items-center gap-2 py-2 px-3 rounded-lg ${bgColor}`}>
                        <span className={`font-bold ${methodColor} w-14`}>{log.method}</span>
                        <span className={`flex-1 truncate ${isError ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{log.path}</span>
                        <span className={`font-bold w-12 text-right ${sc}`}>{log.status}</span>
                        <span className="w-16 text-right text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-400 font-rajdhani">No recent requests</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
