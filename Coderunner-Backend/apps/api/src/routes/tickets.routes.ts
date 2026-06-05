import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Models } from '@code-runner/shared';
import { authMiddleware, staffMiddleware } from '../middleware/auth.middleware';
import { computeTicketDelay } from '../config/oversight.config';

const router = Router();
router.use(authMiddleware);

// A staff member may act on a ticket only if it's theirs to handle:
// developer → any bug_report; teacher → a doubt in a classroom they teach.
async function ownsTicket(req: Request, ticket: any): Promise<boolean> {
  const role = req.user!.role;
  if (ticket.targetRole === 'developer') return role === 'developer';
  if (ticket.targetRole === 'teacher') {
    if (role !== 'teacher') return false;
    if (!ticket.classroomId) return false;
    const me = new mongoose.Types.ObjectId(req.user!.userId);
    return !!(await Models.Classroom.exists({ _id: ticket.classroomId, teacherIds: me }));
  }
  return false;
}

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

// PATCH /tickets/:id/respond — staff claims a ticket and records first response.
router.patch('/:id/respond', staffMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid ticket id' });
    }
    const ticket: any = await Models.Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Not found', message: 'Ticket not found' });
    }
    if (!(await ownsTicket(req, ticket))) {
      return res.status(403).json({ error: 'Forbidden', message: 'Not your ticket' });
    }
    if (ticket.status !== 'open' || ticket.firstResponseAt) {
      return res.status(409).json({ error: 'Conflict', message: 'Already responded' });
    }
    ticket.firstResponseAt = new Date();
    ticket.status = 'in_progress';
    ticket.assignedTo = req.user!.userId;
    await ticket.save();
    return res.json({ id: ticket._id, status: ticket.status });
  } catch (error) {
    console.error('[Tickets] respond failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not respond to ticket' });
  }
});

// PATCH /tickets/:id/resolve — staff closes a ticket (only from in_progress).
router.patch('/:id/resolve', staffMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Bad request', message: 'Invalid ticket id' });
    }
    const ticket: any = await Models.Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Not found', message: 'Ticket not found' });
    }
    if (!(await ownsTicket(req, ticket))) {
      return res.status(403).json({ error: 'Forbidden', message: 'Not your ticket' });
    }
    if (ticket.status !== 'in_progress') {
      return res.status(409).json({ error: 'Conflict', message: 'Resolve only from in_progress' });
    }
    ticket.resolvedAt = new Date();
    ticket.status = 'resolved';
    await ticket.save();
    return res.json({ id: ticket._id, status: ticket.status });
  } catch (error) {
    console.error('[Tickets] resolve failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not resolve ticket' });
  }
});

// GET /tickets/mine — the staff member's work-queue (developer: all bugs; teacher: doubts in my classrooms).
router.get('/mine', staffMiddleware, async (req: Request, res: Response) => {
  try {
    const me = new mongoose.Types.ObjectId(req.user!.userId);
    let filter: any;
    if (req.user!.role === 'developer') {
      filter = { targetRole: 'developer' };
    } else { // teacher
      const myClassIds = await Models.Classroom.find({ teacherIds: me }).distinct('_id');
      filter = { targetRole: 'teacher', classroomId: { $in: myClassIds } };
    }
    const tickets: any[] = await Models.Ticket.find(filter).sort({ createdAt: -1 }).limit(200)
      .populate('createdBy', 'username').populate('classroomId', 'name').lean();
    const rows = tickets.map((t: any) => ({
      id: String(t._id), type: t.type, status: t.status, targetRole: t.targetRole,
      title: t.title, description: t.description,
      student: t.createdBy?.username ?? 'Unknown', classroom: t.classroomId?.name ?? null,
      createdAt: t.createdAt, ...computeTicketDelay(t),
    }));
    return res.json({ tickets: rows });
  } catch (error) {
    console.error('[Tickets] mine failed:', error);
    return res.status(500).json({ error: 'Internal error', message: 'Could not load tickets' });
  }
});

export default router;
