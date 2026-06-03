import { Router, Request, Response } from 'express';
import { Models, getLogger, awardNovas } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const router = Router();
const logger = getLogger('contests-routes');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Compute and persist a live status based on current time */
async function resolveStatus(contest: any): Promise<string> {
  const now = new Date();
  let computed: string;
  if (now < contest.startTime)  computed = 'upcoming';
  else if (now < contest.endTime) computed = 'active';
  else                           computed = 'ended';

  if (computed !== contest.status) {
    contest.status = computed;
    await contest.save();

    // Trigger rating update exactly once when contest first transitions to 'ended'
    if (computed === 'ended' && !contest.ratingUpdateApplied) {
      applyRatingUpdates(contest._id).catch(err =>
        logger.error('Rating update failed', { contestId: contest._id, err })
      );
    }
  }
  return computed;
}

/** Award / deduct contestRating and XP for all participants after contest ends */
async function applyRatingUpdates(contestId: mongoose.Types.ObjectId): Promise<void> {
  // Atomic compare-and-set: only the caller that flips ratingUpdateApplied from
  // unset to true proceeds. Two concurrent pollers can both pass the in-memory
  // !ratingUpdateApplied check in resolveStatus and call this; without an atomic
  // claim they would both run and double-apply every rating/XP delta.
  // findOneAndUpdate returns the matched (pre-update) doc, or null if another
  // caller already claimed it.
  const contest = await Models.Contest.findOneAndUpdate(
    { _id: contestId, ratingUpdateApplied: { $ne: true } },
    { $set: { ratingUpdateApplied: true } }
  );
  if (!contest) return; // already applied (or being applied) by a concurrent caller

  const entries = await Models.ContestEntry.find({ contestId })
    .sort({ totalScore: -1, penaltyTime: 1 })
    .lean();

  const n = entries.length;

  for (let i = 0; i < n; i++) {
    const entry = entries[i] as any;
    const pct = i / Math.max(n - 1, 1); // 0 = top, 1 = bottom

    let delta: number;
    if      (pct <= 0.10) delta = 50;
    else if (pct <= 0.25) delta = 25;
    else if (pct <= 0.50) delta = 10;
    else if (pct <= 0.75) delta = -5;
    else                  delta = -15;

    const xpBonus = Math.round(entry.totalScore / 10);

    await Models.ContestEntry.updateOne(
      { _id: entry._id },
      { $set: { rank: i + 1, ratingDelta: delta } }
    );

    await Models.UserProgress.updateOne(
      { userId: entry.userId },
      { $inc: { contestRating: delta, experience: xpBonus } }
    );
    // Clamp 800–3000
    await Models.UserProgress.updateOne(
      { userId: entry.userId, contestRating: { $lt: 800 } },
      { $set: { contestRating: 800 } }
    );
    await Models.UserProgress.updateOne(
      { userId: entry.userId, contestRating: { $gt: 3000 } },
      { $set: { contestRating: 3000 } }
    );

    // Novas (✨) for the podium — the prestige, contest-only reward (XP already covers
    // participation/finishing). Dormant: awardNovas no-ops until NOVAS_EARNING_ENABLED.
    const novaBonus = i === 0 ? 50 : i === 1 ? 30 : i === 2 ? 20 : 0;
    if (novaBonus > 0) {
      await awardNovas(entry.userId.toString(), novaBonus, `Contest placement: rank ${i + 1}`, contestId.toString());
    }
  }

  // Registered but never submitted → small penalty
  const participantIds = entries.map((e: any) => e.userId.toString());
  for (const uid of contest.registeredUsers) {
    if (!participantIds.includes(uid.toString())) {
      await Models.UserProgress.updateOne(
        { userId: uid },
        { $inc: { contestRating: -10 } }
      );
      await Models.UserProgress.updateOne(
        { userId: uid, contestRating: { $lt: 800 } },
        { $set: { contestRating: 800 } }
      );
    }
  }

  logger.info('Contest rating updates applied', { contestId, participants: n });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /contests
 * List contests with optional filters: status, ageGroup, page (20 per page)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, ageGroup, page = '1' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limit = 20;
    const skip = (pageNum - 1) * limit;

    const filter: any = {};
    if (status && ['draft','upcoming','active','ended'].includes(status as string)) {
      filter.status = status;
    }
    if (ageGroup && ['11-14','15-18','all'].includes(ageGroup as string)) {
      filter.ageGroup = { $in: [ageGroup, 'all'] };
    }

    const contests = await Models.Contest.find(filter)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .select('-registeredUsers')
      .lean();

    // Refresh status for each (non-blocking saves happen async)
    const enriched = await Promise.all(
      contests.map(async (c: any) => {
        const now = new Date();
        let liveStatus = c.status;
        if (now >= c.endTime && c.status !== 'ended') liveStatus = 'ended';
        else if (now >= c.startTime && c.status === 'upcoming') liveStatus = 'active';
        return { ...c, status: liveStatus, participantCount: c.registeredUsers?.length ?? 0 };
      })
    );

    const total = await Models.Contest.countDocuments(filter);

    res.json({
      contests: enriched,
      pagination: { total, page: pageNum, limit, hasMore: skip + limit < total },
    });
  } catch (error) {
    logger.error('Error listing contests', { error });
    res.status(500).json({ error: 'Failed to list contests' });
  }
});

