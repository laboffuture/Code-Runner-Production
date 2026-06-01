// PM2 Configuration for VPS Deployment
// This runs multiple API and Runner instances for high availability

const path = require('path');
const PROJECT_ROOT = '/var/www/code-runner';

module.exports = {
  apps: [
    // API Instances (fork mode + Nginx load balancing across separate ports)
    // For Cloudflare Tunnel (single port), switch to: exec_mode: 'cluster', instances: 2
    {
      name: 'api-1',
      script: './dist/index.js',
      cwd: path.join(PROJECT_ROOT, 'apps/api'),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: path.join(PROJECT_ROOT, 'logs/api-1-error.log'),
      out_file: path.join(PROJECT_ROOT, 'logs/api-1-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M',
      kill_timeout: 10000,
    },
    {
      name: 'api-2',
      script: './dist/index.js',
      cwd: path.join(PROJECT_ROOT, 'apps/api'),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
      },
      error_file: path.join(PROJECT_ROOT, 'logs/api-2-error.log'),
      out_file: path.join(PROJECT_ROOT, 'logs/api-2-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M',
      kill_timeout: 10000,
    },

    // Runner Instances (2 instances for load distribution)
    {
      name: 'runner-1',
      script: './dist/index.js',
      cwd: path.join(PROJECT_ROOT, 'apps/runner'),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        // Unique, restart-stable id for THIS runner. Namespaces its Docker pool
        // containers (pool-i1-*) so it never reaps runner-2's live pool. Required
        // because separate fork-mode apps both get NODE_APP_INSTANCE=0.
        RUNNER_INSTANCE_ID: '1',
        // Container pool configuration
        ENABLE_CONTAINER_POOL: 'true',
        POOL_MIN_SIZE: 2,
        POOL_MAX_SIZE: 5,
        POOL_MAX_CONTAINER_AGE_MS: 1800000, // 30 minutes
        SANDBOX_IMAGE: 'python-code-runner',
        // Worker concurrency
        WORKER_CONCURRENCY_EXECUTION: 3,
        WORKER_CONCURRENCY_SUBMISSION: 2,
      },
      error_file: path.join(PROJECT_ROOT, 'logs/runner-1-error.log'),
      out_file: path.join(PROJECT_ROOT, 'logs/runner-1-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      kill_timeout: 30000,
    },
    {
      name: 'runner-2',
      script: './dist/index.js',
      cwd: path.join(PROJECT_ROOT, 'apps/runner'),
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        // Unique, restart-stable id for THIS runner. Namespaces its Docker pool
        // containers (pool-i2-*) so it never reaps runner-1's live pool. Required
        // because separate fork-mode apps both get NODE_APP_INSTANCE=0.
        RUNNER_INSTANCE_ID: '2',
        // Container pool configuration
        ENABLE_CONTAINER_POOL: 'true',
        POOL_MIN_SIZE: 2,
        POOL_MAX_SIZE: 5,
        POOL_MAX_CONTAINER_AGE_MS: 1800000, // 30 minutes
        SANDBOX_IMAGE: 'python-code-runner',
        // Worker concurrency
        WORKER_CONCURRENCY_EXECUTION: 3,
        WORKER_CONCURRENCY_SUBMISSION: 2,
      },
      error_file: path.join(PROJECT_ROOT, 'logs/runner-2-error.log'),
      out_file: path.join(PROJECT_ROOT, 'logs/runner-2-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      kill_timeout: 30000,
    },
  ],
};
