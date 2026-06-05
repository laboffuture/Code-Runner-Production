import { Router, Request, Response } from 'express';
import { Models } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

// POST /tickets — a student raises a bug report (→ developer) or a doubt (→ teacher).
// Scope (createdBy, classroomId) and targetRole are stamped SERVER-SIDE.
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden', message: 'Students only' });
    }
    const { type, title, description } = req.body ?? {};
    if (type !== 'bug_report' && type !== 'doubt') {
      return res.status(400).json({ error: 'Bad request', message: 'type must be bug_report or doubt' });
    }
    if (!title || !description || typeof title !== 'string' || typeof description !== 'string') {
      return res.status(400).json({ error: 'Bad request', message: 'title and description are required' });
    }
    const student: any = await Models.User.findById(req.user.userId).select('classroomId').lean();
    const targetRole = type === 'bug_report' ? 'developer' : 'teacher';
    const ticket = await Models.Ticket.create({
      type,
      targetRole,
      status: 'open',
      createdBy: req.user.userId,
      classroomId: student?.classroomId ?? null,
      title: title.slice(0, 140),
      description: description.slice(0, 4000),
    });
    return res.status(201).json({ id: ticket._id, status: ticket.status });
  } catch (error) {
    console.error('[Tickets] create failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not create ticket' });
  }
});

export default router;
