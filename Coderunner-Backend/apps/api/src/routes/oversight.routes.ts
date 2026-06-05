import { Router, Request, Response } from 'express';
import { Models } from '@code-runner/shared';
import { authMiddleware, ownerMiddleware } from '../middleware/auth.middleware';
import { computeTicketDelay } from '../config/oversight.config';

const router = Router();
router.use(authMiddleware);
router.use(ownerMiddleware);

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// GET /oversight/groups — one row per classroom: counts, active-today, level distribution.
router.get('/groups', async (_req: Request, res: Response) => {
  try {
    const classrooms: any[] = await Models.Classroom.find({}).select('name age_group teacherIds').lean();
    const since = new Date(Date.now() - ONE_DAY_MS);

    const rows = await Promise.all(
      classrooms.map(async (c: any) => {
        const studentIds = await Models.User.find({ role: 'student', classroomId: c._id }).distinct('_id');
        const studentCount = studentIds.length;
        const activeUserIds = studentCount
          ? await Models.StudentAttempt.distinct('userId', { userId: { $in: studentIds }, createdAt: { $gte: since } })
          : [];
        const levelDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
        if (studentCount) {
          const progresses: any[] = await Models.UserProgress.find({ userId: { $in: studentIds } }).select('level').lean();
          for (const p of progresses) {
            const lvl = Math.max(1, Math.min(4, Number(p.level) || 1));
            levelDist[lvl] = (levelDist[lvl] || 0) + 1;
          }
        }
        return {
          classroomId: String(c._id),
          name: c.name,
          ageGroup: c.age_group,
          teacherCount: Array.isArray(c.teacherIds) ? c.teacherIds.length : 0,
          studentCount,
          activeToday: activeUserIds.length,
          levelDistribution: levelDist,
        };
      })
    );
    return res.json({ groups: rows });
  } catch (error) {
    console.error('[Oversight] groups failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load groups' });
  }
});

// GET /oversight/tickets?status=&type= — read-only radar with computed delay/breach.
router.get('/tickets', async (req: Request, res: Response) => {
  try {
    // Whitelist query filters against the known enums — never pass raw query
    // values (which can be objects/arrays) into the Mongo filter.
    const filter: Record<string, unknown> = {};
    const status = String(req.query.status ?? '');
    const type = String(req.query.type ?? '');
    if (status === 'open' || status === 'in_progress' || status === 'resolved') filter.status = status;
    if (type === 'bug_report' || type === 'doubt') filter.type = type;
    const tickets: any[] = await Models.Ticket.find(filter).sort({ createdAt: -1 }).limit(500)
      .populate('createdBy', 'username')
      .populate('classroomId', 'name')
      .lean();
    const rows = tickets.map((t: any) => ({
      id: String(t._id),
      type: t.type,
      status: t.status,
      targetRole: t.targetRole,
      title: t.title,
      student: t.createdBy?.username ?? 'Unknown',
      classroom: t.classroomId?.name ?? null,
      createdAt: t.createdAt,
      ...computeTicketDelay(t),
    }));
    return res.json({ tickets: rows });
  } catch (error) {
    console.error('[Oversight] tickets failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load tickets' });
  }
});

export default router;
