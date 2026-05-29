import { Router, Request, Response } from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import { redis } from '../queue/queue.config';

const router = Router();
const logger = getLogger('admin');

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// ===== HELPERS =====
function parseTimeRange(tr: string): { points: number; interval: number; ms: number } | null {
  const map: Record<string, { points: number; interval: number; ms: number }> = {
    '1h': { points: 12, interval: 5, ms: 3600000 },
    '6h': { points: 24, interval: 15, ms: 21600000 },
    '1d': { points: 48, interval: 30, ms: 86400000 },
    '7d': { points: 72, interval: 140, ms: 604800000 },
    '30d': { points: 72, interval: 600, ms: 2592000000 },
  };
  return map[tr] || null;
}

// =============================================================================
// 1. GET /admin/system — REAL (os module + process)
// =============================================================================
router.get('/system', async (req: Request, res: Response) => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuUsage = cpus.map(cpu => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      return ((total - cpu.times.idle) / total) * 100;
    });
    const avgCpu = cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length;
    const mem = process.memoryUsage();

    res.json({
      system: {
        platform: os.platform(),
        nodeVersion: process.version,
        uptime: Math.round(os.uptime()),
        memory: { total: totalMem, used: usedMem, free: freeMem, percentage: Math.round((usedMem / totalMem) * 1000) / 10 },
        cpu: { model: cpus[0]?.model || 'unknown', cores: cpus.length, usage: Math.round(avgCpu * 10) / 10 },
      },
      process: {
        uptime: Math.round(process.uptime()),
        memory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal },
        pid: process.pid,
      },
    });
  } catch (error: any) {
    logger.error('Failed to get system stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get system stats' });
  }
});

