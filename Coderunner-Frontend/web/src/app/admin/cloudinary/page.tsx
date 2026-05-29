'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import {
  Cloud, Image, Video, HardDrive, TrendingUp, Activity,
  RefreshCw, AlertCircle, CheckCircle, Zap
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface CloudinaryStats {
  cloudName: string;
  usage: {
    plan: string;
    credits: {
      used: number;
      limit: number;
      usage_pct: number;
    };
    bandwidth: {
      used: number;
      limit: number;
      usage_pct: number;
    };
    storage: {
      used: number;
      limit: number;
      usage_pct: number;
    };
    transformations: {
      used: number;
      limit: number;
      usage_pct: number;
    };
  };
  assets: {
    totalImages: number;
    totalVideos: number;
    totalStorage: number;
  };
  recentUploads: Array<{
    public_id: string;
    format: string;
    bytes: number;
    width: number;
    height: number;
    created_at: string;
    url: string;
    type: string;
  }>;
  timestamp: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatValue(value: number, unit: 'bytes' | 'count' | 'credits'): string {
  if (unit === 'bytes') return formatBytes(value);
  if (unit === 'credits') return value.toFixed(2);
  return value.toLocaleString(); // For counts like transformations
}

function ProgressBar({ label, value, limit, color = 'blue', unit = 'bytes' }: {
  label: string;
  value: number;
  limit: number;
  color?: string;
  unit?: 'bytes' | 'count' | 'credits';
}) {
  const percentage = limit > 0 ? Math.min((value / limit) * 100, 100) : 0;

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600' },
    green: { bg: 'bg-green-500', text: 'text-green-600' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600' },
  };

  const colors = colorMap[color] || colorMap.blue;
  const isHigh = percentage > 80;

  const unitLabel = unit === 'credits' ? ' credits' : unit === 'count' ? '' : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-rajdhani text-gray-700">{label}</span>
        <span className={`text-sm font-orbitron font-bold ${isHigh ? 'text-red-600' : colors.text}`}>
          {formatValue(value, unit)}{unitLabel} / {formatValue(limit, unit)}{unitLabel}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${isHigh ? 'bg-red-500' : colors.bg}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{percentage.toFixed(1)}% used</span>
        <span className="text-gray-500">{formatValue(Math.max(0, limit - value), unit)} {unit === 'credits' ? 'credits' : unit === 'count' ? '' : ''} remaining</span>
      </div>
    </div>
  );
}

export default function CloudinaryPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CloudinaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.admin.cloudinaryStats();
      setStats(data as CloudinaryStats);
    } catch (err: any) {
      console.error('Error fetching Cloudinary data:', err);
      setError(err.message || 'Failed to fetch Cloudinary data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-rajdhani">Loading Cloudinary stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 font-rajdhani mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-rajdhani"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider">
              CLOUDINARY CDN
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-fira">
              {stats ? `Cloud: ${stats.cloudName} · Plan: ${stats.usage.plan}` : 'Asset delivery & storage monitoring'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 font-orbitron font-bold text-xs ${
                autoRefresh
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              AUTO REFRESH {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-orbitron font-bold text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              REFRESH
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {stats && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <h3 className="font-orbitron font-bold text-gray-900">ACTIVE</h3>
                  <p className="text-sm text-gray-600 font-fira">
                    CDN operational · All services online
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-fira">
                  Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                STORAGE
              </h3>
              <ProgressBar
                label="Cloud Storage"
                value={stats.usage.storage.used}
                limit={stats.usage.storage.limit}
                color="blue"
                unit="bytes"
              />
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                BANDWIDTH
              </h3>
              <ProgressBar
                label="Monthly Bandwidth"
                value={stats.usage.bandwidth.used}
                limit={stats.usage.bandwidth.limit}
                color="green"
                unit="bytes"
              />
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                TRANSFORMATIONS
              </h3>
              <ProgressBar
                label="Monthly Transformations"
                value={stats.usage.transformations.used}
                limit={stats.usage.transformations.limit}
                color="orange"
                unit="count"
              />
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                CREDITS
              </h3>
              <ProgressBar
                label="Monthly Credits"
                value={stats.usage.credits.used}
                limit={stats.usage.credits.limit}
                color="purple"
                unit="credits"
              />
            </div>
          </div>
        )}

        {/* Asset Statistics */}
        {stats && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              ASSET OVERVIEW
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <Image className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-gray-600 font-rajdhani">Total Images</p>
                </div>
                <p className="text-2xl font-orbitron font-bold text-gray-900">{stats.assets.totalImages.toLocaleString()}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-600 font-rajdhani">Total Videos</p>
                </div>
                <p className="text-2xl font-orbitron font-bold text-gray-900">{stats.assets.totalVideos.toLocaleString()}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="w-4 h-4 text-purple-600" />
                  <p className="text-sm text-gray-600 font-rajdhani">Total Storage</p>
                </div>
                <p className="text-2xl font-orbitron font-bold text-gray-900">{formatBytes(stats.assets.totalStorage)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Percentage Bar Chart */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                USAGE METRICS
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Storage',
                      percentage: stats.usage.storage.limit > 0
                        ? Math.min((stats.usage.storage.used / stats.usage.storage.limit) * 100, 100)
                        : 0,
                      fill: '#3b82f6'
                    },
                    {
                      name: 'Bandwidth',
                      percentage: stats.usage.bandwidth.limit > 0
                        ? Math.min((stats.usage.bandwidth.used / stats.usage.bandwidth.limit) * 100, 100)
                        : 0,
                      fill: '#10b981'
                    },
                    {
                      name: 'Transformations',
                      percentage: stats.usage.transformations.limit > 0
                        ? Math.min((stats.usage.transformations.used / stats.usage.transformations.limit) * 100, 100)
                        : 0,
                      fill: '#f97316'
                    },
                    {
                      name: 'Credits',
                      percentage: stats.usage.credits.limit > 0
                        ? Math.min((stats.usage.credits.used / stats.usage.credits.limit) * 100, 100)
                        : 0,
                      fill: '#a855f7'
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Rajdhani' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Rajdhani' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontFamily: 'Rajdhani'
                    }}
                    formatter={(value: any) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                    {[
                      { fill: '#3b82f6' },
                      { fill: '#10b981' },
                      { fill: '#f97316' },
                      { fill: '#a855f7' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Resource Distribution Pie Chart */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                RESOURCE DISTRIBUTION
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Storage Used', value: stats.usage.storage.used, color: '#3b82f6' },
                      { name: 'Storage Free', value: Math.max(0, stats.usage.storage.limit - stats.usage.storage.used), color: '#e5e7eb' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {[{ color: '#3b82f6' }, { color: '#e5e7eb' }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontFamily: 'Rajdhani'
                    }}
                    formatter={(value: any) => formatBytes(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
