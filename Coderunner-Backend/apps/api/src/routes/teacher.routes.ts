import { Router, Request, Response } from 'express';
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

export default router;
