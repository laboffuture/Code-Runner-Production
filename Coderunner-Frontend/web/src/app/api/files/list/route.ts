import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { getUserFilesDir } from '@/lib/utilities/userFiles';

// API endpoint to list all files in user's persistent directory
export async function POST(request: Request) {
  try {
    const { userSessionId } = await request.json();

    // Validate the session id and build the sandbox dir server-side so a
    // crafted session id can't escape into other host directories.
    const persistentDir = getUserFilesDir(userSessionId);
    if (!persistentDir) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    try {
      const fileNames = await readdir(persistentDir);

      const files = await Promise.all(
        fileNames.map(async (name) => {
          const filePath = join(persistentDir, name);
          const stats = await stat(filePath);

          return {
            name,
            size: stats.size,
            path: filePath
          };
        })
      );

      return NextResponse.json({ files });
    } catch (error) {
      // Directory doesn't exist or is empty
      return NextResponse.json({ files: [] });
    }
  } catch (error) {
    console.error('File list error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to list files'
    }, { status: 500 });
  }
}
