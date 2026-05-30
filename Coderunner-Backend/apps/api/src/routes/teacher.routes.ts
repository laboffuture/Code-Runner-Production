import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, teacherMiddleware } from '../middleware/auth.middleware';

const router = Router();
const logger = getLogger('teacher');

// All teacher routes require auth + teacher role.
router.use(authMiddleware);
router.use(teacherMiddleware);

/**
 * GET /teacher/students
 * Class Overview (Phase 1). One global class for now: returns every student
 * with their at-a-glance learning metrics, joined from UserProgress.
 */
router.get('/students', async (_req: Request, res: Response) => {
  try {
    const students = await Models.User.find({ role: 'student' })
      .select('username age_group createdAt')
      .lean();

    const ids = students.map((s: any) => s._id);
    const progressDocs = await Models.UserProgress.find({ userId: { $in: ids } }).lean();
    const progressByUser = new Map<string, any>(
      progressDocs.map((p: any) => [String(p.userId), p])
    );

    const todayStr = new Date().toISOString().split('T')[0];

    const roster = students.map((s: any) => {
      const p = progressByUser.get(String(s._id));
      const solvedToday =
        p?.solvedCalendar?.find(
          (d: any) => new Date(d.date).toISOString().split('T')[0] === todayStr
        )?.count || 0;
      const lastActive = p?.recentActivity?.[0]?.timestamp || p?.updatedAt || null;

      return {
        userId: String(s._id),
        username: s.username,
        age_group: s.age_group,
        joinedAt: s.createdAt,
        level: p?.level ?? 1,
        rank: p?.rank ?? 'NOVICE',
        totalSolved: p?.stats?.totalSolved ?? 0,
        solvedToday,
        totalSubmissions: p?.stats?.totalSubmissions ?? 0,
        acceptanceRate: p?.stats?.acceptanceRate ?? 0,
        currentStreak: p?.streak?.current ?? 0,
        lastActive,
      };
    });

    // Default sort: most problems solved first.
    roster.sort((a, b) => b.totalSolved - a.totalSolved);

    res.json({ count: roster.length, students: roster });
  } catch (error) {
    logger.error('Error fetching teacher student roster', { error });
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * GET /teacher/students/:id
 * Deep-dive for one student. Returns the same shape as /users/me/stats so the
 * frontend can reuse the existing profile components (ProfileStats, ProblemChart,
 * ActivityCalendar). Read-only — never creates a progress doc.
 */
router.get('/students/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Invalid student id' });
    }
    const objId = new mongoose.Types.ObjectId(id);

    const user = (await Models.User.findById(objId).select('-passwordHash').lean()) as any;
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Not Found', message: 'Student not found' });
    }

    const progress = (await Models.UserProgress.findOne({ userId: objId }).lean()) as any;

    const topicProgress = (progress?.topicProgress || []).map((t: any) => ({
      topic: t.topic,
      solved: t.solved,
      total: t.total,
      percentage: t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0,
    }));
    const skills = topicProgress
      .filter((t: any) => t.solved > 0)
      .map((t: any) => ({ name: t.topic, problemCount: t.solved, category: 'CONCEPT' }));

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      age_group: user.age_group,
      joinDate: user.createdAt,
      avatar: user.avatar || '',
      bio: user.bio || '',
      selectedCharacter: user.selectedCharacter,
      onboardingComplete: user.onboardingComplete,
      rank: progress?.rank || 'NOVICE',
      level: progress?.level || 1,
      experience: progress?.experience || 0,
      streak: progress?.streak || { current: 0, longest: 0, lastSubmissionDate: null },
      stats: progress?.stats || {
        totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
        totalSubmissions: 0, acceptedSubmissions: 0, acceptanceRate: 0,
      },
      contestRating: progress?.contestRating || 1000,
      achievements: progress?.achievements || [],
      skills,
      recentActivity: progress?.recentActivity || [],
      submissionCalendar: progress?.submissionCalendar || [],
      solvedCalendar: progress?.solvedCalendar || [],
      topicProgress,
      solvedProblemIds: progress?.solvedProblemIds || [],
    });
  } catch (error) {
    logger.error('Error fetching student detail', { error });
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

export default router;
