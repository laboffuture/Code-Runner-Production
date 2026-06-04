import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, teacherMiddleware } from '../middleware/auth.middleware';
import { performStudentReset } from '../services/progressReset';

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

/** Fetch a student the current teacher owns (in one of my classrooms), or null. */
async function myStudent(req: Request, id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const user: any = await Models.User.findById(id).select('-passwordHash').lean();
  if (!user || user.role !== 'student' || !user.classroomId) return null;
  const me = new mongoose.Types.ObjectId(req.user!.userId);
  const owns = await Models.Classroom.exists({ _id: user.classroomId, teacherIds: me });
  return owns ? user : null;
}

interface BandProblem { problem_id: number; level_number: number; session_id: number; difficulty: string; }

/**
 * Single source of truth for every teacher-facing COMPLETION number: derive them
 * fresh from the student's solvedProblemIds (the same write-once source the unlock
 * gate uses), NOT from the stored stats copies on UserProgress. This keeps the
 * roster and the student profile in lock-step and immune to any legacy/stored drift
 * (e.g. pre-solvedProblemIds test data). Gamification (xp/coins/rank/streak) stays
 * stored — only completion truth is derived here. `level` here means CURRICULUM
 * level reached (1–4), not the XP level.
 */
function deriveCompletion(solvedIds: number[], bandProblems: BandProblem[]) {
  const solvedSet = new Set(solvedIds);
  let easySolved = 0, mediumSolved = 0, hardSolved = 0, totalSolved = 0, level = 1;
  const agg = new Map<number, { total: number; solved: number }>();
  for (const p of bandProblems) {
    const e = agg.get(p.session_id) || { total: 0, solved: 0 };
    e.total += 1;
    if (solvedSet.has(p.problem_id)) {
      e.solved += 1;
      totalSolved += 1;
      if (p.level_number > level) level = p.level_number;
      const d = (p.difficulty || '').toLowerCase();
      if (d === 'hard') hardSolved += 1; else if (d === 'medium') mediumSolved += 1; else easySolved += 1; // intro counts as easy
    }
    agg.set(p.session_id, e);
  }
  let sessionsCompleted = 0;
  for (const e of agg.values()) if (e.total > 0 && e.solved >= e.total) sessionsCompleted += 1;
  level = Math.max(1, Math.min(4, level)); // curriculum is 4 levels; guard against stray level_number
  return { totalSolved, easySolved, mediumSolved, hardSolved, sessionsCompleted, sessionsTotal: agg.size, level };
}

