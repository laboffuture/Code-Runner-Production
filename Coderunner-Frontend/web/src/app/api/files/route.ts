import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolveSafeUserFile } from '@/lib/utilities/userFiles';

// Read a file from a user's per-session sandbox directory.
// SECURITY: the path is built server-side from (userSessionId, fileName) and
// confined to <tmpdir>/user_files_<userSessionId>. Arbitrary absolute paths
// from the client are no longer honored (was: unauthenticated arbitrary read).
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

    const content = await readFile(filePath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('File retrieval error:', error);
    // Do not echo the raw fs error (it can leak host paths) — return a generic message.
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}
