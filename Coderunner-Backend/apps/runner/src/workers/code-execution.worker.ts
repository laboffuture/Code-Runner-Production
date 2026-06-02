import { Worker, Job } from 'bullmq';
import { CodeExecutionJobData, Models, getLogger } from '@code-runner/shared';
import { DockerExecutor } from '../executors/docker.executor';
import { buildRedisConnection } from '../utils/redis.config';

const logger = getLogger('code-execution-worker');

export class CodeExecutionWorker {
  private worker: Worker;

  constructor() {
    logger.info('Initializing CodeExecutionWorker');

    const redisConnection = buildRedisConnection();

    this.worker = new Worker(
      'code-execution',
      async (job: Job<CodeExecutionJobData>) => {
        return await this.processJob(job);
      },
      {
        connection: redisConnection,
        concurrency: 5, // Process 5 jobs concurrently
        limiter: {
          max: 10, // Max 10 jobs
          duration: 1000, // per 1 second
        },
      }
    );

    this.setupEventHandlers();
  }

  private async processJob(job: Job<CodeExecutionJobData>): Promise<void> {
    logger.info('Processing code execution job', { jobId: job.data.jobId });

    try {
      // Update status to processing
      await Models.ExecutionResult.updateOne(
        { jobId: job.data.jobId },
        { status: 'processing' }
      );

      // Execute code using Docker (with user input if provided)
      const result = await DockerExecutor.executeCode(
        job.data.code,
        job.data.input || '' // Pass user input for stdin
      );

      // Save result to database (including files if any)
      await Models.ExecutionResult.updateOne(
        { jobId: job.data.jobId },
        {
          status: 'completed',
          result: {
            stdout: result.stdout,
            stderr: result.stderr,
            status: result.status,
            executionTime: result.executionTime,
            exitCode: result.exitCode,
            // Include generated files (images, etc.)
            files: result.files,
          },
          completedAt: new Date(),
        }
      );

      logger.info('Code execution job completed', {
        jobId: job.data.jobId,
        status: result.status,
        executionTime: result.executionTime,
        filesCount: result.files?.length || 0,
      });

      // G3: durably count a failed Run so teachers can see a student's practice struggle.
      // The ExecutionResult above is already saved — this is fire-and-forget: a stats write
      // must never fail or slow a run. Atomic $inc bypasses optimistic-concurrency versioning,
      // so a failed run racing a grade can't conflict. Only logged-in students on a curriculum
      // problem count (anonymous / no-problemId runs are unattributable; problemId 0 is allowed).
      // Best-effort, at-most-once: the UserProgress doc is created up-front at registration
      // (auth.routes.ts), so this non-upsert update matches it; in the rare case it is missing
      // the increment is harmlessly skipped rather than creating a partial doc.
      if (
        (result.status === 'Error' || result.status === 'Timeout') &&
        job.data.userId &&
        job.data.userId !== 'anonymous' &&
        job.data.problemId != null
      ) {
        try {
          await Models.UserProgress.updateOne(
            { userId: job.data.userId },
            { $inc: { 'stats.failedRuns': 1 } }
          );
        } catch (statsError) {
          logger.warn('Failed to increment failedRuns stat', {
            jobId: job.data.jobId,
            userId: job.data.userId,
            error: statsError instanceof Error ? statsError.message : String(statsError),
          });
        }
      }

    } catch (error) {
      logger.error('Code execution job failed', {
        jobId: job.data.jobId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Save error to database
      await Models.ExecutionResult.updateOne(
        { jobId: job.data.jobId },
        {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        }
      );

      throw error; // Re-throw for BullMQ retry logic
    }
  }

  private setupEventHandlers(): void {
    this.worker.on('completed', (job) => {
      logger.info('Job completed successfully', { jobId: job.id });
    });

    this.worker.on('failed', (job, err) => {
      logger.error('Job failed', {
        jobId: job?.id,
        error: err.message,
        stack: err.stack,
      });
    });

    this.worker.on('error', (err) => {
      logger.error('Worker error', {
        error: err.message,
        stack: err.stack,
      });
    });
  }

  async close(): Promise<void> {
    await this.worker.close();
  }
}