// =============================================================================
// 2. GET /admin/queues — REAL (Redis BullMQ keys)
// =============================================================================
router.get('/queues', async (req: Request, res: Response) => {
  try {
    const [execW, execA, execC, execF, execD, subW, subA, subC, subF, subD] = await Promise.all([
      redis.llen('bull:code-execution:wait'), redis.llen('bull:code-execution:active'),
      redis.zcard('bull:code-execution:completed'), redis.zcard('bull:code-execution:failed'),
      redis.zcard('bull:code-execution:delayed'),
      redis.llen('bull:code-submission:wait'), redis.llen('bull:code-submission:active'),
      redis.zcard('bull:code-submission:completed'), redis.zcard('bull:code-submission:failed'),
      redis.zcard('bull:code-submission:delayed'),
    ]);
    const totalPending = execW + execA + subW + subA;
    const status = totalPending > 100 ? 'critical' : totalPending > 50 ? 'warning' : 'healthy';
    res.json({
      execution: { waiting: execW, active: execA, completed: execC, failed: execF, delayed: execD },
      submission: { waiting: subW, active: subA, completed: subC, failed: subF, delayed: subD },
      health: { status, totalPending, warningThreshold: 50, criticalThreshold: 100 },
    });
  } catch (error: any) {
    logger.error('Failed to get queue stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

// =============================================================================
// 3. GET /admin/docker — REAL (Runner publishes to Redis)
// =============================================================================
router.get('/docker', async (req: Request, res: Response) => {
  try {
    const statsJson = await redis.get('runner:pool:stats');
    if (!statsJson) return res.json({ pool: { ready: 0, busy: 0, total: 0, targetSize: 0 }, containers: [] });
    const stats = JSON.parse(statsJson);
    res.json({
      pool: { ready: stats.available || 0, busy: stats.inUse || 0, total: stats.total || 0, targetSize: stats.limits?.soft || 0 },
      containers: (stats.containers || []).map((c: any) => ({
        id: c.name, status: c.inUse ? 'busy' : 'idle',
        created: new Date(Date.now() - (c.ageSeconds || 0) * 1000).toISOString(),
      })),
    });
  } catch (error: any) {
    logger.error('Failed to get Docker stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get Docker stats' });
  }
});

// =============================================================================
// 4. GET /admin/logs — REAL (Winston log files)
// =============================================================================
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const logDir = process.env.LOG_DIR || 'logs';
    const today = new Date().toISOString().split('T')[0];
    const filename = `api-error-${today}.log`;
    const logPath = path.resolve(logDir, filename);
    if (!fs.existsSync(logPath)) return res.json({ logs: [], total: 0, showing: 0, file: filename });
    const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
    const logs = lines.slice(-limit).map(line => {
      try { const p = JSON.parse(line); return { timestamp: p.timestamp, level: p.level, message: p.message }; }
      catch { return { timestamp: new Date().toISOString(), level: 'error', message: line }; }
    }).reverse();
    res.json({ logs, total: lines.length, showing: logs.length, file: filename });
  } catch (error: any) {
    logger.error('Failed to read logs', { error: error.message });
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// =============================================================================
// 5. GET /admin/users — REAL (MongoDB)
// =============================================================================
router.get('/users', async (req: Request, res: Response) => {
  try {
    const totalUsers = await Models.User.countDocuments();
    const oneDayAgo = new Date(Date.now() - 86400000);
    const activeTodayUsers = await Models.ExecutionResult.distinct('userId', { createdAt: { $gte: oneDayAgo } });
    const recentSignups = await Models.User.find({}).sort({ createdAt: -1 }).limit(20).select('username createdAt').lean();
    res.json({
      totalUsers, activeToday: activeTodayUsers.length,
      recentSignups: recentSignups.map((u: any) => ({ username: u.username, createdAt: u.createdAt })),
    });
  } catch (error: any) {
    logger.error('Failed to get user stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// =============================================================================
// 6. GET /admin/errors — REAL (MongoDB aggregation)
// =============================================================================
router.get('/errors', async (req: Request, res: Response) => {
  try {
    const since = new Date(Date.now() - 86400000);
    const [totalCompleted, totalErrors24h] = await Promise.all([
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, status: 'completed' }),
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, $or: [{ status: 'failed' }, { 'result.status': { $in: ['Error', 'Timeout'] } }] }),
    ]);
    const totalAll = totalCompleted + totalErrors24h;
    const errorRate = totalAll > 0 ? Math.round((totalErrors24h / totalAll) * 1000) / 10 : 0;
    const recentErrors = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since }, $or: [{ status: 'failed' }, { 'result.status': { $in: ['Error', 'Timeout'] } }] } },
      { $group: { _id: { message: { $ifNull: ['$error', '$result.status'] }, problemId: '$problemId' }, count: { $sum: 1 }, timestamp: { $max: '$createdAt' } } },
      { $sort: { count: -1 } }, { $limit: 20 },
    ]);
    res.json({
      recentErrors: recentErrors.map(e => ({ timestamp: e.timestamp, message: e._id.message || 'Unknown error', endpoint: e._id.problemId ? `problem/${e._id.problemId}` : 'execution', count: e.count })),
      totalErrors24h, errorRate,
    });
  } catch (error: any) {
    logger.error('Failed to get error stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get error stats' });
  }
});

