import { useState, useEffect } from 'react';
import { X, Zap, Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Layers, Target } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/lib/api-client';

interface RunnerMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  runnerName: 'Runner-1' | 'Runner-2';
}

type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

export default function RunnerMetricsModal({ isOpen, onClose, runnerName }: RunnerMetricsModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobsProcessedData, setJobsProcessedData] = useState<Array<{ time: string; jobs: number }>>([]);
  const [jobDurationData, setJobDurationData] = useState<Array<{ time: string; avg: number; p95: number }>>([]);
  const [concurrencyData, setConcurrencyData] = useState<Array<{ time: string; execution: number; submission: number }>>([]);
  const [resourceUsageData, setResourceUsageData] = useState<Array<{ time: string; cpu: number; memory: number }>>([]);
  const [jobTypeDistribution, setJobTypeDistribution] = useState<Array<{ name: string; value: number }>>([]);
  const [failureReasons, setFailureReasons] = useState<Array<{ reason: string; count: number }>>([]);
  const [stats, setStats] = useState({
    uptime: '0h 0m',
    totalJobsProcessed: 0,
    jobsPerHour: 0,
    successRate: 0,
    avgJobDuration: 0,
    concurrencyUsage: 0,
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
  }, [timeRange, isOpen, runnerName]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.admin.runnerMetrics(timeRange, runnerName);
      setJobsProcessedData(data.jobsProcessed || []);
      setJobDurationData(data.jobDuration || []);
      setConcurrencyData(data.concurrency || []);
      setResourceUsageData(data.resourceUsage || []);
      setJobTypeDistribution(data.jobTypeDistribution || []);
      setFailureReasons(data.failureReasons || []);
      setStats(data.stats || stats);
    } catch (err: any) {
      console.error('Failed to fetch runner metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const runnerColor = runnerName === 'Runner-1' ? '#8b5cf6' : '#ec4899';
  const runnerColorLight = runnerName === 'Runner-1' ? '#ede9fe' : '#fce7f3';
  const runnerColorBorder = runnerName === 'Runner-1' ? '#c4b5fd' : '#fbcfe8';

  const healthStatusConfig = {
    healthy: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    warning: { color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
    critical: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
  };

  const StatusIcon = healthStatusConfig[stats.healthStatus].icon;

  const JOB_TYPE_COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[95vw] max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-orbitron text-xl font-bold text-gray-900 tracking-wider">{runnerName.toUpperCase()} WORKER</h2>
            <p className="text-sm text-gray-500 font-rajdhani mt-0.5">
              BullMQ Worker Process · Job Processing Engine
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
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
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

              {/* Total Jobs Processed */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Total Jobs</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-gray-900">{stats.totalJobsProcessed.toLocaleString()}</p>
              </div>

              {/* Jobs Per Hour */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Jobs/Hour</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-emerald-600">{stats.jobsPerHour}</p>
              </div>

              {/* Success Rate */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-cyan-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Success Rate</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-cyan-600">{stats.successRate.toFixed(1)}%</p>
              </div>

              {/* Avg Job Duration */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Avg Duration</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-amber-600">{stats.avgJobDuration}s</p>
              </div>

              {/* Concurrency Usage */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-gray-500 font-rajdhani">Concurrency</p>
                </div>
                <p className="text-lg font-orbitron font-bold text-red-600">{stats.concurrencyUsage}%</p>
              </div>
            </div>

            {/* Jobs Processed Over Time */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center`} style={{ backgroundColor: runnerColorLight, borderColor: runnerColorBorder }}>
                  <TrendingUp className="w-5 h-5" style={{ color: runnerColor }} />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Jobs Processed</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Job throughput over time</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={jobsProcessedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Jobs', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Bar dataKey="jobs" fill={runnerColor} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Job Duration & Resource Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Job Duration */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Job Duration</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Average and P95 execution time</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={jobDurationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'seconds', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
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

              {/* Resource Usage */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Resource Usage</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">CPU and Memory consumption</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={resourceUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU" />
                    <Line type="monotone" dataKey="memory" stroke="#ef4444" strokeWidth={2} name="Memory" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* Concurrency Usage */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Concurrency Usage</h3>
                  <p className="text-xs text-gray-500 font-rajdhani">Active slots: Execution (5 max) & Submission (3 max)</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={concurrencyData}>
                  <defs>
                    <linearGradient id="execGradientRunner" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="subGradientRunner" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Active Jobs', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="execution" stroke="#8b5cf6" fill="url(#execGradientRunner)" name="Execution (max 5)" />
                  <Area type="monotone" dataKey="submission" stroke="#ec4899" fill="url(#subGradientRunner)" name="Submission (max 3)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Job Type Distribution & Failure Reasons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Job Type Distribution */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Job Type Distribution</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Execution vs Submission jobs</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={jobTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jobTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={JOB_TYPE_COLORS[index % JOB_TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Failure Reasons */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wide">Failure Reasons</h3>
                    <p className="text-xs text-gray-500 font-rajdhani">Top causes of job failures</p>
                  </div>
                </div>
                {failureReasons.length > 0 ? (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto">
                    {failureReasons.map((failure, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                        <span className="text-sm font-rajdhani font-medium text-gray-900">{failure.reason}</span>
                        <span className="text-sm font-orbitron font-bold text-red-600">{failure.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 font-rajdhani text-center py-8">No failures in this period ✓</p>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
