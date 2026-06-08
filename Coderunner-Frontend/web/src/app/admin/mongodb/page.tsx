'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import {
  Database, Activity, HardDrive, Users, FileText, TrendingUp,
  RefreshCw, AlertCircle, CheckCircle, Clock, BarChart3, Server
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface MongoDBStats {
  connection: {
    status: string;
    host: string;
    port: number;
    name: string;
  };
  database: {
    name: string;
    collections: number;
    dataSize: number;
    storageSize: number;
    indexSize: number;
    totalSize: number;
    avgObjSize: number;
    objects: number;
  };
  collections: Array<{
    name: string;
    count: number;
    size: number;
    avgObjSize: number;
    storageSize: number;
    indexes: number;
    indexSize: number;
  }>;
  applicationStats: {
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    totalSolved: number;
  };
  recentOperations: any[];
  atlasInfo: {
    hasAtlasAPI: boolean;
    projectId: string | null;
    orgId: string | null;
  };
  timestamp: string;
}

interface AtlasData {
  project: {
    id: string;
    name: string;
    orgId: string;
    created: string;
  };
  clusters: Array<{
    name: string;
    state: string;
    type: string;
    tier: string;
    provider: string;
    region: string;
    diskSizeGB: number;
    mongoDBVersion: string;
    backupEnabled: boolean;
    created: string;
    paused: boolean;
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

function StatCard({ icon: Icon, label, value, color = 'blue' }: {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg ${colorMap[color]} border-2 flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-rajdhani">{label}</p>
          <p className="text-2xl font-orbitron font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function MongoDBPage() {
  const router = useRouter();
  const [stats, setStats] = useState<MongoDBStats | null>(null);
  const [atlasData, setAtlasData] = useState<AtlasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [mongoStats, atlasInfo] = await Promise.allSettled([
        api.admin.mongodbStats(),
        api.admin.mongodbAtlas(),
      ]);

      if (mongoStats.status === 'fulfilled') {
        const statsData = mongoStats.value as MongoDBStats;
        console.log('📊 MongoDB Stats:', {
          collections: statsData.collections,
          collectionsCount: statsData.collections?.length,
          sampleCollection: statsData.collections?.[0]
        });
        setStats(statsData);
      } else {
        throw new Error('Failed to fetch MongoDB stats');
      }

      if (atlasInfo.status === 'fulfilled') {
        setAtlasData(atlasInfo.value as AtlasData);
      }
    } catch (err: any) {
      console.error('Error fetching MongoDB data:', err);
      setError(err.message || 'Failed to fetch MongoDB data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 font-rajdhani">Loading MongoDB stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
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

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-orbitron font-black text-gray-900 tracking-wider">
              MONGODB ATLAS
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-fira">
              Database monitoring & statistics
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

        {/* Connection Status */}
        {stats && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  stats.connection.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <div>
                  <h3 className="font-orbitron font-bold text-gray-900">
                    {stats.connection.status === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
                  </h3>
                  <p className="text-sm text-gray-600 font-fira">
                    {stats.connection.host}:{stats.connection.port} / {stats.connection.name}
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

        {/* Atlas Cluster Info */}
        {atlasData && atlasData.clusters && atlasData.clusters.length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              ATLAS CLUSTER INFO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atlasData.clusters.map((cluster) => (
                <div key={cluster.name} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-orbitron font-bold text-gray-900">{cluster.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      cluster.state === 'IDLE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {cluster.state}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tier:</span>
                      <span className="font-bold text-gray-900">{cluster.tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-bold text-gray-900">{cluster.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-bold text-gray-900">{cluster.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-bold text-gray-900">{cluster.diskSizeGB} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">MongoDB:</span>
                      <span className="font-bold text-gray-900">v{cluster.mongoDBVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Backup:</span>
                      <span className={`font-bold ${cluster.backupEnabled ? 'text-green-600' : 'text-red-600'}`}>
                        {cluster.backupEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={HardDrive}
              label="Total Database Size"
              value={formatBytes(stats.database.totalSize)}
              color="blue"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.applicationStats.totalUsers}
              color="green"
            />
            <StatCard
              icon={FileText}
              label="Problems Solved"
              value={stats.applicationStats.totalSolved}
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Submissions"
              value={stats.applicationStats.totalSubmissions}
              color="orange"
            />
          </div>
        )}

        {/* Database Details */}
        {stats && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              DATABASE STATISTICS
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600 font-rajdhani">Collections</p>
                <p className="text-xl font-orbitron font-bold text-gray-900">{stats.database.collections}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600 font-rajdhani">Data Size</p>
                <p className="text-xl font-orbitron font-bold text-gray-900">{formatBytes(stats.database.dataSize)}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-600 font-rajdhani">Storage Size</p>
                <p className="text-xl font-orbitron font-bold text-gray-900">{formatBytes(stats.database.storageSize)}</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm text-gray-600 font-rajdhani">Index Size</p>
                <p className="text-xl font-orbitron font-bold text-gray-900">{formatBytes(stats.database.indexSize)}</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm text-gray-600 font-rajdhani">Total Objects</p>
                <p className="text-xl font-orbitron font-bold text-gray-900">{stats.database.objects.toLocaleString()}</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm text-gray-600 font-rajdhani">Avg Object Size</p>
                <p className="text-xl font-orbitron font-bold text-gray-900">{formatBytes(stats.database.avgObjSize)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Storage & Collection Charts */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Breakdown Pie Chart */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                STORAGE BREAKDOWN
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Data Size', value: stats.database.dataSize, color: '#10b981' },
                      { name: 'Index Size', value: stats.database.indexSize, color: '#f97316' },
                      { name: 'Free Space', value: Math.max(0, stats.database.storageSize - stats.database.dataSize - stats.database.indexSize), color: '#e5e7eb' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent = 0 }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={true}
                  >
                    {[
                      { color: '#10b981' },
                      { color: '#f97316' },
                      { color: '#e5e7eb' },
                    ].map((entry, index) => (
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
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontFamily: 'Rajdhani', fontSize: '14px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Collections Bar Chart */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                TOP COLLECTIONS BY SIZE
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.collections
                    .sort((a, b) => b.size - a.size)
                    .slice(0, 5)
                    .map(col => ({
                      name: col.name,
                      size: col.size, // Keep in bytes for accuracy
                      fill: '#8b5cf6'
                    }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    stroke="#6b7280"
                    style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontFamily: 'Rajdhani'
                    }}
                    formatter={(value: any) => formatBytes(value)}
                  />
                  <Bar dataKey="size" radius={[0, 8, 8, 0]}>
                    {stats.collections.slice(0, 5).map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#8b5cf6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Collection Document Count Chart */}
        {stats && stats.collections.length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              DOCUMENT COUNT BY COLLECTION
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.collections
                  .sort((a, b) => b.count - a.count)
                  .map(col => ({
                    name: col.name,
                    count: col.count,
                    fill: '#3b82f6'
                  }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Rajdhani' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontFamily: 'Rajdhani'
                  }}
                  formatter={(value: any) => value.toLocaleString()}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stats.collections.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Collections Table */}
        {stats && stats.collections.length > 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-orbitron font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              COLLECTION DETAILS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-orbitron font-bold text-gray-900">COLLECTION</th>
                    <th className="text-right py-3 px-4 font-orbitron font-bold text-gray-900">DOCUMENTS</th>
                    <th className="text-right py-3 px-4 font-orbitron font-bold text-gray-900">SIZE</th>
                    <th className="text-right py-3 px-4 font-orbitron font-bold text-gray-900">STORAGE</th>
                    <th className="text-right py-3 px-4 font-orbitron font-bold text-gray-900">INDEXES</th>
                    <th className="text-right py-3 px-4 font-orbitron font-bold text-gray-900">INDEX SIZE</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.collections.map((collection) => (
                    <tr key={collection.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-rajdhani font-bold text-gray-900">{collection.name}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{collection.count.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{formatBytes(collection.size)}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{formatBytes(collection.storageSize)}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{collection.indexes}</td>
                      <td className="text-right py-3 px-4 text-gray-600">{formatBytes(collection.indexSize)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