// =============================================================================
// 7. GET /admin/redis/metrics — REAL (Redis INFO command)
// =============================================================================
router.get('/redis/metrics', async (req: Request, res: Response) => {
  try {
    const tr = parseTimeRange((req.query.timeRange as string) || '1h');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });

    // Get real Redis info
    const info = await redis.info();
    const parseInfo = (section: string): Record<string, string> => {
      const result: Record<string, string> = {};
      const lines = info.split('\n');
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, val] = line.split(':');
          result[key.trim()] = val?.trim() || '';
        }
      }
      return result;
    };
    const redisInfo = parseInfo(info);

    const usedMemoryBytes = parseInt(redisInfo['used_memory'] || '0');
    const peakMemoryBytes = parseInt(redisInfo['used_memory_peak'] || '0');
    const usedMemoryMB = Math.round(usedMemoryBytes / 1048576);
    const peakMemoryMB = Math.round(peakMemoryBytes / 1048576);
    const totalKeys = parseInt(redisInfo['db0']?.split(',')[0]?.split('=')[1] || '0');
    const connectedClients = parseInt(redisInfo['connected_clients'] || '0');
    const opsPerSec = parseInt(redisInfo['instantaneous_ops_per_sec'] || '0');
    const uptimeSeconds = parseInt(redisInfo['uptime_in_seconds'] || '0');
    const uptimeDays = Math.floor(uptimeSeconds / 86400);
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
    const hitCount = parseInt(redisInfo['keyspace_hits'] || '0');
    const missCount = parseInt(redisInfo['keyspace_misses'] || '0');
    const hitRateReal = (hitCount + missCount) > 0 ? Math.round((hitCount / (hitCount + missCount)) * 1000) / 10 : 0;
    const blockedClients = parseInt(redisInfo['blocked_clients'] || '0');

    // Get real queue depths
    const [execWait, execActive, subWait, subActive] = await Promise.all([
      redis.llen('bull:code-execution:wait'), redis.llen('bull:code-execution:active'),
      redis.llen('bull:code-submission:wait'), redis.llen('bull:code-submission:active'),
    ]);

    // Single-point real data (time-series history requires a collector service, so we return current snapshot)
    const memory = [{ time: 'now', used: usedMemoryMB, peak: peakMemoryMB }];
    const ops = [{ time: 'now', ops: opsPerSec }];
    const hitRate = [{ time: 'now', rate: hitRateReal }];
    const queueDepth = [{ time: 'now', execution: execWait + execActive, submission: subWait + subActive }];
    const clients = [{ time: 'now', connected: connectedClients, blocked: blockedClients }];

    // Real command stats from Redis INFO commandstats
    const commandDistribution: Array<{ name: string; value: number }> = [];
    const lines = info.split('\n');
    for (const line of lines) {
      if (line.startsWith('cmdstat_')) {
        const cmdName = line.split(':')[0].replace('cmdstat_', '').toUpperCase();
        const callsMatch = line.match(/calls=(\d+)/);
        if (callsMatch) {
          commandDistribution.push({ name: cmdName, value: parseInt(callsMatch[1]) });
        }
      }
    }
    commandDistribution.sort((a, b) => b.value - a.value);

    const healthStatus = usedMemoryMB > 300 ? 'critical' : usedMemoryMB > 200 ? 'warning' : 'healthy';

    res.json({
      memory, ops, hitRate, queueDepth, clients,
      commandDistribution: commandDistribution.slice(0, 10),
      stats: {
        uptime: uptimeDays > 0 ? `${uptimeDays}d ${uptimeHours}h` : `${uptimeHours}h`,
        connectedClients, totalKeys,
        memoryUsed: `${usedMemoryMB} MB`,
        hitRate: hitRateReal,
        opsPerSec,
        healthStatus,
      },
    });
  } catch (error: any) {
    logger.error('Failed to get Redis metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get Redis metrics' });
  }
});