/**
 * GET /contests/:id
 * Contest detail with live status, participant count, and problem previews
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid contest ID' });
    }

    const contest = await Models.Contest.findById(id).populate('createdBy', 'username');
    if (!contest) return res.status(404).json({ error: 'Contest not found' });

    await resolveStatus(contest);

    // Fetch problem summaries (title + difficulty only — no test cases)
    const problems = await Models.Problem.find({
      problem_id: { $in: contest.problems.map((p: any) => p.problemId) },
    }).select('problem_id title difficulty').lean();

    const problemMap = new Map(problems.map((p: any) => [p.problem_id, p]));

    res.json({
      id: contest._id,
      title: contest.title,
      description: contest.description,
      startTime: contest.startTime,
      endTime: contest.endTime,
      durationMinutes: contest.durationMinutes,
      status: contest.status,
      ageGroup: contest.ageGroup,
      maxParticipants: contest.maxParticipants,
      participantCount: contest.registeredUsers.length,
      createdBy: (contest.createdBy as any)?.username,
      problems: contest.problems.map((p: any) => ({
        ...p.toObject(),
        title: problemMap.get(p.problemId)?.title ?? `Problem ${p.problemId}`,
        difficulty: problemMap.get(p.problemId)?.difficulty ?? 'Easy',
      })),
    });
  } catch (error) {
    logger.error('Error fetching contest', { error });
    res.status(500).json({ error: 'Failed to fetch contest' });
  }
});

/**
 * POST /contests/:id/register
 * Register current user for a contest (must be upcoming or active)
 */
router.post('/:id/register', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid contest ID' });
    }

    const contest = await Models.Contest.findById(id);
    if (!contest) return res.status(404).json({ error: 'Contest not found' });

    await resolveStatus(contest);
    if (contest.status === 'ended' || contest.status === 'draft') {
      return res.status(400).json({ error: 'Cannot register for this contest' });
    }

    if (contest.maxParticipants && contest.registeredUsers.length >= contest.maxParticipants) {
      return res.status(400).json({ error: 'Contest is full' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyRegistered = contest.registeredUsers.some((uid: any) =>
      uid.equals(userObjectId)
    );

    if (!alreadyRegistered) {
      contest.registeredUsers.push(userObjectId);
      await contest.save();

      // Pre-create a ContestEntry so the user appears in the leaderboard immediately
      await Models.ContestEntry.updateOne(
        { contestId: contest._id, userId: userObjectId },
        { $setOnInsert: { joinedAt: new Date(), totalScore: 0, penaltyTime: 0, problems: [] } },
        { upsert: true }
      );
    }

    res.json({ message: 'Registered successfully', participantCount: contest.registeredUsers.length });
  } catch (error) {
    logger.error('Error registering for contest', { error });
    res.status(500).json({ error: 'Failed to register' });
  }
});

/**
 * GET /contests/:id/leaderboard
 * Sorted standings — safe to poll every 30 s
 */
