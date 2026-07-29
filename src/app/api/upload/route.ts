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

    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv)$/i);
    const mimeType = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');

    // Create Base64 Data URL (Guarantees 100% upload success on Vercel Serverless read-only filesystem!)
    const base64Str = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Str}`;

    let finalUrl = dataUrl;

    // Try writing to local hard drive (Works on local machine / VPS)
    try {
      const destFolder = targetGroup === 'HUMAN' ? 'HUMAN' : 'AI';
      const targetDir = path.join(process.cwd(), 'public', 'media', destFolder);

      await fs.mkdir(targetDir, { recursive: true });

      const sanitizedFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(targetDir, sanitizedFileName);

      await fs.writeFile(filePath, buffer);
      finalUrl = `/media/${destFolder}/${sanitizedFileName}`;
    } catch (diskErr) {
      // Vercel serverless read-only filesystem (/var/task/) detected - fall back to Base64 Data URL!
      console.warn('Vercel read-only filesystem detected, using Base64 Data URL fallback:', diskErr);
      finalUrl = dataUrl;
    }

    const newItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: customTitle || file.name.replace(/\.[^/.]+$/, ''),
      url: finalUrl,
      type: isVideo ? 'VIDEO' : 'IMAGE',
      source: targetGroup,
      attribution: targetGroup === 'AI' ? 'Uploaded AI Content' : 'Uploaded Human Content',
      category: customCategory || 'Uploads',
      difficulty: 'Medium',
      createdDate: new Date().toISOString().slice(0, 10),
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };

    return NextResponse.json({
      success: true,
      mediaItem: newItem
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