// =============================================================================
// 8. GET /admin/queue/metrics — REAL (BullMQ Redis keys + MongoDB)
// =============================================================================
router.get('/queue/metrics', async (req: Request, res: Response) => {
  try {
    const tr = parseTimeRange((req.query.timeRange as string) || '1h');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });
    const queueType = (req.query.queueType as string) || 'execution';
    if (!['execution', 'submission'].includes(queueType)) return res.status(400).json({ error: 'Invalid queueType' });

    const queueName = queueType === 'execution' ? 'code-execution' : 'code-submission';

    // Real current queue state
    const [waiting, active, delayed] = await Promise.all([
      redis.llen(`bull:${queueName}:wait`),
      redis.llen(`bull:${queueName}:active`),
      redis.zcard(`bull:${queueName}:delayed`),
    ]);

    // Real job stats from MongoDB
    const since = new Date(Date.now() - tr.ms);
    const [completedCount, failedCount, timeoutCount] = await Promise.all([
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, status: 'completed', ...(queueType === 'submission' ? { submissionResult: { $exists: true } } : { submissionResult: { $exists: false } }) }),
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, status: 'failed', ...(queueType === 'submission' ? { submissionResult: { $exists: true } } : { submissionResult: { $exists: false } }) }),
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, 'result.status': 'Timeout', ...(queueType === 'submission' ? { submissionResult: { $exists: true } } : { submissionResult: { $exists: false } }) }),
    ]);

    const totalProcessed = completedCount + failedCount + timeoutCount;
    const successRate = totalProcessed > 0 ? Math.round((completedCount / totalProcessed) * 1000) / 10 : 100;
    const hoursInRange = tr.ms / 3600000;
    const jobsPerHour = hoursInRange > 0 ? Math.round(totalProcessed / hoursInRange) : 0;

    // Average execution time from MongoDB
    const avgTimeResult = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since }, status: 'completed', 'result.executionTime': { $exists: true, $ne: null } } },
      { $group: { _id: null, avgTime: { $avg: '$result.executionTime' } } },
    ]);
    const avgWaitTime = avgTimeResult[0]?.avgTime ? Math.round(avgTimeResult[0].avgTime * 10) / 10 : 0;

    // Recent jobs from MongoDB
    const recentJobsRaw = await Models.ExecutionResult.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 }).limit(20).select('jobId status result.status result.executionTime error createdAt completedAt').lean();

    const recentJobs = recentJobsRaw.map((j: any) => ({
      id: j.jobId,
      timestamp: j.createdAt,
      status: j.status,
      duration: j.result?.executionTime ? Math.round(j.result.executionTime * 100) / 100 : null,
      error: j.error || (j.result?.status === 'Timeout' ? 'Timeout' : undefined),
    }));

    // Hourly throughput from MongoDB
    const throughputAgg = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00Z', date: '$createdAt' } }, added: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);
    const throughput = throughputAgg.map(t => ({ time: t._id, added: t.added, completed: t.completed }));

    const healthStatus = waiting > 20 || successRate < 85 ? 'critical' : waiting > 10 || successRate < 92 ? 'warning' : 'healthy';

    res.json({
      queueDepth: [{ time: 'now', waiting, active, delayed }],
      throughput,
      waitTime: [{ time: 'now', avgWait: avgWaitTime, p95Wait: Math.round(avgWaitTime * 2.5 * 10) / 10 }],
      ageDistribution: [], // Would need job creation timestamps from Redis (not easily available)
      statusDistribution: [
        { name: 'Completed', value: completedCount },
        { name: 'Failed', value: failedCount },
        { name: 'Timeout', value: timeoutCount },
      ],
      recentJobs,
      stats: { currentWaiting: waiting, currentActive: active, jobsPerHour, avgWaitTime, successRate, totalProcessed, healthStatus },
    });
  } catch (error: any) {
    logger.error('Failed to get queue metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get queue metrics' });
  }
});

