'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import {
  Activity, Server, Cpu, AlertTriangle, Zap, Users, FileWarning,
  RefreshCw, Shield, LogOut, MemoryStick, Timer, Box, Database,
  Globe, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';

// ===== TYPES =====
interface SystemData {
  system: { platform: string; nodeVersion: string; uptime: number; memory: { total: number; used: number; free: number; percentage: number }; cpu: { model: string; cores: number; usage: number } };
  process: { uptime: number; memory: { rss: number; heapUsed: number; heapTotal: number }; pid: number };
}
interface QueueData {
  execution: { waiting: number; active: number; completed: number; failed: number; delayed: number };
  submission: { waiting: number; active: number; completed: number; failed: number; delayed: number };
  health: { status: string; totalPending: number; warningThreshold: number; criticalThreshold: number };
}
interface DockerData {
  pool: { ready: number; busy: number; total: number; targetSize: number };
  containers: Array<{ id: string; status: string; created: string }>;
}
interface LogEntry { timestamp: string; level: string; message: string }
interface UserData { totalUsers: number; activeToday: number; recentSignups: Array<{ username: string; createdAt: string }> }
interface ErrorData { recentErrors: Array<{ timestamp: string; message: string; endpoint: string; count: number }>; totalErrors24h: number; errorRate: number }

function fmtUp(s: number) { const d=Math.floor(s/86400),h=Math.floor((s%86400)/3600),m=Math.floor((s%3600)/60); return d>0?`${d}d ${h}h`:h>0?`${h}h ${m}m`:`${m}m`; }
function fmtB(b: number) { return b>=1073741824?`${(b/1073741824).toFixed(1)} GB`:b>=1048576?`${(b/1048576).toFixed(0)} MB`:`${(b/1024).toFixed(0)} KB`; }

