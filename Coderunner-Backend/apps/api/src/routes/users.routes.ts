import { Router, Request, Response } from 'express';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const logger = getLogger('users-routes');

const router = Router();

// All routes in this file require authentication
router.use(authMiddleware);

// GET /users/me/wallet — the caller's Novas balance + recent ledger entries.
// Earning/spending are off this phase, so this returns 0 / [] for everyone.
router.get('/me/wallet', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [progress, recentTransactions] = await Promise.all([
      Models.UserProgress.findOne({ userId }).select('coins').lean<{ coins?: number } | null>(),
      Models.CoinTransaction.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);
    res.json({ coins: progress?.coins ?? 0, recentTransactions });
  } catch (error) {
    logger.error('Failed to fetch wallet', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

/**
 * POST /users/me/join-classroom
 * Student self-enrolls into a classroom using its join code.
 */
router.post('/me/join-classroom', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user?.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden', message: 'Only students can join a classroom' });
    }
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ error: 'Validation Error', message: 'A join code is required' });
    }
    const classroom = await Models.Classroom.findOne({ joinCode: code });
    if (!classroom) {
      return res.status(404).json({ error: 'Not Found', message: 'No classroom found for that code' });
    }
    await Models.User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { classroomId: classroom._id } }
    );
    res.json({ message: `Joined ${classroom.name}`, classroomName: classroom.name });
  } catch (error) {
    logger.error('Error joining classroom', { error });
    res.status(500).json({ error: 'Failed to join classroom' });
  }
});

/**
 * GET /users/me/stats
 * Get current user's profile and statistics
 */