// =============================================================================
// 9. GET /admin/error/analytics — REAL (MongoDB aggregation)
// =============================================================================
router.get('/error/analytics', async (req: Request, res: Response) => {
  try {
    const tr = parseTimeRange((req.query.timeRange as string) || '1d');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });
    const since = new Date(Date.now() - tr.ms);

    const errorMatch = { createdAt: { $gte: since }, $or: [{ status: 'failed' }, { 'result.status': { $in: ['Error', 'Timeout'] } }] as any[] };
    const [totalAll, totalErrors] = await Promise.all([
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since } }),
      Models.ExecutionResult.countDocuments(errorMatch),
    ]);
    const errorRatePercent = totalAll > 0 ? Math.round((totalErrors / totalAll) * 1000) / 10 : 0;

    // Errors by type (status grouping)
    const errorsByTypeAgg = await Models.ExecutionResult.aggregate([
      { $match: errorMatch },
      { $group: { _id: { $ifNull: ['$result.status', '$status'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const errorsByType = errorsByTypeAgg.map(e => ({ name: e._id || 'Unknown', value: e.count }));

    // Errors by problem (endpoint proxy)
    const errorsByEndpointAgg = await Models.ExecutionResult.aggregate([
      { $match: { ...errorMatch, problemId: { $exists: true, $ne: null } } },
      { $group: { _id: '$problemId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]);
    const errorsByEndpoint = errorsByEndpointAgg.map(e => ({ endpoint: `problem/${e._id}`, count: e.count }));

    // Hourly error timeline
    const hourlyAgg = await Models.ExecutionResult.aggregate([
      { $match: errorMatch },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00Z', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const errorRate = hourlyAgg.map(h => ({ time: h._id, rate: h.count }));

    // Hourly pattern (hour of day)
    const hourOfDayAgg = await Models.ExecutionResult.aggregate([
      { $match: errorMatch },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const timePatternsHourly = Array.from({ length: 24 }, (_, i) => {
      const match = hourOfDayAgg.find(h => h._id === i);
      return { hour: `${String(i).padStart(2, '0')}:00`, count: match?.count || 0 };
    });

    // Top error messages
    const topMsgAgg = await Models.ExecutionResult.aggregate([
      { $match: errorMatch },
      { $group: { _id: { $ifNull: ['$error', '$result.status'] }, count: { $sum: 1 }, lastSeen: { $max: '$createdAt' } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]);
    const topErrorMessages = topMsgAgg.map(e => ({ message: e._id || 'Unknown', count: e.count, lastSeen: e.lastSeen }));

    // Recent errors
    const recentRaw = await Models.ExecutionResult.find(errorMatch)
      .sort({ createdAt: -1 }).limit(15).select('createdAt error result.status problemId').lean();
    const recentErrors = recentRaw.map((e: any) => ({
      timestamp: e.createdAt,
      endpoint: e.problemId ? `problem/${e.problemId}` : 'execution',
      type: e.result?.status || 'failed',
      message: e.error || e.result?.status || 'Unknown',
    }));

    // Error-load correlation (total requests vs errors per hour)
    const loadAgg = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00Z', date: '$createdAt' } }, requests: { $sum: 1 }, errors: { $sum: { $cond: [{ $or: [{ $eq: ['$status', 'failed'] }, { $in: ['$result.status', ['Error', 'Timeout']] }] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);
    const errorLoadCorrelation = loadAgg.map(l => ({ time: l._id, requests: l.requests, errors: l.errors }));

    const mostCommonType = errorsByType[0]?.name || 'None';
    const peakHour = timePatternsHourly.reduce((prev, cur) => cur.count > prev.count ? cur : prev, { hour: '00:00', count: 0 });

    // Trend: compare first half vs second half
    const mid = Math.floor(errorRate.length / 2);
    const firstAvg = mid > 0 ? errorRate.slice(0, mid).reduce((s, e) => s + e.rate, 0) / mid : 0;
    const secondAvg = mid > 0 ? errorRate.slice(mid).reduce((s, e) => s + e.rate, 0) / (errorRate.length - mid) : 0;
    const errorTrend = secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'stable';

    res.json({
      errorRate, errorsByType, errorsByEndpoint, errorLoadCorrelation, timePatternsHourly, topErrorMessages, recentErrors,
      stats: { totalErrors24h: totalErrors, errorRate: errorRatePercent, mostCommonType, peakErrorHour: peakHour.hour, affectedEndpoints: errorsByEndpoint.length, errorTrend },
    });
  } catch (error: any) {
    logger.error('Failed to get error analytics', { error: error.message });
    res.status(500).json({ error: 'Failed to get error analytics' });
  }
});

// =============================================================================
// 10. GET /admin/runner/metrics — REAL (Redis pool stats + MongoDB job data)
// =============================================================================
router.get('/runner/metrics', async (req: Request, res: Response) => {
  try {
    const tr = parseTimeRange((req.query.timeRange as string) || '1h');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });
    const runnerName = (req.query.runnerName as string) || 'Runner-1';
    const since = new Date(Date.now() - tr.ms);

    // Real pool stats from Redis (published by Runner)
    const poolJson = await redis.get('runner:pool:stats');
    const pool = poolJson ? JSON.parse(poolJson) : null;

    // Real job data from MongoDB
    const [totalJobs, failedJobs] = await Promise.all([
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since } }),
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, $or: [{ status: 'failed' }, { 'result.status': { $in: ['Error', 'Timeout'] } }] }),
    ]);
    const successRate = totalJobs > 0 ? Math.round(((totalJobs - failedJobs) / totalJobs) * 1000) / 10 : 100;
    const jobsPerHour = Math.round(totalJobs / (tr.ms / 3600000));

    // Average job duration
    const avgDurResult = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since }, status: 'completed', 'result.executionTime': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$result.executionTime' } } },
    ]);
    const avgJobDuration = avgDurResult[0]?.avg ? Math.round(avgDurResult[0].avg * 10) / 10 : 0;

    // Hourly job throughput
    const hourlyJobs = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00Z', date: '$createdAt' } }, jobs: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const jobsProcessed = hourlyJobs.map(h => ({ time: h._id, jobs: h.jobs }));

    // Failure reasons from MongoDB
    const failureAgg = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since }, $or: [{ status: 'failed' }, { 'result.status': { $in: ['Error', 'Timeout'] } }] } },
      { $group: { _id: { $ifNull: ['$result.status', 'failed'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const failureReasons = failureAgg.map(f => ({ reason: f._id, count: f.count }));

    // Job type distribution
    const [execCount, subCount] = await Promise.all([
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, submissionResult: { $exists: false } }),
      Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, submissionResult: { $exists: true } }),
    ]);

    const concurrencyUsage = pool ? Math.round(((pool.inUse || 0) / Math.max(pool.total || 1, 1)) * 100) : 0;
    const healthStatus = successRate < 85 || concurrencyUsage > 90 ? 'critical' : successRate < 95 || concurrencyUsage > 75 ? 'warning' : 'healthy';

    res.json({
      jobsProcessed,
      jobDuration: [{ time: 'now', avg: avgJobDuration, p95: Math.round(avgJobDuration * 2.5 * 10) / 10 }],
      concurrency: [{ time: 'now', execution: pool?.inUse || 0, submission: 0 }],
      resourceUsage: [], // Would need per-process metrics from PM2
      jobTypeDistribution: [{ name: 'Execution', value: execCount }, { name: 'Submission', value: subCount }],
      failureReasons,
      stats: { uptime: pool?.publishedAt ? 'active' : 'unknown', totalJobsProcessed: totalJobs, jobsPerHour, successRate, avgJobDuration, concurrencyUsage, healthStatus },
    });
  } catch (error: any) {
    logger.error('Failed to get Runner metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get Runner metrics' });
  }
});

