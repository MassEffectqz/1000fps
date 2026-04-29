import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads');

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = join(UPLOAD_DIR, ...path);

    if (!filePath.startsWith(UPLOAD_DIR)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const file = await readFile(filePath);
    const ext = path[path.length - 1].split('.').pop()?.toLowerCase() || '';
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}