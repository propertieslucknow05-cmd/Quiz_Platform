import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid URL provided' }, { status: 400 });
    }

    // Only attempt disk unlink for local /media/ files
    if (url.startsWith('/media/')) {
      const relativePath = url.replace(/^\//, '');
      const filePath = path.join(process.cwd(), 'public', relativePath);

      try {
        await fs.unlink(filePath);
        console.log(`Successfully unlinked file from disk: ${filePath}`);
      } catch (unlinkErr) {
        console.warn(`File unlink notice (${filePath}):`, unlinkErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media API error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