router.get('/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid contest ID' });
    }

    const contest = await Models.Contest.findById(id).select('title status endTime durationMinutes problems');
    if (!contest) return res.status(404).json({ error: 'Contest not found' });

    const entries = await Models.ContestEntry.find({ contestId: id })
      .sort({ totalScore: -1, penaltyTime: 1 })
      .populate('userId', 'username')
      .lean();

    const leaderboard = entries.map((entry: any, i) => ({
      rank: entry.rank ?? i + 1,
      userId: entry.userId?._id,
      username: entry.userId?.username ?? 'Unknown',
      totalScore: entry.totalScore,
      penaltyTime: entry.penaltyTime,
      solvedCount: entry.problems.filter((p: any) => p.accepted).length,
      ratingDelta: entry.ratingDelta ?? null,
      problems: entry.problems.map((p: any) => ({
        problemId: p.problemId,
        accepted: p.accepted,
        attempts: p.attempts,
        score: p.score,
        timeFromStart: p.timeFromStart,
      })),
    }));

    res.json({ contestId: id, title: contest.title, status: contest.status, leaderboard });
  } catch (error) {
    logger.error('Error fetching leaderboard', { error });
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /contests/:id/my-entry
 * Current user's ContestEntry — problems solved, scores, ranking
 */
router.get('/:id/my-entry', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid contest ID' });
    }

    const entry = await Models.ContestEntry.findOne({
      contestId: id,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!entry) {
      return res.json({ registered: false, totalScore: 0, problems: [] });
    }

    res.json({ registered: true, ...(entry as any) });
  } catch (error) {
    logger.error('Error fetching my-entry', { error });
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /contests
 * Create a contest (admin only)
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({ error: 'Developer only' });
    }

    const { title, description, startTime, durationMinutes, problems, ageGroup, maxParticipants } = req.body;

    if (!title || !startTime || !durationMinutes || !problems?.length) {
      return res.status(400).json({ error: 'title, startTime, durationMinutes, and problems are required' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const contest = new Models.Contest({
      title,
      description: description || '',
      startTime: start,
      endTime: end,
      durationMinutes,
      problems,
      ageGroup: ageGroup || 'all',
      maxParticipants,
      registeredUsers: [],
      createdBy: new mongoose.Types.ObjectId(req.user.userId),
      status: new Date() < start ? 'upcoming' : 'active',
      ratingUpdateApplied: false,
    });

    await contest.save();
    logger.info('Contest created', { contestId: contest._id, title });
    res.status(201).json({ id: contest._id, message: 'Contest created' });
  } catch (error) {
    logger.error('Error creating contest', { error });
    res.status(500).json({ error: 'Failed to create contest' });
  }
});

/**
 * PATCH /contests/:id
 * Update a contest (admin only, only if draft or upcoming)
 */
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({ error: 'Developer only' });
    }

    const contest = await Models.Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ error: 'Contest not found' });
    if (!['draft', 'upcoming'].includes(contest.status)) {
      return res.status(400).json({ error: 'Can only edit draft or upcoming contests' });
    }

    const allowed = ['title', 'description', 'startTime', 'durationMinutes', 'problems', 'ageGroup', 'maxParticipants', 'status'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) (contest as any)[key] = req.body[key];
    }

    if (req.body.startTime || req.body.durationMinutes) {
      contest.endTime = new Date(
        new Date(contest.startTime).getTime() + contest.durationMinutes * 60 * 1000
      );
    }

    await contest.save();
    res.json({ message: 'Contest updated' });
  } catch (error) {
    logger.error('Error updating contest', { error });
    res.status(500).json({ error: 'Failed to update contest' });
  }
});

/**
 * POST /contests/:id/end
 * Manually end an active contest and apply ratings immediately (admin only)
 */
router.post('/:id/end', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({ error: 'Developer only' });
    }

    const contest = await Models.Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ error: 'Contest not found' });
    if (contest.status !== 'active') {
      return res.status(400).json({ error: 'Contest is not active' });
    }

    contest.status = 'ended';
    contest.endTime = new Date();
    await contest.save();

    if (!contest.ratingUpdateApplied) {
      applyRatingUpdates(contest._id as mongoose.Types.ObjectId).catch(err =>
        logger.error('Rating update failed', { contestId: contest._id, err })
      );
    }

    res.json({ message: 'Contest ended, rating updates queued' });
  } catch (error) {
    logger.error('Error ending contest', { error });
    res.status(500).json({ error: 'Failed to end contest' });
  }
});

/**
 * DELETE /contests/:id
 * Delete a draft contest (admin only)
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({ error: 'Developer only' });
    }

    const contest = await Models.Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ error: 'Contest not found' });
    if (contest.status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete draft contests' });
    }

    await Models.Contest.deleteOne({ _id: contest._id });
    await Models.ContestEntry.deleteMany({ contestId: contest._id });
    res.json({ message: 'Contest deleted' });
  } catch (error) {
    logger.error('Error deleting contest', { error });
    res.status(500).json({ error: 'Failed to delete contest' });
  }
});

export default router;
