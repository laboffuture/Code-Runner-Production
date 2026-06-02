import { Router, Request, Response } from 'express';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rateLimit.middleware';
import mongoose from 'mongoose';

const router = Router();
const logger = getLogger('progress-routes');

router.use(apiLimiter);

/**
 * GET /progress?userId=<id>
 * Returns the user's solved problem IDs, topic progress, and level info
 * from the UserProgress collection.
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Use the authenticated user's id from the JWT — never a client-supplied
    // userId — so a student cannot read another student's progress (IDOR fix).
    const userId = req.user!.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid userId' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const progress = await Models.UserProgress.findOne({ userId: userObjectId });

    if (!progress) {
      return res.json({
        userId,
        solvedProblemIds: [],
        completedSessions: [],
        topicProgress: [],
        stats: { totalSolved: 0, totalSubmissions: 0, acceptanceRate: 0 },
        level: 1,
        experience: 0,
        streak: { current: 0, longest: 0 },
        last_activity: null,
      });
    }

    // Derive completed sessions: sessions where solved count equals total
    const completedSessions = progress.topicProgress
      .filter((t: any) => t.total > 0 && t.solved >= t.total)
      .map((t: any) => t.topic);

    res.json({
      userId,
      solvedProblemIds: progress.solvedProblemIds || [],
      completedSessions,
      topicProgress: progress.topicProgress.map((t: any) => ({
        topic: t.topic,
        solved: t.solved,
        total: t.total,
        percentage: t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0,
      })),
      stats: progress.stats,
      level: progress.level,
      experience: progress.experience,
      streak: progress.streak,
      last_activity: progress.recentActivity[0]?.timestamp || null,
    });
  } catch (error) {
    logger.error('Error fetching progress', { error });
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// NOTE: a `POST /progress/complete` route used to live here. It wrote
// solvedProblemIds directly ($addToSet) with no grading and no unlock check, so
// any authenticated student could forge solves via direct HTTP — which would
// also defeat the sequential-unlock gate (it reads exactly this array). It was
// dead from the UI (no caller) and only duplicated what the grading worker does
// authoritatively, so it was removed. The grading worker is the single writer of
// solvedProblemIds.

export default router;