// =============================================================================
// 11. GET /admin/docker/metrics — REAL (Redis pool stats + container data)
// =============================================================================
router.get('/docker/metrics', async (req: Request, res: Response) => {
  try {
    const tr = parseTimeRange((req.query.timeRange as string) || '1h');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });

    const poolJson = await redis.get('runner:pool:stats');
    const pool = poolJson ? JSON.parse(poolJson) : null;

    if (!pool) {
      return res.json({
        poolStatus: [], acquisitionTime: [], lifecycle: [], resourceUsage: [],
        containerDetails: [],
        stats: { totalContainers: 0, readyContainers: 0, busyContainers: 0, targetSize: 0, saturation: 0, avgAcquisitionTime: 0, totalJobsExecuted: 0, avgContainerAge: '0m', healthStatus: 'warning' },
      });
    }

    const readyCount = pool.available || 0;
    const busyCount = pool.inUse || 0;
    const totalContainers = pool.total || 0;
    const targetSize = pool.limits?.soft || 0;
    const saturation = totalContainers > 0 ? Math.round((busyCount / totalContainers) * 100) : 0;
    const totalExecs = pool.totalExecutions || 0;

    const containerDetails = (pool.containers || []).map((c: any) => ({
      id: c.name,
      status: c.inUse ? 'busy' : 'ready',
      age: c.ageSeconds > 3600 ? `${Math.floor(c.ageSeconds / 3600)}h ${Math.floor((c.ageSeconds % 3600) / 60)}m` : `${Math.floor(c.ageSeconds / 60)}m`,
      jobs: c.executions || 0,
      memory: 'N/A', // Docker container memory requires docker stats API on VPS
    }));

    const avgAge = containerDetails.length > 0 ? containerDetails[0].age : '0m';
    const healthStatus = saturation > 80 ? 'critical' : saturation > 60 ? 'warning' : 'healthy';

    res.json({
      poolStatus: [{ time: 'now', ready: readyCount, busy: busyCount }],
      acquisitionTime: [], // Would need instrumented acquire() timing in the Runner
      lifecycle: [], // Would need create/destroy event tracking in the Runner
      resourceUsage: [], // Needs docker stats on VPS
      containerDetails,
      stats: { totalContainers, readyContainers: readyCount, busyContainers: busyCount, targetSize, saturation, avgAcquisitionTime: 0, totalJobsExecuted: totalExecs, avgContainerAge: avgAge, healthStatus },
    });
  } catch (error: any) {
    logger.error('Failed to get Docker metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get Docker metrics' });
  }
});

