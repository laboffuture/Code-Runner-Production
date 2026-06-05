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

// GET /oversight/health/students — per-student activity buckets (active/quiet/silent).
router.get('/health/students', async (_req: Request, res: Response) => {
  try {
    const students: any[] = await Models.User.find({ role: 'student' }).select('username classroomId').limit(1000).lean();
    const ids = students.map(s => s._id);
    const progress: any[] = await Models.UserProgress.find({ userId: { $in: ids } }).lean();
    const byUser = new Map(progress.map((p: any) => [String(p.userId), p]));
    const classrooms: any[] = await Models.Classroom.find({}).select('name').lean();
    const className = new Map(classrooms.map((c: any) => [String(c._id), c.name]));
    const now = Date.now();
    const buckets = { active: 0, quiet: 0, silent: 0 };
    const rows = students.map((s: any) => {
      const p: any = byUser.get(String(s._id));
      const last = p?.recentActivity?.[0]?.timestamp || p?.updatedAt || null;
      const days = last ? (now - new Date(last).getTime()) / 86400000 : Infinity;
      const bucket = days <= 7 ? 'active' : days <= 14 ? 'quiet' : 'silent';
      buckets[bucket as keyof typeof buckets]++;
      return { id: String(s._id), username: s.username, classroom: s.classroomId ? (className.get(String(s.classroomId)) || null) : null,
        lastActive: last, bucket, totalSolved: p?.stats?.totalSolved ?? 0, acceptanceRate: p?.stats?.acceptanceRate ?? 0 };
    });
    return res.json({ buckets, students: rows });
  } catch (error) {
    console.error('[Oversight] health/students failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load student health' });
  }
});

// GET /oversight/health/teachers — per-teacher review activity + open doubt load.
router.get('/health/teachers', async (_req: Request, res: Response) => {
  try {
    const teachers: any[] = await Models.User.find({ role: 'teacher' }).select('username').lean();
    const rows = await Promise.all(teachers.map(async (t: any) => {
      const classIds = await Models.Classroom.find({ teacherIds: t._id }).distinct('_id');
      const acts: any[] = await Models.TeacherActivity.find({ teacherId: t._id }).select('lastReviewedAt reviewCount').lean();
      const lastReviewedAt = acts.reduce((mx: any, a: any) => !mx || new Date(a.lastReviewedAt) > new Date(mx) ? a.lastReviewedAt : mx, null);
      const totalReviews = acts.reduce((s: number, a: any) => s + (a.reviewCount || 0), 0);
      const openDoubts = classIds.length ? await Models.Ticket.countDocuments({ targetRole: 'teacher', status: { $ne: 'resolved' }, classroomId: { $in: classIds } }) : 0;
      return { id: String(t._id), username: t.username, classCount: classIds.length, lastReviewedAt, totalReviews, openDoubts };
    }));
    return res.json({ teachers: rows });
  } catch (error) {
    console.error('[Oversight] health/teachers failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load teacher health' });
  }
});

// GET /oversight/health/developers — bug-report SLA summary + oldest open bugs.
router.get('/health/developers', async (_req: Request, res: Response) => {
  try {
    const bugs: any[] = await Models.Ticket.find({ type: 'bug_report' }).select('status createdAt resolvedAt type').lean();
    let totalOpen = 0, breached = 0; const resolvedDurations: number[] = [];
    for (const b of bugs) {
      const d = computeTicketDelay(b);
      if (b.status !== 'resolved') { totalOpen++; if (d.isBreached) breached++; }
      else if (b.resolvedAt) resolvedDurations.push((new Date(b.resolvedAt).getTime() - new Date(b.createdAt).getTime()) / 3600000);
    }
    const avgResolutionHours = resolvedDurations.length ? Math.round((resolvedDurations.reduce((a, c) => a + c, 0) / resolvedDurations.length) * 10) / 10 : null;
    const openBugs: any[] = await Models.Ticket.find({ type: 'bug_report', status: { $ne: 'resolved' } }).sort({ createdAt: 1 }).limit(5).select('title createdAt status type resolvedAt').lean();
    const oldestOpen = openBugs.map((b: any) => ({ id: String(b._id), title: b.title, ...computeTicketDelay(b) }));
    return res.json({ summary: { totalOpen, breached, avgResolutionHours, totalResolved: resolvedDurations.length }, oldestOpen });
  } catch (error) {
    console.error('[Oversight] health/developers failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load developer health' });
  }
});

export default router;
