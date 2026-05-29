import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

// ---------------------------------------------------------------------------
// Shared Redis client for rate limiting
// All PM2 instances connect to the same Redis so counters are truly shared.
// If Redis is unavailable the store rejects each sendCommand call and
// express-rate-limit fails open (no limiting) so the app never crashes.
// ---------------------------------------------------------------------------
const redisConfig = process.env.REDIS_URL
  ? {
      host: new URL(process.env.REDIS_URL).hostname,
      port: parseInt(new URL(process.env.REDIS_URL).port || '6379'),
      password: new URL(process.env.REDIS_URL).password || undefined,
    }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    };

const rateLimitRedis = new Redis({
  ...redisConfig,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  lazyConnect: true,
});

// Suppress unhandled connection errors — fail-open is intentional
rateLimitRedis.on('error', () => {});

const sharedStore = new RedisStore({
  sendCommand: (...args: string[]) =>
    rateLimitRedis.call(args[0], ...args.slice(1)) as any,
  prefix: 'rl:',
});

// ---------------------------------------------------------------------------
// Limiters
// ---------------------------------------------------------------------------

/** General API — 100 req / min per IP */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  store: sharedStore,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Code execution — 10 runs / min per user */
export const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  store: sharedStore,
  message: {
    error: 'Too Many Executions',
    message: 'Too many code executions. Please wait before running more code.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `exec:${(req as any).user?.userId || req.ip || 'anonymous'}`,
});

/** Daily execution — 500 runs / 24 h per user */
export const dailyExecutionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: parseInt(process.env.DAILY_EXECUTION_LIMIT || '500'),
  store: sharedStore,
  message: {
    error: 'Daily Limit Reached',
    message: 'Daily execution limit reached. Try again tomorrow.',
    retryAfter: 86400,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `daily:${(req as any).user?.userId || req.ip || 'anonymous'}`,
});

/** Auth brute-force — 10 attempts / 15 min per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: sharedStore,
  message: {
    error: 'Too Many Authentication Attempts',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});