/** Build roster rows + chart overview for a set of student docs. */
async function buildClassData(students: any[]) {
  const ids = students.map((s) => s._id);
  const progressDocs = await Models.UserProgress.find({ userId: { $in: ids } }).lean();
  const byUser = new Map<string, any>(progressDocs.map((p: any) => [String(p.userId), p]));
  const todayStr = new Date().toISOString().split('T')[0];

  // Load the curriculum for the bands present once, then derive completion per
  // student from their solved set (see deriveCompletion).
  const ageGroups = Array.from(new Set(students.map((s: any) => s.age_group).filter(Boolean)));
  const bandProblems = (await Models.Problem.find(
    { age_group: { $in: ageGroups } }, 'problem_id level_number session_id difficulty age_group',
  ).lean()) as any[];
  const problemsByBand = new Map<string, BandProblem[]>();
  for (const ag of ageGroups) problemsByBand.set(String(ag), []);
  for (const p of bandProblems) problemsByBand.get(String(p.age_group))?.push(p);
  const completionByUser = new Map<string, ReturnType<typeof deriveCompletion>>();
  for (const s of students) {
    const p = byUser.get(String(s._id));
    completionByUser.set(String(s._id), deriveCompletion(p?.solvedProblemIds || [], problemsByBand.get(String(s.age_group)) || []));
  }

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
    const c = completionByUser.get(String(s._id))!;
    const solvedToday =
      p?.solvedCalendar?.find((d: any) => new Date(d.date).toISOString().split('T')[0] === todayStr)?.count || 0;
    const lastActive = p?.recentActivity?.[0]?.timestamp || p?.updatedAt || null;
    return {
      userId: String(s._id),
      username: s.username,
      age_group: s.age_group,
      joinedAt: s.createdAt,
      curriculumLevel: c.level, // derived curriculum level reached (1–4), not the XP level
      rank: p?.rank ?? 'NOVICE',
      totalSolved: c.totalSolved,
      easySolved: c.easySolved,
      mediumSolved: c.mediumSolved,
      hardSolved: c.hardSolved,
      sessionsCompleted: c.sessionsCompleted,
      sessionsTotal: c.sessionsTotal,
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
    const c = completionByUser.get(String(s._id))!;
    levelCounts[c.level] = (levelCounts[c.level] || 0) + 1; // derived curriculum level
    difficulty.easy += c.easySolved;
    difficulty.medium += c.mediumSolved;
    difficulty.hard += c.hardSolved;
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
 * DELETE /teacher/classrooms/:id — delete one of my classrooms. Student accounts
 * and ALL their progress/attempts are preserved; only their membership link to
 * this class is cleared (classroomId -> null), so they can re-join another class
 * by code. Owner-only.
 */
router.delete('/classrooms/:id', async (req: Request, res: Response) => {
  try {
    const classroom = await myClassroom(req, req.params.id);
    if (!classroom) return res.status(404).json({ error: 'Not Found', message: 'Classroom not found' });
    // Remove the class FIRST so its join code is immediately invalid (a concurrent
    // join-by-code can't resolve into a class that's mid-deletion), THEN detach the
    // members. Student accounts/progress/attempts are preserved — only the link clears.
    await Models.Classroom.deleteOne({ _id: classroom._id });
    const detached = await Models.User.updateMany(
      { role: 'student', classroomId: classroom._id },
      { $set: { classroomId: null } },
    );
    logger.info('Classroom deleted', { classroomId: String(classroom._id), studentsDetached: detached.modifiedCount });
    res.json({ message: `Deleted ${classroom.name}`, studentsDetached: detached.modifiedCount });
  } catch (error) {
    logger.error('Error deleting classroom', { error });
    res.status(500).json({ error: 'Failed to delete classroom' });
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
    // Single ownership path (also used by the reset routes): student must be in
    // a classroom I teach, else 403.
    const user = await myStudent(req, id);
    if (!user) {
      return res.status(403).json({ error: 'Forbidden', message: 'Student is not in your classroom' });
    }
    const objId = new mongoose.Types.ObjectId(String(user._id));

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
      name: t.topic, // alias — keep teacher + student topicProgress shape identical (I1)
      solved: t.solved,
      total: t.total,
      percentage: t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0,
    }));
    const skills = topicProgress
      .filter((t: any) => t.solved > 0)
      .map((t: any) => ({ name: t.topic, problemCount: t.solved, category: 'CONCEPT' }));

    // Completion (sessions done + solved counts + curriculum level) — derived from
    // the solved set via the SAME deriveCompletion the roster uses, so the profile
    // and the roster can never disagree and stored-stat drift never shows.
    const bandProblems = (await Models.Problem.find(
      { age_group: user.age_group }, 'problem_id level_number session_id difficulty',
    ).lean()) as any[];
    const c = deriveCompletion(progress?.solvedProblemIds || [], bandProblems);

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
      level: progress?.level || 1, // XP level — ProfileStats' XP-progress bar reads this; keep stored
      curriculumLevel: c.level, // highest curriculum level reached (1–4), derived — for "how far through"
      experience: progress?.experience || 0,
      streak: progress?.streak || { current: 0, longest: 0, lastSubmissionDate: null },
      // Completion counts (totalSolved + difficulty breakdown) DERIVED from the
      // solved set; submission-quality counts (submissions/acceptance/failedRuns)
      // kept from stored stats — they track attempts, not curriculum completion.
      stats: {
        totalSolved: c.totalSolved, easySolved: c.easySolved, mediumSolved: c.mediumSolved, hardSolved: c.hardSolved,
        totalSubmissions: progress?.stats?.totalSubmissions ?? 0,
        acceptedSubmissions: progress?.stats?.acceptedSubmissions ?? 0,
        acceptanceRate: progress?.stats?.acceptanceRate ?? 0,
        failedRuns: progress?.stats?.failedRuns ?? 0,
      },
      contestRating: progress?.contestRating || 1000,
      achievements: progress?.achievements || [],
      skills,
      recentActivity: progress?.recentActivity || [],
      submissionCalendar: progress?.submissionCalendar || [],
      solvedCalendar: progress?.solvedCalendar || [],
      topicProgress,
      sessionsCompleted: c.sessionsCompleted,
      sessionsTotal: c.sessionsTotal,
      solvedProblemIds: progress?.solvedProblemIds || [],
      attempts,
    });
  } catch (error) {
    logger.error('Error fetching student detail', { error });
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

/**
 * GET /teacher/students/:id/reset-options — sessions this student has solves in,
 * in curriculum order, for the reset dialog's "from a session" picker.
 */
router.get('/students/:id/reset-options', async (req: Request, res: Response) => {
  try {
    const student = await myStudent(req, req.params.id);
    if (!student) return res.status(403).json({ error: 'Forbidden', message: 'Student is not in your classroom' });
    const progress: any = await Models.UserProgress.findOne({ userId: student._id }).select('solvedProblemIds').lean();
    const solved: number[] = progress?.solvedProblemIds || [];
    const problems: any[] = await Models.Problem.find(
      { problem_id: { $in: solved } }, 'session_id level_number session_title',
    ).lean();
    const seen = new Map<number, any>();
    for (const p of problems) {
      if (!seen.has(p.session_id)) {
        seen.set(p.session_id, { session_id: p.session_id, level_number: p.level_number ?? 0, session_title: p.session_title || `Session ${p.session_id}` });
      }
    }
    const sessions = Array.from(seen.values()).sort((a, b) => (a.level_number - b.level_number) || (a.session_id - b.session_id));
    res.json({ sessions });
  } catch (error) {
    logger.error('Error building reset options', { error });
    res.status(500).json({ error: 'Failed to load reset options' });
  }
});

/**
 * POST /teacher/students/:id/reset — reset a student's progress (full or from a session).
 * Ownership-checked. The StudentAttempt integrity log is never modified.
 */
router.post('/students/:id/reset', async (req: Request, res: Response) => {
  try {
    const student = await myStudent(req, req.params.id);
    if (!student) return res.status(403).json({ error: 'Forbidden', message: 'Student is not in your classroom' });

    const scope = req.body?.scope;
    if (scope !== 'full' && scope !== 'from-session') {
      return res.status(400).json({ error: 'Validation Error', message: "scope must be 'full' or 'from-session'" });
    }
    let fromSessionId: number | undefined;
    if (scope === 'from-session') {
      fromSessionId = Number(req.body?.fromSessionId);
      if (!Number.isFinite(fromSessionId)) {
        return res.status(400).json({ error: 'Validation Error', message: 'fromSessionId is required for a from-session reset' });
      }
    }

    const result = await performStudentReset({
      studentId: String(student._id),
      teacherId: req.user!.userId,
      classroomId: student.classroomId ? String(student.classroomId) : null,
      ageGroup: student.age_group,
      scope, fromSessionId,
    });
    res.json({ message: 'Progress reset', ...result });
  } catch (error: any) {
    if (error?.statusCode === 400) return res.status(400).json({ error: 'Validation Error', message: error.message });
    logger.error('Error resetting student progress', { error });
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

export default router;
