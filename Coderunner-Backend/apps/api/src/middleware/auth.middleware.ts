import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthToken } from '@code-runner/shared';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthToken;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

// Developer-only middleware (must be used after authMiddleware).
// Gates the infrastructure/monitoring dashboard — the dev team only.
export function developerMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'developer') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Developer access required',
    });
  }
  next();
}

// Teacher-only middleware (must be used after authMiddleware).
// Gates the classroom-insight area — teachers only.
export function teacherMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Teacher access required',
    });
  }
  next();
}

// Staff-only middleware (must be used after authMiddleware).
// Gates curriculum / answer-key endpoints to teacher OR developer — never students.
export function staffMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'developer')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Staff access required',
    });
  }
  next();
}

// Admin-only middleware (must be used after authMiddleware).
// Gates the admin oversight tier — the platform admin only. Re-verifies the
// role against the DB because this is the highest-privilege credential and the
// JWT role is otherwise trusted for the full token lifetime.
export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
  }
  try {
    const { Models } = await import('@code-runner/shared');
    const fresh: any = await Models.User.findById(req.user.userId).select('role').lean();
    if (!fresh || fresh.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    }
    next();
  } catch {
    return res.status(500).json({ error: 'Internal error', message: 'Role verification failed' });
  }
}

// Optional auth middleware (doesn't fail if no token)
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      req.user = verifyToken(token);
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
}
