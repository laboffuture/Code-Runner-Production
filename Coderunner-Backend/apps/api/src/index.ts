// IMPORTANT: Load environment variables FIRST, before any other imports
// This ensures REDIS_URL and other env vars are available when modules load
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Try multiple possible paths for .env.local
const possiblePaths = [
  path.resolve(__dirname, '../.env.local'),          // From dist folder
  path.resolve(__dirname, '../../.env.local'),       // From src folder (tsx)
  path.resolve(process.cwd(), '.env.local'),         // From current directory
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (existsSync(envPath)) {
    // Note: console.log used here because logger not yet initialized
    console.log('Loading .env.local from:', envPath);
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log('✅ Loaded .env.local');
      envLoaded = true;
      break;
    }
  }
}

if (!envLoaded) {
  console.log('⚠️  No .env.local found, trying default .env');
}

// Load .env as fallback
dotenv.config();

// Pin Node's own DNS resolver to reliable public servers before anything does
// a lookup. The mongodb+srv:// URI needs a DNS SRV query to find the Atlas
// cluster; some networks' configured DNS server handles ordinary A/AAAA
// lookups fine but intermittently fails (ESERVFAIL) on the less-common SRV
// record type, even though the OS's own resolver succeeds via its own
// fallback/retry logic that Node's resolver doesn't replicate. This only
// affects this Node process's own lookups, not the OS/system DNS config.
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectToDatabase, validateEnv, getLogger } from '@code-runner/shared';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Initialize logger
const logger = getLogger('api');

// Validate environment variables at startup (fail fast if misconfigured)
validateEnv('api');

// Import routes
import problemsRoutes from './routes/problems.routes';
import levelsRoutes from './routes/levels.routes';
import sessionsRoutes from './routes/sessions.routes';
import executionRoutes from './routes/execution.routes';
import filesRoutes from './routes/files.routes';
import progressRoutes from './routes/progress.routes';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import cheatsheetsRoutes from './routes/cheatsheets.routes';
import adminRoutes from './routes/admin.routes';
import mongodbRoutes from './routes/mongodb.routes';
import cloudinaryRoutes from './routes/cloudinary.routes';
import contestsRoutes from './routes/contests.routes';
import teacherRoutes from './routes/teacher.routes';
import storeRoutes from './routes/store.routes';
import adminStoreRoutes from './routes/admin-store.routes';
import curriculumRoutes from './routes/curriculum.routes';
import ticketsRoutes from './routes/tickets.routes';
import oversightRoutes from './routes/oversight.routes';
import { authMiddleware, developerMiddleware } from './middleware/auth.middleware';

// Import Redis and queue initializer (AFTER dotenv is loaded)
import { redis, initializeQueues } from './queue/queue.config';

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Trust the reverse proxy (Nginx) in front of the API so express-rate-limit can
// read the real client IP from X-Forwarded-For. Trust a fixed NUMBER of hops, not
// `true`: `true` trusts a fully client-settable XFF header, letting anyone spoof
// req.ip to bypass the per-IP rate limits or poison logs. Default 1 (single Nginx
// hop); set TRUST_PROXY_HOPS=2 if another proxy (e.g. Cloudflare) sits in front.
const trustProxyHops = parseInt(process.env.TRUST_PROXY_HOPS || '1', 10);
app.set('trust proxy', Number.isNaN(trustProxyHops) ? 1 : trustProxyHops);

// Force cache bust for Railway deployment
const BUILD_ID = '20260119-1';

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - support multiple origins
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

const isDev = process.env.NODE_ENV !== 'production';

logger.info('CORS configuration loaded', { origins: corsOrigins, isDev });

// In development: accept any localhost or LAN IP so other devices on the same
// network can connect (e.g. a student's tablet at 192.168.x.x:3000).
// In production: restrict to the explicitly configured origins only.
const corsOriginHandler = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // No origin = same-origin request (curl, mobile apps, Postman) — allow
  if (!origin) return callback(null, true);

  // Always allow explicitly listed origins
  if (corsOrigins.includes(origin)) return callback(null, true);

  if (isDev) {
    // Allow any localhost / 127.0.0.1 port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    // Allow any private LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (/^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
  }

  callback(new Error(`CORS: origin ${origin} not allowed`));
};

app.use(cors({
  origin: corsOriginHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Morgan HTTP logging with Winston stream
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    },
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'code-runner-api',
  });
});

