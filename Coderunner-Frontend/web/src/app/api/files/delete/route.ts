import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { resolveSafeUserFile } from '@/lib/utilities/userFiles';

// Delete a file from a user's per-session sandbox directory.
// SECURITY: the path is built server-side from (userSessionId, fileName) and
// confined to <tmpdir>/user_files_<userSessionId>. Arbitrary absolute paths
// from the client are no longer honored (was: unauthenticated arbitrary delete).
export async function POST(request: Request) {
  try {
    const { userSessionId, fileName } = await request.json();

    const filePath = resolveSafeUserFile(userSessionId, fileName);
    if (!filePath) {
      return NextResponse.json(
        { error: 'Invalid session id or file name' },
        { status: 400 }
      );
    }

    await unlink(filePath);

    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
