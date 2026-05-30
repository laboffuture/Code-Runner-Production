import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { SubmissionJobData, Models, getLogger } from '@code-runner/shared';
import { DockerExecutor } from '../executors/docker.executor';
import { buildRedisConnection } from '../utils/redis.config';

const logger = getLogger('code-submission-worker');

export class CodeSubmissionWorker {
  private worker: Worker;

  constructor() {
    logger.info('Initializing CodeSubmissionWorker');

    const redisConnection = buildRedisConnection();

    this.worker = new Worker(
      'code-submission',
      async (job: Job<SubmissionJobData>) => {
        return await this.processJob(job);
      },
      {
        connection: redisConnection,
        concurrency: 3, // Lower concurrency for grading (more resource intensive)
        limiter: {
          max: 5, // Max 5 grading jobs
          duration: 1000, // per 1 second
        },
      }
    );

    this.setupEventHandlers();
  }

  private async processJob(job: Job<SubmissionJobData>): Promise<void> {
    logger.info('Processing grading job', {
      jobId: job.data.jobId,
      problemId: job.data.problemId,
      userId: job.data.userId,
      testCaseCount: job.data.testCases.length,
    });

    try {
      // Update status to processing
      await Models.ExecutionResult.updateOne(
        { jobId: job.data.jobId },
        { status: 'processing' }
      );

      // Execute code against all test cases
      const testResults = await DockerExecutor.executeWithTestCases(
        job.data.code,
        job.data.testCases
      );

      // Calculate pass rate
      const totalTests = testResults.results.length;
      const passRate = totalTests > 0 ? (testResults.passed / totalTests) * 100 : 0;
      const allPassed = testResults.passed === totalTests;

      // Determine submission status
      let submissionStatus: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Error';
      if (allPassed) {
        submissionStatus = 'Accepted';
      } else if (testResults.results.some(r => r.error?.includes('timed out'))) {
        submissionStatus = 'Time Limit Exceeded';
      } else if (testResults.results.some(r => r.error)) {
        submissionStatus = 'Error';
      } else {
        submissionStatus = 'Wrong Answer';
      }

      // Save submission result to database
      await Models.ExecutionResult.updateOne(
        { jobId: job.data.jobId },
        {
          status: 'completed',
          submissionResult: {
            status: submissionStatus,
            testResults: testResults.results.map((r, i) => ({
              input: r.input,
              expected_output: r.expected_output,
              actual_output: r.actual_output,
              status: r.status,
              error: r.error,
              is_hidden: job.data.testCases[i]?.is_hidden,
            })),
            passed: testResults.passed,
            failed: testResults.failed,
            total: totalTests,
            passRate,
            allPassed,
            executionTime: testResults.totalExecutionTime,
          },
          completedAt: new Date(),
        }
      );

      logger.info('Grading job completed', {
        jobId: job.data.jobId,
        status: submissionStatus,
        passed: testResults.passed,
        total: totalTests,
        passRate: passRate.toFixed(1),
        allPassed,
        executionTime: testResults.totalExecutionTime,
      });

      // Update user progress after submission
      const firstSolve = await this.updateUserProgress(
        job.data.userId,
        job.data.problemId,
        allPassed,
        submissionStatus
      );

      // Record the attempt (with behavioural flags) for the integrity engine.
      await this.recordAttempt(job, allPassed, submissionStatus, firstSolve);

      // Record contest result if this is a contest submission
      if (job.data.contestId) {
        await this.recordContestResult(
          job.data.contestId,
          job.data.userId,
          job.data.problemId,
          allPassed,
          testResults.totalExecutionTime
        );
      }

      // Log success if all tests passed
      if (allPassed) {
        logger.info('All tests passed!', {
          userId: job.data.userId,
          problemId: job.data.problemId,
        });
      }

    } catch (error) {
      logger.error('Grading job failed', {
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

  /**
   * Update user progress after a submission
   */
  private async updateUserProgress(
    userId: string,
    problemId: number,
    accepted: boolean,
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Error'
  ): Promise<boolean> {
    try {
      // Progress is only tracked for authenticated users. A missing/invalid
      // userId (e.g. 'anonymous') would otherwise throw a CastError that gets
      // swallowed below, silently losing the update. Skip cleanly instead.
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        logger.info('Skipping progress update for non-authenticated submission', { userId, problemId });
        return false;
      }

      // Fetch the problem to get difficulty and title
      const problem = await Models.Problem.findOne({ problem_id: problemId });
      if (!problem) {
        logger.warn('Problem not found for progress update', { problemId });
        return false;
      }

      // Find or create UserProgress
      let userProgress = await Models.UserProgress.findOne({ userId });
      if (!userProgress) {
        userProgress = new Models.UserProgress({
          userId,
          stats: {
            totalSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            acceptanceRate: 0,
          },
          streak: {
            current: 0,
            longest: 0,
            lastSubmissionDate: null,
          },
          experience: 0,
          level: 1,
          contestRating: 1000,
          rank: 'NOVICE',
          achievements: [],
          skills: [],
          recentActivity: [],
          submissionCalendar: [],
          solvedCalendar: [],
          topicProgress: [],
        });
      }

      // Update total submissions
      userProgress.stats.totalSubmissions += 1;

      // Track if this problem was already solved.
      // Primary check: solvedProblemIds (canonical, unbounded list).
      // Fallback: recentActivity for progress docs created before solvedProblemIds was added.
      const alreadySolved =
        (userProgress.solvedProblemIds || []).includes(problemId) ||
        userProgress.recentActivity.some(
          (activity: { problemId: number; status: string }) =>
            activity.problemId === problemId && activity.status === 'ACCEPTED'
        );

      if (accepted) {
        userProgress.stats.acceptedSubmissions += 1;

        // Only increment solved count if this is first time solving this problem
        if (!alreadySolved) {
          userProgress.stats.totalSolved += 1;

          // Persist the solved problem ID so the frontend can sync across devices
          if (!userProgress.solvedProblemIds) userProgress.solvedProblemIds = [];
          userProgress.solvedProblemIds.push(problemId);

          // Increment difficulty-specific counter
          const difficulty = problem.difficulty?.toLowerCase();
          if (difficulty === 'easy' || difficulty === 'intro') {
            userProgress.stats.easySolved += 1;
          } else if (difficulty === 'medium') {
            userProgress.stats.mediumSolved += 1;
          } else if (difficulty === 'hard') {
            userProgress.stats.hardSolved += 1;
          }

          // Award XP based on difficulty
          const xpReward = difficulty === 'hard' ? 200 : difficulty === 'medium' ? 100 : 50;
          userProgress.experience += xpReward;

          // Update streak
          userProgress.updateStreak();

          // Update topic progress based on session
          if (problem.session_title) {
            const totalInSession = await Models.Problem.countDocuments({ session_id: problem.session_id });
            const existingTopic = userProgress.topicProgress.find(
              (t: any) => t.topic === problem.session_title
            );
            if (existingTopic) {
              existingTopic.solved = Math.min(existingTopic.solved + 1, existingTopic.total);
            } else {
              userProgress.topicProgress.push({
                topic: problem.session_title,
                solved: 1,
                total: totalInSession,
              });
            }
          }

          // Ensure Python skill is tracked
          if (!userProgress.skills.includes('Python')) {
            userProgress.skills.push('Python');
          }

          // Update contest rating for first-time accepted
          userProgress.contestRating = Math.min(3000, userProgress.contestRating + 15);

          logger.info('Problem solved for first time', {
            userId,
            problemId,
            difficulty,
            xpAwarded: xpReward,
            newTotalSolved: userProgress.stats.totalSolved,
          });
        }
      } else {
        // Deduct contest rating for failed submissions (min 800)
        userProgress.contestRating = Math.max(800, userProgress.contestRating - 2);
      }

      // Update acceptance rate
      userProgress.updateAcceptanceRate();

      // Update level and rank
      userProgress.updateLevel();
      userProgress.updateRank();

      // Check and award achievements (only on first-time solves)
      if (accepted && !alreadySolved) {
        const newAchievements: string[] = [];
        const s = userProgress.stats;

        if (s.totalSolved === 1 && !userProgress.achievements.includes('first_solve')) {
          newAchievements.push('first_solve');
        }
        for (const n of [5, 10, 25, 50, 100]) {
          const id = `solver_${n}`;
          if (s.totalSolved >= n && !userProgress.achievements.includes(id)) {
            newAchievements.push(id);
          }
        }
        for (const n of [3, 7, 30]) {
          const id = `streak_${n}`;
          if (userProgress.streak.current >= n && !userProgress.achievements.includes(id)) {
            newAchievements.push(id);
          }
        }
        if (s.easySolved >= 10 && !userProgress.achievements.includes('easy_master')) {
          newAchievements.push('easy_master');
        }
        if (s.mediumSolved >= 5 && !userProgress.achievements.includes('medium_master')) {
          newAchievements.push('medium_master');
        }
        if (s.hardSolved >= 3 && !userProgress.achievements.includes('hard_master')) {
          newAchievements.push('hard_master');
        }
        if (newAchievements.length > 0) {
          userProgress.achievements.push(...newAchievements);
          logger.info('Achievements unlocked', { userId, achievements: newAchievements });
        }
      }

      // Add to recent activity (limit to 50 most recent)
      userProgress.recentActivity.unshift({
        problemId,
        problemTitle: problem.title,
        difficulty: problem.difficulty || 'Easy',
        status: accepted ? 'ACCEPTED' : 'FAILED',
        timestamp: new Date(),
      });
      if (userProgress.recentActivity.length > 50) {
        userProgress.recentActivity = userProgress.recentActivity.slice(0, 50);
      }

      // Update submission calendar for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const existingDay = userProgress.submissionCalendar.find(
        (day: { date: Date; count: number }) => new Date(day.date).toISOString().split('T')[0] === todayStr
      );

      if (existingDay) {
        existingDay.count += 1;
      } else {
        userProgress.submissionCalendar.push({
          date: today,
          count: 1,
        });
      }

      // Keep only last 365 days of calendar data
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);
      userProgress.submissionCalendar = userProgress.submissionCalendar.filter(
        (day: { date: Date; count: number }) => new Date(day.date) >= oneYearAgo
      );

      // Update solved calendar — count only DISTINCT first-time solves per day.
      // This is what drives the accurate "solved over time" chart (vs the
      // submission calendar above, which counts every attempt incl. failures).
      if (accepted && !alreadySolved) {
        const existingSolvedDay = userProgress.solvedCalendar.find(
          (day: { date: Date; count: number }) => new Date(day.date).toISOString().split('T')[0] === todayStr
        );
        if (existingSolvedDay) {
          existingSolvedDay.count += 1;
        } else {
          userProgress.solvedCalendar.push({ date: today, count: 1 });
        }
        userProgress.solvedCalendar = userProgress.solvedCalendar.filter(
          (day: { date: Date; count: number }) => new Date(day.date) >= oneYearAgo
        );
      }

      // Save the updated progress
      await userProgress.save();

      logger.info('User progress updated', {
        userId,
        problemId,
        accepted,
        totalSolved: userProgress.stats.totalSolved,
        level: userProgress.level,
        rank: userProgress.rank,
        streak: userProgress.streak.current,
      });

      return accepted && !alreadySolved;
    } catch (error) {
      logger.error('Failed to update user progress', {
        userId,
        problemId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - progress update failure shouldn't fail the submission
      return false;
    }
  }

  /**
   * Record a graded submission into the durable attempt log with behavioural
   * flags for the teacher integrity engine.
   */
  private async recordAttempt(
    job: Job<SubmissionJobData>,
    accepted: boolean,
    status: string,
    firstSolve: boolean
  ): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(job.data.userId)) return;
      const m = job.data.metrics || {};
      const codeLength = m.codeLength ?? job.data.code.length;
      const pasteChars = m.pasteChars ?? 0;

      const flags = {
        // An ACCEPTED solve in seconds, with no testing, or pasted wholesale.
        solvedTooFast: accepted && typeof m.timeOnProblemMs === 'number' && m.timeOnProblemMs < 15000,
        noIteration: accepted && typeof m.runsBeforeSubmit === 'number' && m.runsBeforeSubmit <= 1,
        largePaste: pasteChars >= 60 && (codeLength === 0 || pasteChars / codeLength >= 0.5),
      };

      const student = (await Models.User.findById(job.data.userId).select('classroomId').lean()) as any;

      await Models.StudentAttempt.create({
        userId: new mongoose.Types.ObjectId(job.data.userId),
        problemId: job.data.problemId,
        classroomId: student?.classroomId || null,
        accepted,
        status,
        firstSolve,
        timeOnProblemMs: m.timeOnProblemMs,
        runsBeforeSubmit: m.runsBeforeSubmit,
        pasteCount: m.pasteCount,
        pasteChars: m.pasteChars,
        codeLength,
        flags,
      });
    } catch (error) {
      logger.error('Failed to record student attempt', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Record a submission result into the contest entry for live scoring
   */
  private async recordContestResult(
    contestId: string,
    userId: string,
    problemId: number,
    accepted: boolean,
    _executionTime: number
  ): Promise<void> {
    try {
      const contestObjId = new mongoose.Types.ObjectId(contestId);
      const userObjId = new mongoose.Types.ObjectId(userId);

      // Fetch contest for timing + point values
      const contest = await Models.Contest.findById(contestObjId).lean() as any;
      if (!contest) {
        logger.warn('Contest not found for result recording', { contestId });
        return;
      }

      const now = new Date();
      const timeFromStart = Math.max(0, Math.floor((now.getTime() - new Date(contest.startTime).getTime()) / 1000));

      // Find the problem's base point value in the contest
      const contestProblem = (contest.problems as any[]).find((p: any) => p.problemId === problemId);
      const basePoints: number = contestProblem?.points ?? 100;

      // Load entry (pre-created on registration)
      const entry = await Models.ContestEntry.findOne({ contestId: contestObjId, userId: userObjId });
      if (!entry) {
        logger.warn('ContestEntry not found; user may not be registered', { contestId, userId });
        return;
      }

      // Find or create problem slot
      let slot = (entry.problems as any[]).find((p: any) => p.problemId === problemId);
      if (!slot) {
        (entry.problems as any[]).push({
          problemId,
          accepted: false,
          attempts: 0,
          score: 0,
          timeFromStart: 0,
        });
        slot = entry.problems[entry.problems.length - 1];
      }

      // Always increment attempt count
      slot.attempts += 1;

      // Only award score on first acceptance
      if (accepted && !slot.accepted) {
        slot.accepted = true;
        slot.solvedAt = now;
        slot.timeFromStart = timeFromStart;

        // Score = base * (0.5 + 0.5 * timeDecay) - 10 * wrongAttempts
        const wrongAttempts = slot.attempts - 1;
        const durationSeconds = contest.durationMinutes * 60;
        const timeFrac = Math.min(1, timeFromStart / (durationSeconds * 2));
        const score = Math.max(0, Math.round(
          basePoints * (0.5 + 0.5 * (1 - timeFrac)) - 10 * wrongAttempts
        ));
        slot.score = score;
      }

      // Recalculate totals
      (entry as any).totalScore = (entry.problems as any[]).reduce((sum: number, p: any) => sum + (p.score ?? 0), 0);
      (entry as any).penaltyTime = (entry.problems as any[])
        .filter((p: any) => p.accepted)
        .reduce((sum: number, p: any) => sum + (p.timeFromStart ?? 0), 0);

      await entry.save();

      logger.info('Contest result recorded', { contestId, userId, problemId, accepted, timeFromStart });
    } catch (error) {
      logger.error('Failed to record contest result', {
        contestId, userId, problemId,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw — contest recording failure must not fail the submission
    }
  }

  private setupEventHandlers(): void {
    this.worker.on('completed', (job) => {
      logger.info('Grading job completed successfully', { jobId: job.id });
    });

    this.worker.on('failed', (job, err) => {
      logger.error('Grading job failed', {
        jobId: job?.id,
        error: err.message,
        stack: err.stack,
      });
    });

    this.worker.on('error', (err) => {
      logger.error('Submission worker error', {
        error: err.message,
        stack: err.stack,
      });
    });
  }

  async close(): Promise<void> {
    await this.worker.close();
  }
}
