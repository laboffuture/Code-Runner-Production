import { Router, Request, Response } from 'express';
import { Models, getLogger } from '@code-runner/shared';
import { authMiddleware, staffMiddleware } from '../middleware/auth.middleware';

const router = Router();
const logger = getLogger('curriculum-routes');

// Staff only (teacher or developer) — answer keys must never reach a student.
router.use(authMiddleware);
router.use(staffMiddleware);

// GET /curriculum/tree?ageGroup=11-14 — levels -> sessions -> cases (NO solution content).
// hasGuide = a solutions doc exists for that problem.
router.get('/tree', async (req: Request, res: Response) => {
  try {
    const ageGroup = String(req.query?.ageGroup || '11-14');
    const problems = await Models.Problem
      // require level/session/case so a legacy row missing them can't render a "Level NaN" bucket
      .find({ age_group: ageGroup, level_number: { $ne: null }, session_id: { $ne: null }, case_number: { $ne: null } })
      .select('problem_id title difficulty level_number session_id case_number')
      .sort({ level_number: 1, session_id: 1, case_number: 1 })
      .lean<Array<{ problem_id: number; title: string; difficulty: string; level_number: number; session_id: number; case_number: number }>>();

    const withGuide = new Set(
      (await Models.Solution.find({}).select('problem_id').lean<Array<{ problem_id: number }>>())
        .map((s) => s.problem_id)
    );

    // Group: level -> session -> cases[]
    const levels: Record<number, Record<number, any[]>> = {};
    for (const p of problems) {
      (levels[p.level_number] ??= {});
      (levels[p.level_number][p.session_id] ??= []);
      levels[p.level_number][p.session_id].push({
        problem_id: p.problem_id,
        title: p.title,
        difficulty: p.difficulty,
        case_number: p.case_number,
        hasGuide: withGuide.has(p.problem_id),
      });
    }
    const tree = Object.keys(levels).map((lvl) => ({
      level_number: Number(lvl),
      sessions: Object.keys(levels[Number(lvl)]).map((sid) => ({
        session_id: Number(sid),
        cases: levels[Number(lvl)][Number(sid)],
      })),
    }));
    res.json({ ageGroup, tree });
  } catch (error) {
    logger.error('Failed to build curriculum tree', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to load curriculum' });
  }
});

// GET /curriculum/problems/:problemId/guide — the full guide for one case: the Solution PLUS
// the question joined from the Problem. { available: false } when no guide exists yet.
router.get('/problems/:problemId/guide', async (req: Request, res: Response) => {
  try {
    const problemId = parseInt(req.params.problemId, 10);
    if (Number.isNaN(problemId)) return res.status(400).json({ error: 'Invalid problem id' });

    const [problem, solution] = await Promise.all([
      Models.Problem.findOne({ problem_id: problemId })
        .select('problem_id title question difficulty level_number session_id case_number')
        .lean<any>(),
      Models.Solution.findOne({ problem_id: problemId }).lean<any>(),
    ]);
    if (!problem) return res.status(404).json({ error: 'Not Found', message: 'Problem not found' });
    if (!solution) {
      return res.json({ available: false, problem_id: problemId, title: problem.title, question: problem.question });
    }
    res.json({
      available: true,
      problem_id: problemId,
      title: problem.title,
      difficulty: problem.difficulty,
      question: problem.question,
      solution_code: solution.solution_code,
      walkthrough: solution.walkthrough,
      student_explanation: solution.student_explanation,
      worked_example: solution.worked_example,
      key_concepts: solution.key_concepts,
      common_mistakes: solution.common_mistakes,
      verified: solution.verified,
    });
  } catch (error) {
    logger.error('Failed to load guide', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: 'Failed to load guide' });
  }
});

export default router;