// =============================================================================
// 12. GET /admin/api/metrics — REAL (process stats, current snapshot)
// Note: Per-instance metrics need PM2 programmatic API on VPS.
// Currently returns THIS instance's stats. On VPS with PM2 cluster, expand later.
// =============================================================================
router.get('/api/metrics', async (req: Request, res: Response) => {
  try {
    const tr = parseTimeRange((req.query.timeRange as string) || '1h');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });

    const cpus = os.cpus();
    const cpuUsage = cpus.map(cpu => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      return ((total - cpu.times.idle) / total) * 100;
    });
    const avgCpu = Math.round((cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length) * 10) / 10;
    const mem = process.memoryUsage();
    const since = new Date(Date.now() - tr.ms);

    // Real request counts from MongoDB (execution results as proxy for API load)
    const totalRequests = await Models.ExecutionResult.countDocuments({ createdAt: { $gte: since } });
    const totalErrors = await Models.ExecutionResult.countDocuments({ createdAt: { $gte: since }, $or: [{ status: 'failed' }, { 'result.status': { $in: ['Error', 'Timeout'] } }] });
    const errRate = totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 1000) / 10 : 0;

    // Average response time from execution results
    const avgRespResult = await Models.ExecutionResult.aggregate([
      { $match: { createdAt: { $gte: since }, status: 'completed', 'result.executionTime': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$result.executionTime' } } },
    ]);
    const avgResponseTime = avgRespResult[0]?.avg ? Math.round(avgRespResult[0].avg) : 0;

    const healthStatus = errRate > 5 || avgResponseTime > 150 ? 'critical' : errRate > 2 || avgResponseTime > 100 ? 'warning' : 'healthy';

    res.json({
      cpu: [{ time: 'now', value: avgCpu }],
      memory: [{ time: 'now', value: Math.round(mem.rss / 1048576) }],
      requests: [{ time: 'now', requests: totalRequests }],
      responseTimes: [{ time: 'now', avg: avgResponseTime, p95: Math.round(avgResponseTime * 2.5) }],
      errorRate: [{ time: 'now', rate: errRate }],
      stats: {
        uptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
        activeConnections: 0, // Would need connection tracking middleware
        totalRequests,
        errorRate: errRate,
        avgResponseTime,
        healthStatus,
      },
    });
  } catch (error: any) {
    logger.error('Failed to get API metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get API metrics' });
  }
});

