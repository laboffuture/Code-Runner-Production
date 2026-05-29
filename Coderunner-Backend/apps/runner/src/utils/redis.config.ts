import { ConnectionOptions } from 'bullmq';
import { getLogger } from '@code-runner/shared';

const logger = getLogger('redis-config');

export function buildRedisConnection(): ConnectionOptions {
  const config: ConnectionOptions = process.env.REDIS_URL
    ? {
        host: new URL(process.env.REDIS_URL).hostname,
        port: parseInt(new URL(process.env.REDIS_URL).port),
        password: new URL(process.env.REDIS_URL).password || undefined,
        maxRetriesPerRequest: null,
        retryStrategy(times: number) {
          const delay = Math.min(times * 500, 10000);
          logger.warn(`Redis reconnecting (attempt ${times}), next retry in ${delay}ms`);
          return delay;
        },
        connectTimeout: 10000,
        enableReadyCheck: true,
      }
    : {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        retryStrategy(times: number) {
          const delay = Math.min(times * 500, 10000);
          logger.warn(`Redis reconnecting (attempt ${times}), next retry in ${delay}ms`);
          return delay;
        },
        connectTimeout: 10000,
        enableReadyCheck: true,
      };

  logger.info('Redis connection configured', {
    source: process.env.REDIS_URL ? 'REDIS_URL' : 'REDIS_HOST/PORT',
    host: config.host,
    port: config.port,
  });

  return config;
}
