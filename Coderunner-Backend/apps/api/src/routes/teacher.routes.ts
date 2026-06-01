import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, teacherMiddleware } from '../middleware/auth.middleware';

const router = Router();
const logger = getLogger('teacher');

// All teacher routes require auth + teacher role.
router.use(authMiddleware);
router.use(teacherMiddleware);

function genJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

/** Verify the current teacher owns (teaches) the given classroom; returns it or null. */
async function myClassroom(req: Request, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const me = new mongoose.Types.ObjectId(req.user!.userId);
  return Models.Classroom.findOne({ _id: id, teacherIds: me });
}

/** Build roster rows + chart overview for a set of student docs. */
async function buildClassData(students: any[]) {
  const ids = students.map((s) => s._id);
  const progressDocs = await Models.UserProgress.find({ userId: { $in: ids } }).lean();
  const byUser = new Map<string, any>(progressDocs.map((p: any) => [String(p.userId), p]));
  const todayStr = new Date().toISOString().split('T')[0];

  // Integrity: count of flagged attempts per student (any flag set).
  const flaggedAgg = await Models.StudentAttempt.aggregate([
    {
      $match: {
        userId: { $in: ids },
        $or: [
          { 'flags.solvedTooFast': true },
          { 'flags.noIteration': true },
          { 'flags.largePaste': true },
        ],
      },
    },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  const flaggedByUser = new Map<string, number>(flaggedAgg.map((f: any) => [String(f._id), f.count]));

  const roster = students.map((s: any) => {
    const p = byUser.get(String(s._id));
    const solvedToday =
      p?.solvedCalendar?.find((d: any) => new Date(d.date).toISOString().split('T')[0] === todayStr)?.count || 0;
    const lastActive = p?.recentActivity?.[0]?.timestamp || p?.updatedAt || null;
    return {
      userId: String(s._id),
      username: s.username,
      age_group: s.age_group,
      joinedAt: s.createdAt,
      level: p?.level ?? 1,
      rank: p?.rank ?? 'NOVICE',
      totalSolved: p?.stats?.totalSolved ?? 0,
      easySolved: p?.stats?.easySolved ?? 0,
      mediumSolved: p?.stats?.mediumSolved ?? 0,
      hardSolved: p?.stats?.hardSolved ?? 0,
      solvedToday,
      totalSubmissions: p?.stats?.totalSubmissions ?? 0,
      acceptanceRate: p?.stats?.acceptanceRate ?? 0,
      currentStreak: p?.streak?.current ?? 0,
      lastActive,
      flaggedCount: flaggedByUser.get(String(s._id)) || 0,
    };
  });
  roster.sort((a, b) => b.totalSolved - a.totalSolved);

  const difficulty = { easy: 0, medium: 0, hard: 0 };
  const levelCounts: Record<number, number> = {};
  const dayMap: Record<string, number> = {};
  for (const s of students) {
    const p = byUser.get(String(s._id));
    const lvl = p?.level ?? 1;
    levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
    difficulty.easy += p?.stats?.easySolved || 0;
    difficulty.medium += p?.stats?.mediumSolved || 0;
    difficulty.hard += p?.stats?.hardSolved || 0;
    for (const d of (p?.solvedCalendar || [])) {
      const key = new Date(d.date).toISOString().split('T')[0];
      dayMap[key] = (dayMap[key] || 0) + (d.count || 0);
    }
  }
  const solvedByDay: Array<{ date: string; daily: number; cumulative: number }> = [];
  let running = 0;
  for (let i = 29; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().split('T')[0];
    const daily = dayMap[key] || 0;
    running += daily;
    solvedByDay.push({ date: key, daily, cumulative: running });
  }
  const levelDistribution = Object.entries(levelCounts)
    .map(([level, count]) => ({ level: Number(level), students: count }))
    .sort((a, b) => a.level - b.level);

  return { roster, overview: { solvedByDay, difficulty, levelDistribution } };
}

/**
 * POST /teacher/classrooms — create a classroom (creator becomes a teacher of it).
 */
router.post('/classrooms', async (req: Request, res: Response) => {
  try {
    const { name, age_group } = req.body;
    if (!name || (age_group !== '11-14' && age_group !== '15-18')) {
      return res.status(400).json({ error: 'Validation Error', message: 'name and a valid age_group are required' });
    }
    const me = new mongoose.Types.ObjectId(req.user!.userId);
    let joinCode = genJoinCode();
    for (let i = 0; i < 5 && (await Models.Classroom.exists({ joinCode })); i++) joinCode = genJoinCode();
    const classroom = await Models.Classroom.create({ name, age_group, joinCode, teacherIds: [me], createdBy: me });
    res.status(201).json(classroom);
  } catch (error) {
    logger.error('Error creating classroom', { error });
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

/**
 * GET /teacher/classrooms — classrooms I teach, with student counts.
 */
router.get('/classrooms', async (req: Request, res: Response) => {
  try {
    const me = new mongoose.Types.ObjectId(req.user!.userId);
    const classrooms = await Models.Classroom.find({ teacherIds: me }).sort({ createdAt: -1 }).lean();
    const withCounts = await Promise.all(
      classrooms.map(async (c: any) => ({
        id: c._id,
        name: c.name,
        age_group: c.age_group,
        joinCode: c.joinCode,
        createdAt: c.createdAt,
        studentCount: await Models.User.countDocuments({ role: 'student', classroomId: c._id }),
      }))
    );
    res.json({ classrooms: withCounts });
  } catch (error) {
    logger.error('Error listing classrooms', { error });
    res.status(500).json({ error: 'Failed to list classrooms' });
  }
});

/**
 * GET /teacher/classrooms/:id — roster + chart overview for one of my classrooms.
 */
router.get('/classrooms/:id', async (req: Request, res: Response) => {
  try {
    const classroom = await myClassroom(req, req.params.id);
    if (!classroom) return res.status(404).json({ error: 'Not Found', message: 'Classroom not found' });
    const students = await Models.User.find({ role: 'student', classroomId: classroom._id })
      .select('username age_group createdAt')
      .lean();
    const data = await buildClassData(students);
    res.json({
      classroom: { id: classroom._id, name: classroom.name, age_group: classroom.age_group, joinCode: classroom.joinCode },
      count: data.roster.length,
      ...data,
    });
  } catch (error) {
    logger.error('Error fetching classroom', { error });
    res.status(500).json({ error: 'Failed to fetch classroom' });
  }
});

/**
 * POST /teacher/classrooms/:id/students — add an existing student to my classroom by username.
 */
router.post('/classrooms/:id/students', async (req: Request, res: Response) => {
  try {
    const classroom = await myClassroom(req, req.params.id);
    if (!classroom) return res.status(404).json({ error: 'Not Found', message: 'Classroom not found' });
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Validation Error', message: 'username is required' });
    const student = await Models.User.findOne({ username, role: 'student' });
    if (!student) return res.status(404).json({ error: 'Not Found', message: 'No student with that username' });
    (student as any).classroomId = classroom._id;
    await student.save();
    res.json({ message: `Added ${username} to ${classroom.name}` });
  } catch (error) {
    logger.error('Error adding student', { error });
    res.status(500).json({ error: 'Failed to add student' });
  }
});

/**
 * GET /teacher/students/:id — deep-dive for a student in one of my classrooms.
 * Same shape as /users/me/stats so the profile components can be reused.
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

    // Ownership: the student must belong to a classroom I teach.
    const me = new mongoose.Types.ObjectId(req.user!.userId);
    const owns = user.classroomId && (await Models.Classroom.exists({ _id: user.classroomId, teacherIds: me }));
    if (!owns) {
      return res.status(403).json({ error: 'Forbidden', message: 'Student is not in your classroom' });
    }

    const progress = (await Models.UserProgress.findOne({ userId: objId }).lean()) as any;

    // Integrity: most-recent graded attempts (for the "how they solved it" panel).
    const attemptDocs = (await Models.StudentAttempt.find({ userId: objId })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean()) as any[];
    const attempts = attemptDocs.map((a) => ({
      problemId: a.problemId,
      accepted: a.accepted,
      status: a.status,
      flags: a.flags || {},
      timeOnProblemMs: a.timeOnProblemMs ?? null,
      runsBeforeSubmit: a.runsBeforeSubmit ?? null,
      pasteCount: a.pasteCount ?? 0,
      pasteChars: a.pasteChars ?? 0,
      codeLength: a.codeLength ?? null,
      createdAt: a.createdAt,
    }));
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
      attempts,
    });
  } catch (error) {
    logger.error('Error fetching student detail', { error });
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

export default router;