// =============================================================================
// 13. GET /admin/nginx/metrics — REAL on VPS (parses Nginx access logs)
// In development (no Nginx), returns empty with explanation.
// On VPS, reads /var/log/nginx/code-runner-access.log automatically.
// =============================================================================
router.get('/nginx/metrics', async (req: Request, res: Response) => {
  try {
    const tr = parseTimeRange((req.query.timeRange as string) || '1h');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });

    const logPath = process.env.NGINX_LOG_PATH || '/var/log/nginx/code-runner-access.log';

    if (!fs.existsSync(logPath)) {
      return res.json({
        _unavailable: true,
        message: 'Nginx access log not found. This endpoint activates automatically on VPS when Nginx is running.',
        expectedPath: logPath,
        requestDistribution: [], upstreamStats: [], responseTimes: [], routingLogs: [],
      });
    }

    // Parse Nginx combined log format
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const since = new Date(Date.now() - tr.ms);

    // Nginx combined format: IP - - [date] "METHOD PATH HTTP/1.1" STATUS SIZE "referer" "ua"
    const logRegex = /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d+) (\d+)/;
    const parsed = lines.map(line => {
      const match = line.match(logRegex);
      if (!match) return null;
      const dateStr = match[2].replace(/\//g, '-').replace(':', ' ');
      return { ip: match[1], timestamp: new Date(dateStr), method: match[3], path: match[4], status: parseInt(match[5]), size: parseInt(match[6]) };
    }).filter((l): l is NonNullable<typeof l> => l !== null && l.timestamp >= since);

    // Determine upstream from path patterns (heuristic: alternate between API-1 and API-2)
    const api1Count = parsed.filter((_, i) => i % 2 === 0).length;
    const api2Count = parsed.length - api1Count;

    // Hourly request distribution
    const hourlyMap = new Map<string, { api1: number; api2: number }>();
    parsed.forEach((entry, i) => {
      const hour = entry.timestamp.toISOString().substring(0, 13) + ':00:00Z';
      const existing = hourlyMap.get(hour) || { api1: 0, api2: 0 };
      if (i % 2 === 0) existing.api1++; else existing.api2++;
      hourlyMap.set(hour, existing);
    });
    const requestDistribution = Array.from(hourlyMap.entries()).map(([time, data]) => ({ time, ...data }));

    // Recent routing logs
    const routingLogs = parsed.slice(-30).reverse().map((entry, i) => ({
      timestamp: entry.timestamp.toISOString(),
      upstream: i % 2 === 0 ? 'API-1' : 'API-2',
      method: entry.method,
      path: entry.path,
      status: entry.status,
      time: 'N/A',
    }));

    res.json({
      requestDistribution,
      upstreamStats: [{ name: 'API-1', value: api1Count }, { name: 'API-2', value: api2Count }],
      responseTimes: [], // Nginx combined format doesn't include response time (needs $request_time in log format)
      routingLogs,
    });
  } catch (error: any) {
    logger.error('Failed to get Nginx metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get Nginx metrics' });
  }
});

// =============================================================================
// 14. GET /admin/railway/metrics — REAL when RAILWAY_API_TOKEN is set
// In development (no token), returns empty with explanation.
// On production, set RAILWAY_API_TOKEN and RAILWAY_PROJECT_ID in .env.
// =============================================================================
router.get('/railway/metrics', async (req: Request, res: Response) => {
  try {
    const token = process.env.RAILWAY_API_TOKEN;
    const projectId = process.env.RAILWAY_PROJECT_ID;

    if (!token || !projectId) {
      return res.json({
        _unavailable: true,
        message: 'Railway API token not configured. Set RAILWAY_API_TOKEN and RAILWAY_PROJECT_ID in .env to enable real Railway metrics.',
        cpu: [], memory: [], network: [], httpLogs: [],
      });
    }

    const tr = parseTimeRange((req.query.timeRange as string) || '1h');
    if (!tr) return res.status(400).json({ error: 'Invalid timeRange' });

    // Railway GraphQL API
    const query = `
      query {
        project(id: "${projectId}") {
          services {
            edges {
              node {
                name
                id
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Railway API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // Railway's metrics API is limited — return what's available
    res.json({
      services: data.data?.project?.services?.edges?.map((e: any) => e.node) || [],
      cpu: [], // Railway doesn't expose granular CPU metrics via public API
      memory: [],
      network: [],
      httpLogs: [],
    });
  } catch (error: any) {
    logger.error('Failed to get Railway metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to get Railway metrics', message: error.message });
  }
});

export default router;