router.get('/me/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
      });
    }

    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch user data
    const user = await Models.User.findById(userObjectId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    // Fetch or create user progress
    let progress = await Models.UserProgress.findOne({ userId: userObjectId });

    if (!progress) {
      // Create default progress for new user
      progress = new Models.UserProgress({
        userId: userObjectId,
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
        topicProgress: [],
      });
      await progress.save();
    }

    // All characters are unlocked for everyone - no level restrictions
    const allCharacters = ['astra', 'nila', 'kenji', 'leo'];

    // One-time migration: backfill solvedProblemIds from recentActivity for existing users.
    // Once backfilled (any entry present) this block is skipped on subsequent requests.
    if (progress.solvedProblemIds.length === 0 && progress.recentActivity.length > 0) {
      const backfilled = [
        ...new Set(
          progress.recentActivity
            .filter((a: any) => a.status === 'ACCEPTED')
            .map((a: any) => a.problemId as number)
        ),
      ];
      if (backfilled.length > 0) {
        // Atomic update (not a hydrated save) so UserProgress optimisticConcurrency
        // cannot throw a VersionError on this read path during concurrent grading.
        // The $size:0 guard makes it a no-op if a writer already populated the list.
        await Models.UserProgress.updateOne(
          { _id: progress._id, solvedProblemIds: { $size: 0 } },
          { $set: { solvedProblemIds: backfilled } }
        );
        progress.solvedProblemIds = backfilled; // reflect in the in-memory doc for the response below
        logger.info('Backfilled solvedProblemIds from recentActivity', {
          userId,
          count: backfilled.length,
        });
      }
    }

    // topicProgress shape MUST match the teacher endpoint's (I1): emit both
    // `topic` (canonical) and `name` (legacy alias read by TopicProgress.tsx) so
    // the same data renders identically wherever it's consumed.
    const topicProgress = progress.topicProgress.map((t: any) => ({
      topic: t.topic,
      name: t.topic,
      solved: t.solved,
      total: t.total,
      percentage: t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0,
    }));

    // Derive structured skills: Python as LANGUAGE, each solved topic as CONCEPT
    const structuredSkills: Array<{ name: string; problemCount: number; category: string }> = [];
    if (progress.stats.totalSolved > 0) {
      structuredSkills.push({ name: 'Python', problemCount: progress.stats.totalSolved, category: 'LANGUAGE' });
    }
    for (const t of progress.topicProgress) {
      if ((t as any).solved > 0) {
        structuredSkills.push({ name: (t as any).topic, problemCount: (t as any).solved, category: 'CONCEPT' });
      }
    }

    // Return combined user + progress data
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      age_group: user.age_group,
      joinDate: user.createdAt,
      avatar: (user as any).avatar || '',
      bio: (user as any).bio || '',
      selectedCharacter: user.selectedCharacter,
      onboardingComplete: user.onboardingComplete,
      rank: progress.rank,
      level: progress.level,
      experience: progress.experience,
      streak: progress.streak,
      stats: progress.stats,
      contestRating: progress.contestRating,
      achievements: progress.achievements,
      skills: structuredSkills,
      recentActivity: progress.recentActivity,
      submissionCalendar: progress.submissionCalendar,
      solvedCalendar: (progress as any).solvedCalendar || [],
      topicProgress,
      solvedProblemIds: progress.solvedProblemIds || [],
      unlockedCharacters: allCharacters, // All characters unlocked
      // TEST/DEV per-account gate bypass (Teja only) — frontend gates honor it. Remove with Teja at prod.
      unlockAllLevels: (progress as any).unlockAllLevels === true,
    });
  } catch (error) {
    logger.error('Error fetching user stats', { error });
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

/**
 * GET /users/me/activity
 * Get current user's recent activity and submission calendar
 */
router.get('/me/activity', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const progress = await Models.UserProgress.findOne({ userId: userObjectId });

    if (!progress) {
      return res.json({
        recentActivity: [],
        submissionCalendar: [],
      });
    }

    res.json({
      recentActivity: progress.recentActivity,
      submissionCalendar: progress.submissionCalendar,
    });
  } catch (error) {
    logger.error('Error fetching user activity', { error });
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

/**
 * GET /users/me/achievements
 * Get current user's achievements
 */
router.get('/me/achievements', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const progress = await Models.UserProgress.findOne({ userId: userObjectId });

    if (!progress) {
      return res.json({ achievements: [] });
    }

    res.json({ achievements: progress.achievements });
  } catch (error) {
    logger.error('Error fetching achievements', { error });
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

/**
 * PATCH /users/me/character
 * Update current user's selected character and complete onboarding
 */
router.patch('/me/character', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { character } = req.body;

    logger.info('Character update request', { userId, character });

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
      });
    }

    // Validate character
    const validCharacters = ['astra', 'nila', 'kenji', 'leo'];
    if (!character || !validCharacters.includes(character)) {
      return res.status(400).json({
        error: 'Invalid Character',
        message: `Character must be one of: ${validCharacters.join(', ')}`,
      });
    }


    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Update user's selected character and mark onboarding as complete
    const user = await Models.User.findByIdAndUpdate(
      userObjectId,
      {
        $set: {
          selectedCharacter: character,
          onboardingComplete: true,
        }
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      logger.warn('Character update: user not found', { userId });
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    logger.info('Character updated', { userId, selectedCharacter: user.selectedCharacter });

    res.json({
      message: 'Character selected successfully',
      selectedCharacter: user.selectedCharacter,
      onboardingComplete: user.onboardingComplete,
    });
  } catch (error: any) {
    logger.error('Error updating character', { userId: req.user?.userId, error: error.message });
    res.status(500).json({
      error: 'Failed to update character',
      details: error.message,
    });
  }
});

/**
 * PATCH /users/me
 * Update current user's profile (avatar, bio, etc.)
 */
router.patch('/me', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
      });
    }

    const allowedFields: Record<string, boolean> = { avatar: true, bio: true };
    const updates = Object.keys(req.body).filter((k) => allowedFields[k]);

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Invalid Updates',
        message: 'Updatable fields: avatar, bio',
      });
    }

    // Validate bio length
    if (req.body.bio !== undefined && req.body.bio.length > 500) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Bio must be 500 characters or fewer',
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const setFields: Record<string, any> = {};
    if (req.body.avatar !== undefined) setFields.avatar = req.body.avatar.trim();
    if (req.body.bio !== undefined)    setFields.bio    = req.body.bio.trim();

    const updated = await Models.User.findByIdAndUpdate(
      userObjectId,
      { $set: setFields },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updated) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    logger.info('Profile updated', { userId, fields: Object.keys(setFields) });
    res.json({
      message: 'Profile updated successfully',
      avatar: (updated as any).avatar,
      bio: (updated as any).bio,
    });
  } catch (error) {
    logger.error('Error updating profile', { error });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
