import { join, resolve, sep } from 'path';
import { tmpdir } from 'os';

/**
 * Security helper for the /api/files* routes.
 *
 * These routes previously accepted an arbitrary absolute `filePath` from the
 * client and called readFile/unlink on it — i.e. unauthenticated arbitrary
 * file read/delete on the host. To prevent that, all file operations are now
 * confined to a single per-session sandbox directory:
 *
 *     <tmpdir>/user_files_<userSessionId>/<fileName>
 *
 * Both the session id and the file name are strictly validated, and the final
 * resolved path is checked to be inside the sandbox (defends against `..`
 * traversal, absolute paths, and symlink-style escapes via path.resolve).
 */

// Session ids are generated client-side as `session_<ts>_<rand>` — restrict to
// a safe alphabet so they can never contain path separators or traversal.
const SESSION_ID_RE = /^[A-Za-z0-9_-]+$/;

export function getUserFilesDir(userSessionId: string): string | null {
  if (typeof userSessionId !== 'string' || !SESSION_ID_RE.test(userSessionId)) {
    return null;
  }
  return join(tmpdir(), `user_files_${userSessionId}`);
}

/**
 * Resolve a single file inside a session's sandbox directory, or null if the
 * inputs are invalid or the resulting path would escape the sandbox.
 */
export function resolveSafeUserFile(
  userSessionId: string,
  fileName: string
): string | null {
  const baseDir = getUserFilesDir(userSessionId);
  if (!baseDir) return null;

  if (
    typeof fileName !== 'string' ||
    fileName.length === 0 ||
    fileName.includes('/') ||
    fileName.includes('\\') ||
    fileName.includes('\0') ||
    fileName.includes('..')
  ) {
    return null;
  }

  const baseResolved = resolve(baseDir);
  const target = resolve(baseResolved, fileName);

  // Must stay strictly inside the sandbox directory.
  if (target !== baseResolved && !target.startsWith(baseResolved + sep)) {
    return null;
  }

  return target;
}
