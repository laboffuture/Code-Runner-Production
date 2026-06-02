import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Models, CodeExecutionJobData, SubmissionJobData, isProblemUnlocked, UnlockProblem } from '@code-runner/shared';
import { optionalAuthMiddleware, authMiddleware, developerMiddleware } from '../middleware/auth.middleware';
import { executionLimiter, dailyExecutionLimiter } from '../middleware/rateLimit.middleware';
import { codeExecutionQueue, codeSubmissionQueue } from '../queue/queue.config';
import { unescapeString } from '../utils/unescape';

const router = Router();

// Queue backpressure settings
const MAX_QUEUE_DEPTH = parseInt(process.env.MAX_QUEUE_DEPTH || '200');

/**
 * POST /execution/submit
 * Submit code for execution (returns jobId immediately)
 */
router.post('/submit', optionalAuthMiddleware, executionLimiter, dailyExecutionLimiter, async (req: Request, res: Response) => {
  try {
    const { code, input, problemId, userSessionId } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Code is required and must be a string',
      });
    }

    if (code.length > 50000) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Code is too long (max 50,000 characters)',
      });
    }

    // Check queue depth (backpressure) - reject if system is overloaded
    const jobCounts = await codeExecutionQueue.getJobCounts();
    const queueDepth = jobCounts.waiting + jobCounts.active;

    if (queueDepth >= MAX_QUEUE_DEPTH) {
      return res.status(503).json({
        error: 'System Busy',
        message: 'System is currently overloaded. Please try again in a few seconds.',
        queueDepth,
        estimatedWait: `${Math.ceil(queueDepth / 10)} seconds`,
      });
    }

    // Generate unique job ID
    const jobId = uuidv4();

    // Get user ID (or use 'anonymous')
    const userId = req.user?.userId || 'anonymous';

    // Create job data
    const jobData: CodeExecutionJobData = {
      jobId,
      userId,
      code,
      input: String(input ?? ''), // Pass user input for stdin (coerce to string)
      language: 'python',
      problemId,
      userSessionId,
      timestamp: Date.now(),
    };

    // Save initial job status to database FIRST (before queue add)
    // This prevents a race condition where the worker picks up the job
    // and tries to update a document that doesn't exist yet
    await Models.ExecutionResult.create({
      jobId,
      userId,
      problemId,
      code,
      status: 'pending',
      createdAt: new Date(),
    });

    // Add job to queue AFTER DB record exists
    await codeExecutionQueue.add('execute-code', jobData, {
      jobId, // Use our UUID as job ID
    });

    // Return job ID immediately
    res.json({
      jobId,
      status: 'queued',
      message: 'Code submitted for execution',
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

/**
 * GET /execution/result/:jobId
 * Get execution result by job ID (polling endpoint)
 */
router.get('/result/:jobId', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // Fetch result from database
    const result = await Models.ExecutionResult.findOne({ jobId });

    if (!result) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
    }

    // Ownership check (close IDOR): if this result belongs to a real user,
    // only that user (or an admin) may read it — a random jobId must not
    // expose another student's submitted code. Anonymous results have no
    // owner, so they stay readable to keep the unauthenticated poll flow working.
    if (result.userId && result.userId !== 'anonymous') {
      if (!req.user || (req.user.userId !== result.userId && req.user.role !== 'developer')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have access to this result',
        });
      }
    }

    // Return result
    res.json({
      jobId: result.jobId,
      status: result.status,
      result: result.result,
      submissionResult: result.submissionResult,
      error: result.error,
      createdAt: result.createdAt,
      completedAt: result.completedAt,
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

/**
 * POST /execution/submit/grade
 * Submit code for grading (runs against all test cases)
 */
// Grading is tied to a user (it writes progress/stats), so it requires auth.
// Anonymous grading would silently lose progress, so reject it with 401.
router.post('/submit/grade', authMiddleware, executionLimiter, dailyExecutionLimiter, async (req: Request, res: Response) => {
  try {
    const { code, problemId, contestId, metrics } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Code is required',
      });
    }

    if (!problemId || typeof problemId !== 'number') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Problem ID is required',
      });
    }

    // Check queue depth (backpressure) - reject if system is overloaded
    const jobCounts = await codeSubmissionQueue.getJobCounts();
    const queueDepth = jobCounts.waiting + jobCounts.active;

    if (queueDepth >= MAX_QUEUE_DEPTH) {
      return res.status(503).json({
        error: 'System Busy',
        message: 'Grading system is currently overloaded. Please try again in a few seconds.',
        queueDepth,
        estimatedWait: `${Math.ceil(queueDepth / 10)} seconds`,
      });
    }

    // Verify problem exists
    const problem = await Models.Problem.findOne({ problem_id: problemId });
    if (!problem) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Problem not found',
      });
    }

    // Is this a LEGITIMATE contest submission? Only a real, currently-active
    // contest that actually contains this problem is exempt from sequential
    // gating — NOT the mere presence of a client-supplied `contestId`. Without
    // this check a student could pass any string to skip the gate and still earn
    // a normal curriculum solve (the worker records progress regardless).
    let isContestSubmission = false;
    if (contestId && mongoose.Types.ObjectId.isValid(contestId)) {
      const contest = await Models.Contest.findById(contestId)
        .select('startTime endTime problems')
        .lean<{ startTime: Date; endTime: Date; problems: Array<{ problemId: number }> } | null>();
      if (contest) {
        const now = Date.now();
        const active =
          now >= new Date(contest.startTime).getTime() &&
          now <= new Date(contest.endTime).getTime();
        const inContest = (contest.problems || []).some((p) => p.problemId === problemId);
        isContestSubmission = active && inContest;
      }
    }

    // Sequential progression: a curriculum problem can only be GRADED once every
    // problem in all prior sessions is solved. Genuine contest submissions are
    // exempt. Skip if the problem has no age band (can't scope the curriculum).
    if (!isContestSubmission && problem.age_group) {
      const userId = req.user!.userId;
      const up = await Models.UserProgress.findOne({ userId })
        .select('solvedProblemIds')
        .lean<{ solvedProblemIds?: number[] } | null>();
      const solved: number[] = up?.solvedProblemIds || [];
      const curriculum = await Models.Problem.find(
        { age_group: problem.age_group }, 'problem_id level_number session_id',
      ).lean<UnlockProblem[]>();
      if (!isProblemUnlocked(problemId, solved, curriculum)) {
        return res.status(403).json({
          error: 'Locked',
          message: 'Complete the previous session to unlock this one.',
        });
      }
    } else if (!isContestSubmission && !problem.age_group) {
      // Fail-open is intentional (can't scope the curriculum without a band) but
      // a curriculum problem missing age_group is a seeding regression — make the
      // waived gate observable instead of silently ungating.
      console.warn(`[grade] sequential gate skipped: problem ${problemId} has no age_group`);
    }

    // Get all test cases (including hidden ones)
    const testCases = await Models.TestCase.find({ problem_id: problemId });

    if (testCases.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No test cases found for this problem',
      });
    }

    // Generate unique job ID
    const jobId = uuidv4();
    const userId = req.user!.userId; // guaranteed by authMiddleware above

    // Create submission job data
    const jobData: SubmissionJobData = {
      jobId,
      userId,
      code,
      problemId,
      testCases: testCases.map((tc) => ({
        input: unescapeString(tc.input),
        expected_output: unescapeString(tc.expected_output),
        is_hidden: tc.is_hidden,
      })),
      timestamp: Date.now(),
      ...(contestId && typeof contestId === 'string' ? { contestId } : {}),
      ...(metrics && typeof metrics === 'object' ? { metrics } : {}),
    };

    // Save initial status FIRST (before queue add) to prevent race condition
    await Models.ExecutionResult.create({
      jobId,
      userId,
      problemId,
      code,
      status: 'pending',
      createdAt: new Date(),
    });

    // Add job to submission queue AFTER DB record exists
    await codeSubmissionQueue.add('grade-submission', jobData, {
      jobId,
    });

    res.json({
      jobId,
      status: 'queued',
      message: 'Code submitted for grading',
      testCaseCount: testCases.length,
    });
  } catch (error) {
    console.error('Error submitting for grading:', error);
    res.status(500).json({ error: 'Failed to submit code for grading' });
  }
});

/**
 * GET /execution/queue/stats
 * Get queue statistics (for monitoring) — developer (infra) role only, since it
 * exposes queue depth/backlog that shouldn't be readable by anonymous callers.
 */
router.get('/queue/stats', authMiddleware, developerMiddleware, async (req: Request, res: Response) => {
  try {
    const [executionCounts, submissionCounts] = await Promise.all([
      codeExecutionQueue.getJobCounts(),
      codeSubmissionQueue.getJobCounts(),
    ]);

    res.json({
      execution: executionCounts,
      submission: submissionCounts,
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({ error: 'Failed to fetch queue statistics' });
  }
});

export default router;
