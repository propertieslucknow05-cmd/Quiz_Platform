import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MediaItem, SourceType } from '@/types/quiz';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetGroup = (formData.get('targetGroup') as SourceType) || 'AI';
    const customTitle = formData.get('title') as string | null;
    const customCategory = formData.get('category') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save destination folder on local hard drive
    const destFolder = targetGroup === 'HUMAN' ? 'HUMAN' : 'AI';
    const targetDir = path.join(process.cwd(), 'public', 'media', destFolder);

    await fs.mkdir(targetDir, { recursive: true });

    // Clean filename
    const sanitizedFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(targetDir, sanitizedFileName);

    // Write file directly to local disk
    await fs.writeFile(filePath, buffer);

    const isVideo = file.type.startsWith('video/') || sanitizedFileName.match(/\.(mp4|webm|mov|mkv)$/i);
    const localUrl = `/media/${destFolder}/${sanitizedFileName}`;

    const newItem: MediaItem = {
      id: `local-file-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: customTitle || file.name.replace(/\.[^/.]+$/, ''),
      url: localUrl,
      type: isVideo ? 'VIDEO' : 'IMAGE',
      source: targetGroup,
      attribution: targetGroup === 'AI' ? 'Saved locally in /media/AI' : 'Saved locally in /media/HUMAN',
      category: customCategory || 'Local Upload',
      difficulty: 'Medium',
      createdDate: new Date().toISOString().slice(0, 10),
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };

    return NextResponse.json({
      success: true,
      mediaItem: newItem
    });
  } catch (error) {
    console.error('Local upload error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
