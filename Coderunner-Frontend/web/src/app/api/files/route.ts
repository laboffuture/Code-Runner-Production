import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';

// API endpoint to retrieve file contents from host filesystem
export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const content = await readFile(filePath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to retrieve file'
    }, { status: 500 });
  }
}
