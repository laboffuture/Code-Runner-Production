import { Router, Request, Response } from 'express';
import { Models } from '@code-runner/shared';

const router = Router();

/**
 * GET /leaderboard/global
 * Get global leaderboard sorted by contest rating
 */
router.get('/global', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const sortBy = (req.query.sortBy as string) || 'contestRating'; // contestRating, totalSolved, level
    const skip = parseInt(req.query.skip as string) || 0;

    // Validate sortBy parameter
    const validSortFields = ['contestRating', 'totalSolved', 'level', 'experience'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'contestRating';

    // Build sort object
    const sortObject: any = {};
    if (sortField === 'totalSolved') {
      sortObject['stats.totalSolved'] = -1;
      sortObject['contestRating'] = -1; // Tiebreaker
    } else {
      sortObject[sortField] = -1;
      sortObject['stats.totalSolved'] = -1; // Tiebreaker
    }

    // Query leaderboard
    const leaderboard = await Models.UserProgress.find()
      .sort(sortObject)
      .limit(Math.min(limit, 100))
      .skip(skip)
      .populate('userId', 'username createdAt') // never expose children's email on a public endpoint
      .lean();

    // Format the response
    const formattedLeaderboard = leaderboard.map((entry: any, index: number) => ({
      position: skip + index + 1,
      userId: entry.userId?._id,
      username: entry.userId?.username || 'Unknown',
      level: entry.level,
      experience: entry.experience,
      rank: entry.rank,
      contestRating: entry.contestRating,
      stats: {
        totalSolved: entry.stats.totalSolved,
        easySolved: entry.stats.easySolved,
        mediumSolved: entry.stats.mediumSolved,
        hardSolved: entry.stats.hardSolved,
        acceptanceRate: entry.stats.acceptanceRate,
      },
      streak: entry.streak,
    }));

    // Get total count for pagination
    const totalCount = await Models.UserProgress.countDocuments();

    res.json({
      leaderboard: formattedLeaderboard,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount,
      },
      sortedBy: sortField,
    });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch leaderboard',
    });
  }
});

/**
 * GET /leaderboard/rank/:userId
 * Get a specific user's rank and position
 */
router.get('/rank/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Find user progress
    const userProgress = await Models.UserProgress.findOne({ userId })
      .populate('userId', 'username')
      .lean();

    if (!userProgress) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User progress not found',
      });
    }

    // Calculate user's rank (how many users have higher contest rating)
    const rank = await Models.UserProgress.countDocuments({
      contestRating: { $gt: userProgress.contestRating },
    }) + 1;

    // Get users immediately above and below
    const userAbove = await Models.UserProgress.findOne({
      contestRating: { $gt: userProgress.contestRating },
    })
      .sort({ contestRating: 1 })
      .populate('userId', 'username')
      .lean();

    const userBelow = await Models.UserProgress.findOne({
      contestRating: { $lt: userProgress.contestRating },
    })
      .sort({ contestRating: -1 })
      .populate('userId', 'username')
      .lean();

    res.json({
      rank,
      userProgress: {
        userId: (userProgress as any).userId?._id,
        username: (userProgress as any).userId?.username,
        level: userProgress.level,
        rank: userProgress.rank,
        contestRating: userProgress.contestRating,
        stats: userProgress.stats,
      },
      neighbors: {
        above: userAbove ? {
          username: (userAbove as any).userId?.username,
          contestRating: userAbove.contestRating,
          rank: rank - 1,
        } : null,
        below: userBelow ? {
          username: (userBelow as any).userId?.username,
          contestRating: userBelow.contestRating,
          rank: rank + 1,
        } : null,
      },
    });
  } catch (error) {
    console.error('Failed to fetch user rank:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user rank',
    });
  }
});

export default router;