// Redis health check endpoint
app.get('/health/redis', async (req, res) => {
  try {
    // Test Redis connection
    await redis.ping();

    // Get Redis info
    const redisStatus = redis.status;

    res.json({
      status: 'healthy',
      redis: {
        connected: redisStatus === 'ready',
        status: redisStatus,
        host: redis.options.host || 'unknown',
        port: redis.options.port || 'unknown',
      },
      environment: {
        REDIS_URL: process.env.REDIS_URL ? '✅ Set' : '❌ Not set',
        REDIS_HOST: process.env.REDIS_HOST || 'not set',
        REDIS_PORT: process.env.REDIS_PORT || 'not set',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      redis: {
        connected: false,
        status: redis.status,
      },
      environment: {
        REDIS_URL: process.env.REDIS_URL ? '✅ Set' : '❌ Not set',
        REDIS_HOST: process.env.REDIS_HOST || 'not set',
        REDIS_PORT: process.env.REDIS_PORT || 'not set',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Comprehensive metrics endpoint for monitoring — exposes queue depth and
// failure counts, so it's gated to the developer (infra) role. The basic
// `/health` liveness endpoint above stays open for load-balancer/uptime checks.
app.get('/health/metrics', authMiddleware, developerMiddleware, async (req, res) => {
  try {
    // Get queue stats from Redis
    const executionWaiting = await redis.llen('bull:code-execution:wait');
    const executionActive = await redis.llen('bull:code-execution:active');
    const executionCompleted = await redis.zcard('bull:code-execution:completed');
    const executionFailed = await redis.zcard('bull:code-execution:failed');

    const submissionWaiting = await redis.llen('bull:code-submission:wait');
    const submissionActive = await redis.llen('bull:code-submission:active');
    const submissionCompleted = await redis.zcard('bull:code-submission:completed');
    const submissionFailed = await redis.zcard('bull:code-submission:failed');

    // Calculate health status
    const queueTotal = executionWaiting + executionActive + submissionWaiting + submissionActive;
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (queueTotal > 100) {
      healthStatus = 'critical';
    } else if (queueTotal > 50) {
      healthStatus = 'warning';
    }

    res.json({
      status: healthStatus,
      timestamp: new Date().toISOString(),
      queues: {
        execution: {
          waiting: executionWaiting,
          active: executionActive,
          completed: executionCompleted,
          failed: executionFailed,
          total: executionWaiting + executionActive,
        },
        submission: {
          waiting: submissionWaiting,
          active: submissionActive,
          completed: submissionCompleted,
          failed: submissionFailed,
          total: submissionWaiting + submissionActive,
        },
      },
      thresholds: {
        warning: 50,
        critical: 100,
        current: queueTotal,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Interactive pygame builds (Pygbag/WASM output) — written by the runner,
// served here since it's the public-facing process. Shared filesystem path;
// both processes run on the same host today (local dev and the production
// VPS alike), see PYGAME_BUILD_DIR in docker.executor.ts.
const pygameBuildDir = process.env.PYGAME_BUILD_DIR || path.resolve(__dirname, '../../../.pygame-builds');
app.use('/pygame-builds', express.static(pygameBuildDir));

// API Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/problems', problemsRoutes);
app.use('/levels', levelsRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/execution', executionRoutes); // New queue-based execution
app.use('/files', filesRoutes); // Per-student file-handling workspace
app.use('/progress', progressRoutes);
app.use('/cheatsheets', cheatsheetsRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/mongodb', mongodbRoutes);
app.use('/admin/cloudinary', cloudinaryRoutes);
app.use('/contests', contestsRoutes);
app.use('/teacher', teacherRoutes);
app.use('/store', storeRoutes);
app.use('/admin/store', adminStoreRoutes);
app.use('/curriculum', curriculumRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/oversight', oversightRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Store server instance for graceful shutdown
let server: any;

// Start server
async function startServer() {
  try {
    // Initialize queues and wait for Redis to be ready (must be called after dotenv.config())
    logger.info('Initializing queues...');
    await initializeQueues();
    logger.info('Queues initialized');

    // Connect to MongoDB with timeout
    logger.info('Connecting to MongoDB', {
      uri: process.env.MONGODB_URI?.substring(0, 70) + '...',
    });

    const mongoTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000);
    });

    await Promise.race([connectToDatabase(), mongoTimeout]);
    logger.info('Connected to MongoDB successfully');

    // Start Express server - this is critical, must succeed
    server = app.listen(PORT, () => {
      logger.info('🚀 API server started on port ' + PORT, {
        port: PORT,
        healthCheck: `http://localhost:${PORT}/health`,
        environment: process.env.NODE_ENV || 'development',
      });
      console.log(`\n🚀 API server started on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Don't exit on MongoDB timeout - server can still work for some routes
    if (error instanceof Error && error.message.includes('MongoDB connection timeout')) {
      logger.warn('Starting API server anyway - MongoDB will retry connection');
      server = app.listen(PORT, () => {
        logger.info('🚀 API server started on port ' + PORT + ' (MongoDB pending)', {
          port: PORT,
          healthCheck: `http://localhost:${PORT}/health`,
          environment: process.env.NODE_ENV || 'development',
        });
        console.log(`\n🚀 API server started on port ${PORT} (MongoDB will retry)\n`);
      });
    } else {
      process.exit(1);
    }
  }
}

// Graceful shutdown
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  logger.info('Received shutdown signal', { signal });

  try {
    // Stop accepting new connections
    if (server) {
      logger.info('Closing HTTP server (finishing current requests)...');
      await new Promise<void>((resolve, reject) => {
        server.close((err: Error | undefined) => {
          if (err) reject(err);
          else resolve();
        });
      });
      logger.info('HTTP server closed');
    }

    // Close Redis connection
    if (redis) {
      logger.info('Closing Redis connection...');
      await redis.quit();
      logger.info('Redis connection closed');
    }

    // Close MongoDB connection
    const mongoose = await import('mongoose');
    if (mongoose.connection.readyState !== 0) {
      logger.info('Closing MongoDB connection...');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }

    logger.info('API service shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled rejections - log only, don't exit
// A transient Redis/DB error should not kill the API server
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection (continuing)', {
    reason: String(reason),
    promise: String(promise),
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  shutdown('uncaughtException');
});

// Start the server
startServer();

export default app;