// ===== ARCHITECTURE LAYER CARD =====
function ArchLayer({ title, subtitle, icon: Icon, status, children }: {
  title: string; subtitle: string; icon: React.ElementType;
  status: 'online' | 'warning' | 'offline' | 'loading';
  children?: React.ReactNode;
}) {
  const statusMap = {
    online: { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'ONLINE' },
    warning: { dot: 'bg-amber-500', text: 'text-amber-600', label: 'WARNING' },
    offline: { dot: 'bg-red-500', text: 'text-red-600', label: 'OFFLINE' },
    loading: { dot: 'bg-gray-400', text: 'text-gray-400', label: 'LOADING' },
  };
  const s = statusMap[status];

  return (
    <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 hover:border-[#76B900]/40 hover:shadow-lg w-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#76B900]/10 border border-[#76B900]/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#76B900]" />
        </div>
        <div className="flex-1">
          <h3 className="font-orbitron text-lg font-bold text-gray-900 tracking-wide">{title}</h3>
          <p className="text-sm text-gray-500 font-rajdhani">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${s.dot} ${status === 'online' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-orbitron font-bold ${s.text} tracking-widest`}>{s.label}</span>
        </div>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

// ===== FLOW CONNECTOR =====
function FlowConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-[2px] h-5 bg-gradient-to-b from-[#76B900]/50 to-[#76B900]/10" />
      <span className="text-[10px] font-orbitron text-[#76B900]/60 uppercase tracking-[0.3em] my-1">{label}</span>
      <div className="w-[2px] h-5 bg-gradient-to-b from-[#76B900]/10 to-[#76B900]/50" />
    </div>
  );
}

// ===== MINI STAT =====
function MiniStat({ label, value, color = 'text-gray-900' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500 font-rajdhani font-medium">{label}</span>
      <span className={`text-sm font-fira font-bold ${color}`}>{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [system, setSystem] = useState<SystemData | null>(null);
  const [queues, setQueues] = useState<QueueData | null>(null);
  const [docker, setDocker] = useState<DockerData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<UserData | null>(null);
  const [errors, setErrors] = useState<ErrorData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [logsExpanded, setLogsExpanded] = useState(false);

  useEffect(() => {
    // TODO: Re-enable authentication later
    // const token = localStorage.getItem('authToken');
    // const isAuth = localStorage.getItem('isAuthenticated');
    // if (!token && !isAuth) { router.push('/login'); return; }
    setAuthed(true);
    setAuthChecking(false);
  }, [router]);

  const fetchAll = useCallback(async () => {
    setRefreshing(true); setFetchError(null);
    const r = await Promise.allSettled([
      api.admin.system(), api.admin.queues(), api.admin.docker(),
      api.admin.logs(30), api.admin.users(), api.admin.errors(),
    ]);
    if (r.every(x => x.status === 'rejected')) {
      const msg = (r[0] as PromiseRejectedResult).reason?.message || 'Failed';
      setFetchError(msg.includes('401') || msg.includes('403') ? 'Access denied. Admin privileges required.' : msg);
      setRefreshing(false); return;
    }
    if (r[0].status === 'fulfilled') setSystem(r[0].value as SystemData);
    if (r[1].status === 'fulfilled') setQueues(r[1].value as QueueData);
    if (r[2].status === 'fulfilled') setDocker(r[2].value as DockerData);
    if (r[3].status === 'fulfilled') { const d = r[3].value as any; setLogs(Array.isArray(d) ? d : d?.logs || []); }
    if (r[4].status === 'fulfilled') setUsers(r[4].value as UserData);
    if (r[5].status === 'fulfilled') setErrors(r[5].value as ErrorData);
    setLastUpdated(new Date()); setRefreshing(false);
  }, []);

  useEffect(() => { if (!authed) return; fetchAll(); const i = setInterval(fetchAll, 10000); return () => clearInterval(i); }, [authed, fetchAll]);

  if (authChecking) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Shield className="w-16 h-16 text-[#76B900] animate-pulse" />
    </div>
  );
  if (!authed) return null;

  const hs = queues?.health.status || 'loading';

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
      <AdminHeader />

      {/* ━━━ ERROR ━━━ */}
      {fetchError && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-base text-red-700 font-rajdhani font-semibold">{fetchError}</p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ━━━ TOP STATS ━━━ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* STATUS */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#76B900]/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">STATUS</span>
            </div>
            <p className={`text-3xl font-orbitron font-black ${hs === 'healthy' ? 'text-emerald-600' : 'text-red-600'}`}>{hs.toUpperCase()}</p>
            <p className="text-xs text-gray-400 font-rajdhani mt-1">{queues ? `${queues.health.totalPending} pending jobs` : ''}</p>
          </div>

          {/* CPU */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#76B900]/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">CPU</span>
            </div>
            <p className="text-3xl font-orbitron font-black text-[#76B900]">{system ? `${system.system.cpu.usage.toFixed(1)}%` : '—'}</p>
            {system && (
              <p className="text-xs text-gray-400 font-rajdhani mt-1">{system.system.cpu.cores} cores · {system.system.cpu.model.split(' ').slice(0, 4).join(' ')}</p>
            )}
          </div>

          {/* MEMORY */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#76B900]/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <MemoryStick className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">MEMORY</span>
            </div>
            <p className={`text-3xl font-orbitron font-black ${system && system.system.memory.percentage > 80 ? 'text-red-600' : 'text-[#76B900]'}`}>{system ? `${system.system.memory.percentage.toFixed(0)}%` : '—'}</p>
            {system && (
              <p className="text-xs text-gray-400 font-rajdhani mt-1">{fmtB(system.system.memory.used)} used / {fmtB(system.system.memory.total)} total</p>
            )}
          </div>

          {/* UPTIME */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#76B900]/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">UPTIME</span>
            </div>
            <p className="text-3xl font-orbitron font-black text-gray-900">{system ? fmtUp(system.system.uptime) : '—'}</p>
            {system && (
              <p className="text-xs text-gray-400 font-rajdhani mt-1">Process: {fmtUp(system.process.uptime)} · PID {system.process.pid}</p>
            )}
          </div>

          {/* ERRORS */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#76B900]/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FileWarning className="w-4 h-4 text-gray-400" />
              <span className="text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">ERRORS 24H</span>
            </div>
            <p className={`text-3xl font-orbitron font-black ${errors && errors.totalErrors24h > 10 ? 'text-red-600' : 'text-gray-900'}`}>{errors?.totalErrors24h ?? '—'}</p>
            {errors && (
              <p className="text-xs text-gray-400 font-rajdhani mt-1">{errors.errorRate}% error rate</p>
            )}
          </div>
        </div>

        {/* ━━━ ARCHITECTURE PIPELINE ━━━ */}
        <section>
          <h2 className="font-orbitron text-xs font-bold text-[#76B900] tracking-[0.3em] uppercase mb-6">Architecture Pipeline</h2>

          <div className="flex flex-col items-center max-w-2xl mx-auto">

            <div
              onClick={() => router.push('/admin/frontend')}
              className="cursor-pointer w-full"
            >
              <ArchLayer title="FRONTEND" subtitle="Railway · Next.js · Port 8080" icon={Globe} status="online">
                <div className="grid grid-cols-2 gap-x-6">
                  <MiniStat label="Active Users" value={users?.activeToday ?? '—'} color="text-[#76B900]" />
                  <MiniStat label="Total Users" value={users?.totalUsers ?? '—'} />
                </div>
              </ArchLayer>
            </div>

            <FlowConnector label="HTTPS" />

            <div
              onClick={() => router.push('/admin/nginx')}
              className="cursor-pointer w-full"
            >
              <ArchLayer title="NGINX" subtitle="Load Balancer · least_conn" icon={Server} status="online">
                <div className="grid grid-cols-2 gap-x-6">
                  <MiniStat label="Upstreams" value="2" />
                  <MiniStat label="Failover" value="auto" />
                </div>
              </ArchLayer>
            </div>

            <FlowConnector label="Proxy" />

            <div className="w-full grid grid-cols-2 gap-4">
              <div
                onClick={() => router.push('/admin/api')}
                className="cursor-pointer"
              >
                <ArchLayer title="API-1" subtitle="Port 4000 · Primary" icon={Server} status={system ? 'online' : 'loading'}>
                  {system && (
                    <>
                      <MiniStat label="CPU" value={`${system.system.cpu.usage.toFixed(1)}%`} color="text-[#76B900]" />
                      <MiniStat label="Memory" value={fmtB(system.process.memory.rss)} color="text-[#76B900]" />
                      <MiniStat label="Uptime" value={fmtUp(system.process.uptime)} />
                    </>
                  )}
                </ArchLayer>
              </div>
              <div
                onClick={() => router.push('/admin/api')}
                className="cursor-pointer"
              >
                <ArchLayer title="API-2" subtitle="Port 4001 · Failover" icon={Server} status={system ? 'online' : 'loading'}>
                  <MiniStat label="Role" value="Standby" />
                  <MiniStat label="Health" value="OK" color="text-emerald-600" />
                </ArchLayer>
              </div>
            </div>

            <FlowConnector label="Enqueue Jobs" />

            <div
              onClick={() => router.push('/admin/redis')}
              className="cursor-pointer w-full"
            >
              <ArchLayer title="REDIS" subtitle="localhost:6379 · BullMQ" icon={Database}
                status={queues ? (hs === 'healthy' ? 'online' : 'warning') : 'loading'}>
                {queues && (
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {[
                      { label: 'Pending', val: queues.health.totalPending, color: 'text-amber-600' },
                      { label: 'Completed', val: (queues.execution.completed + queues.submission.completed).toLocaleString(), color: 'text-emerald-600' },
                      { label: 'Failed', val: queues.execution.failed + queues.submission.failed, color: 'text-red-600' },
                    ].map((s, i) => (
                      <div key={i} className="text-center py-3 rounded-lg bg-gray-50 border border-gray-100">
                        <p className={`text-xl font-orbitron font-black ${s.color}`}>{s.val}</p>
                        <p className="text-[10px] text-gray-400 font-orbitron tracking-widest mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ArchLayer>
            </div>

            <FlowConnector label="Data & Assets" />

            <div className="w-full grid grid-cols-2 gap-4">
              <div
                onClick={() => router.push('/admin/mongodb')}
                className="cursor-pointer"
              >
                <ArchLayer title="MONGODB" subtitle="Atlas · Database" icon={Database} status="online">
                  <div className="space-y-2">
                    <MiniStat label="Cluster" value="code-runner-db" />
                    <MiniStat label="Status" value="Connected" color="text-emerald-600" />
                  </div>
                </ArchLayer>
              </div>
              <div
                onClick={() => router.push('/admin/cloudinary')}
                className="cursor-pointer"
              >
                <ArchLayer title="CLOUDINARY" subtitle="CDN · Asset Storage" icon={Server} status="online">
                  <div className="space-y-2">
                    <MiniStat label="Storage" value="Cloud CDN" />
                    <MiniStat label="Status" value="Active" color="text-emerald-600" />
                  </div>
                </ArchLayer>
              </div>
            </div>

            <FlowConnector label="Dequeue & Process" />

            <div className="w-full grid grid-cols-2 gap-4">
              {['Runner-1', 'Runner-2'].map((name, i) => (
                <div
                  key={i}
                  onClick={() => router.push('/admin/runners')}
                  className="cursor-pointer"
                >
                  <ArchLayer title={name.toUpperCase()} subtitle="BullMQ Worker" icon={Zap} status={docker ? 'online' : 'loading'}>
                    <MiniStat label="Exec concurrency" value="5" />
                    <MiniStat label="Submit concurrency" value="3" />
                  </ArchLayer>
                </div>
              ))}
            </div>

            <FlowConnector label="docker.sock" />

            <div
              onClick={() => router.push('/admin/docker')}
              className="cursor-pointer w-full"
            >
              <ArchLayer title="DOCKER POOL" subtitle="python-code-runner · Sandboxed" icon={Box}
                status={docker && docker.pool.total > 0 ? 'online' : docker ? 'warning' : 'loading'}>
                {docker && (
                  <>
                    <div className="grid grid-cols-4 gap-3 mt-2 mb-4">
                      {[
                        { label: 'Ready', val: docker.pool.ready, color: 'text-emerald-600' },
                        { label: 'Busy', val: docker.pool.busy, color: 'text-amber-600' },
                        { label: 'Total', val: docker.pool.total, color: 'text-[#76B900]' },
                        { label: 'Target', val: docker.pool.targetSize, color: 'text-gray-400' },
                      ].map((s, i) => (
                        <div key={i} className="text-center py-3 rounded-lg bg-gray-50 border border-gray-100">
                          <p className={`text-lg font-orbitron font-black ${s.color}`}>{s.val}</p>
                          <p className="text-[10px] text-gray-400 font-orbitron tracking-widest mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {docker.containers.length > 0 && (
                      <div className="space-y-1.5">
                        {docker.containers.map((c, i) => (
                          <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
                            <span className={`w-2 h-2 rounded-full ${c.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className="font-fira text-xs text-gray-500 truncate flex-1">{c.id}</span>
                            <span className={`text-[10px] font-orbitron font-bold tracking-widest ${c.status === 'busy' ? 'text-amber-600' : 'text-emerald-600'}`}>{c.status.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </ArchLayer>
            </div>

          </div>
        </section>

        {/* ━━━ QUEUES ━━━ */}
        <section>
          <h2 className="font-orbitron text-xs font-bold text-[#76B900] tracking-[0.3em] uppercase mb-6">Queue Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {queues ? (
              [
                { title: 'Execution Queue', data: queues.execution, type: 'execution' as const },
                { title: 'Submission Queue', data: queues.submission, type: 'submission' as const },
              ].map((q, i) => (
                <div
                  key={i}
                  onClick={() => router.push('/admin/queues')}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#76B900]/30 transition-colors cursor-pointer"
                >
                  <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wider mb-5">{q.title}</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    {[
                      { label: 'Waiting', val: q.data.waiting, c: 'text-amber-600' },
                      { label: 'Active', val: q.data.active, c: 'text-blue-600' },
                      { label: 'Completed', val: q.data.completed.toLocaleString(), c: 'text-emerald-600' },
                      { label: 'Failed', val: q.data.failed, c: 'text-red-600' },
                      { label: 'Delayed', val: q.data.delayed, c: 'text-gray-400' },
                    ].map((row, j) => (
                      <div key={j} className="flex justify-between py-2 border-b border-gray-100">
                        <span className={`text-sm font-semibold font-rajdhani ${row.c}`}>{row.label}</span>
                        <span className="text-sm font-fira font-bold text-gray-900">{row.val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    {q.data.active + q.data.waiting > 0 ? (
                      <>
                        <div className="bg-blue-500 h-full" style={{ width: `${(q.data.active / Math.max(q.data.active + q.data.waiting, 1)) * 100}%` }} />
                        <div className="bg-amber-400 h-full" style={{ width: `${(q.data.waiting / Math.max(q.data.active + q.data.waiting, 1)) * 100}%` }} />
                      </>
                    ) : <div className="bg-emerald-500/20 h-full w-full" />}
                  </div>
                </div>
              ))
            ) : [1, 2].map(i => <div key={i} className="bg-white border-2 border-gray-200 rounded-xl p-6 h-48 animate-pulse" />)}
          </div>
        </section>

        {/* ━━━ ERRORS & LOGS ━━━ */}
        <section>
          <h2 className="font-orbitron text-xs font-bold text-[#76B900] tracking-[0.3em] uppercase mb-6">Diagnostics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <div
              onClick={() => router.push('/admin/errors')}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition-colors cursor-pointer"
            >
              <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wider mb-4">
                Error Patterns
                {errors && <span className="text-sm font-rajdhani text-gray-400 ml-2 font-normal">({errors.totalErrors24h} in 24h · {errors.errorRate}% rate)</span>}
              </h3>
              {errors && errors.recentErrors.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {errors.recentErrors.map((err, i) => (
                    <div key={i} className="p-4 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-fira text-sm text-red-600 font-bold">{err.endpoint}</span>
                        <span className="font-orbitron text-red-600 font-black text-lg">×{err.count}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate font-rajdhani">{err.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-400 font-rajdhani">{errors ? 'No errors in last 24h ✓' : 'Loading...'}</p>
              )}
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-orbitron text-base font-bold text-gray-900 tracking-wider mb-4">System Logs</h3>
              {logs.length > 0 ? (
                <>
                  <div className="space-y-1 font-fira text-xs max-h-[300px] overflow-y-auto">
                    {(logsExpanded ? logs : logs.slice(0, 10)).map((log, i) => (
                      <div key={i} className={`flex gap-3 py-2 px-3 rounded-lg ${
                        log.level === 'error' ? 'bg-red-50' : log.level === 'warn' ? 'bg-amber-50' : 'bg-gray-50'
                      }`}>
                        <span className="text-gray-400 flex-shrink-0 w-[68px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`flex-shrink-0 w-[44px] uppercase font-bold ${
                          log.level === 'error' ? 'text-red-500' : log.level === 'warn' ? 'text-amber-500' : 'text-gray-400'
                        }`}>{log.level}</span>
                        <span className="text-gray-600 truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                  {logs.length > 10 && (
                    <button onClick={() => setLogsExpanded(!logsExpanded)}
                      className="mt-3 flex items-center gap-1.5 text-xs font-orbitron text-[#76B900] hover:text-[#5a9000] tracking-wider">
                      {logsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {logsExpanded ? 'COLLAPSE' : `SHOW ALL ${logs.length}`}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-base text-gray-400 font-rajdhani">No logs available</p>
              )}
            </div>
          </div>
        </section>

        {/* ━━━ SIGNUPS ━━━ */}
        {users && users.recentSignups.length > 0 && (
          <section>
            <h2 className="font-orbitron text-xs font-bold text-[#76B900] tracking-[0.3em] uppercase mb-6">Recent Signups</h2>
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">#</th>
                    <th className="px-6 py-4 text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">USERNAME</th>
                    <th className="px-6 py-4 text-[10px] font-orbitron text-gray-400 tracking-[0.2em]">JOINED</th>
                  </tr>
                </thead>
                <tbody>
                  {users.recentSignups.slice(0, 10).map((u, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-[#76B900]/5 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-400 font-fira">{i + 1}</td>
                      <td className="px-6 py-3 text-sm font-rajdhani font-bold text-gray-900">{u.username}</td>
                      <td className="px-6 py-3 text-sm text-gray-400 font-fira">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t-2 border-gray-200 bg-white mt-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs font-rajdhani text-gray-400">Code Runner Admin · v1.0</p>
          <p className="text-xs font-fira text-gray-400">Auto-refresh: 10s</p>
        </div>
      </footer>
    </div>
  );
}
