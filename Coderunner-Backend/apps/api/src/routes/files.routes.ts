import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Models } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * Per-student file workspace for the File Handling curriculum.
 *
 * Files are created/updated by the runner when a student runs code in a
 * file-handling problem (see docker.executor sync). These routes let the
 * student list, read and delete their own files from the editor's FILES tab.
 * All routes are authenticated and scoped to the caller's userId, so one
 * student can never see or touch another's files.
 */
const router = Router();

// The single workspace scope today. A student shares one file set across all
// file-handling tasks (session_id 37-41).
const SCOPE = 'file-handling' as const;

// A workspace file name is a plain filename — no path separators or traversal.
const FILE_NAME_RE = /^[A-Za-z0-9._-]+$/;
function isValidFileName(name: unknown): name is string {
  return (
    typeof name === 'string' &&
    name.length > 0 &&
    name.length <= 128 &&
    name !== '.' &&
    name !== '..' &&
    FILE_NAME_RE.test(name)
  );
}

/** GET /files — list the caller's workspace files (metadata only). */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const files = await Models.StudentFile.find({ userId, scope: SCOPE })
      .select('fileName size updatedAt')
      .sort({ fileName: 1 })
      .lean<Array<{ fileName: string; size: number; updatedAt: Date }>>();

    res.json({
      files: files.map((f) => ({
        name: f.fileName,
        size: f.size,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error listing student files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

/** GET /files/:name — read one file's content. */
router.get('/:name', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!isValidFileName(name)) {
      return res.status(400).json({ error: 'Invalid file name' });
    }

    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const file = await Models.StudentFile.findOne({ userId, scope: SCOPE, fileName: name })
      .select('fileName content size updatedAt')
      .lean<{ fileName: string; content: string; size: number; updatedAt: Date } | null>();

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ name: file.fileName, content: file.content, size: file.size, updatedAt: file.updatedAt });
  } catch (error) {
    console.error('Error reading student file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

/** DELETE /files/:name — permanently delete one of the caller's files. */
router.delete('/:name', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!isValidFileName(name)) {
      return res.status(400).json({ error: 'Invalid file name' });
    }

    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const result = await Models.StudentFile.deleteOne({ userId, scope: SCOPE, fileName: name });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
