import { Queue, QueueOptions } from 'bullmq';
import Redis from 'ioredis';

// No dotenv loading here — index.ts loads env vars before importing this module

// Lazy initialization - these will be set when initializeQueues() is called
export let redis: Redis;
export let codeExecutionQueue: Queue;
export let codeSubmissionQueue: Queue;

let initialized = false;

function buildRedisConfig() {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port),
      password: url.password || undefined,
    };
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

// Initialize queues - call this AFTER dotenv.config() has run
export async function initializeQueues() {
  if (initialized) {
    return;
  }

  console.log('Redis Environment Variables Check:');
  console.log('  REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
  console.log('  REDIS_HOST:', process.env.REDIS_HOST || 'not set');
  console.log('  REDIS_PORT:', process.env.REDIS_PORT || 'not set');

  const redisConfig = buildRedisConfig();

  console.log('Redis Connection:', `${redisConfig.host}:${redisConfig.port}`);

  // Create standalone Redis connection with retry strategy
  redis = new Redis({
    ...redisConfig,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 500, 10000); // 500ms, 1s, 1.5s ... max 10s
      console.log(`Redis reconnecting (attempt ${times}), next retry in ${delay}ms`);
      return delay;
    },
    reconnectOnError(err) {
      // Reconnect on READONLY errors (Redis failover)
      return err.message.includes('READONLY');
    },
    connectTimeout: 10000,
    enableReadyCheck: true,
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });

  // Wait for Redis to be ready before creating queues (with timeout)
  if (redis.status !== 'ready') {
    console.log('Waiting for Redis to be ready...');
    await Promise.race([
      new Promise<void>((resolve) => {
        redis.once('ready', resolve);
      }),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('⚠️  Redis ready timeout - continuing anyway (will auto-reconnect)');
          resolve();
        }, 5000); // 5 second timeout
      })
    ]);
  }

  console.log('Redis status:', redis.status);

  // Queue options - use shared Redis connection to prevent duplicate connections
  const queueOptions: QueueOptions = {
    connection: redis,
    defaultJobOptions: {
      attempts: 3, // Retry failed jobs 3 times
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2 second delay
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
        count: 500, // Keep last 500 failed jobs
      },
    },
  };

  // Create queues
  codeExecutionQueue = new Queue('code-execution', queueOptions);
  codeSubmissionQueue = new Queue('code-submission', queueOptions);

  // Log queue events
  codeExecutionQueue.on('error', (error) => {
    console.error('Code Execution Queue Error:', error);
  });

  codeSubmissionQueue.on('error', (error) => {
    console.error('Code Submission Queue Error:', error);
  });

  console.log('Queues initialized');
  initialized = true;
}
