import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MediaItem } from '@/types/quiz';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov', '.mkv'];

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const aiDir = path.join(publicDir, 'media', 'AI');
    const humanDir = path.join(publicDir, 'media', 'HUMAN');
    const uploadsDir = path.join(publicDir, 'media', 'uploads');

    // Ensure local directories exist on hard drive
    await fs.mkdir(aiDir, { recursive: true });
    await fs.mkdir(humanDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });

    const localMediaItems: MediaItem[] = [];

    // 1. Scan public/media/AI
    try {
      const aiFiles = await fs.readdir(aiDir);
      aiFiles.forEach((file, index) => {
        const ext = path.extname(file).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          const isVideo = ['.mp4', '.webm', '.mov', '.mkv'].includes(ext);
          const cleanName = path.basename(file, ext).replace(/[-_]/g, ' ');
          localMediaItems.push({
            id: `local-ai-${index}-${Date.now()}`,
            title: cleanName || `Local AI Media #${index + 1}`,
            url: `/media/AI/${file}`,
            type: isVideo ? 'VIDEO' : 'IMAGE',
            source: 'AI',
            attribution: 'Stored locally in public/media/AI folder',
            category: 'Local Disk Import',
            difficulty: 'Medium',
            createdDate: new Date().toISOString().slice(0, 10),
            fileSize: 'Local File'
          });
        }
      });
    } catch (err) {
      console.error('Error scanning AI directory:', err);
    }

    // 2. Scan public/media/HUMAN
    try {
      const humanFiles = await fs.readdir(humanDir);
      humanFiles.forEach((file, index) => {
        const ext = path.extname(file).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          const isVideo = ['.mp4', '.webm', '.mov', '.mkv'].includes(ext);
          const cleanName = path.basename(file, ext).replace(/[-_]/g, ' ');
          localMediaItems.push({
            id: `local-human-${index}-${Date.now()}`,
            title: cleanName || `Local Human Media #${index + 1}`,
            url: `/media/HUMAN/${file}`,
            type: isVideo ? 'VIDEO' : 'IMAGE',
            source: 'HUMAN',
            attribution: 'Stored locally in public/media/HUMAN folder',
            category: 'Local Disk Import',
            difficulty: 'Medium',
            createdDate: new Date().toISOString().slice(0, 10),
            fileSize: 'Local File'
          });
        }
      });
    } catch (err) {
      console.error('Error scanning HUMAN directory:', err);
    }

    // 3. Scan public/media/uploads
    try {
      const uploadFiles = await fs.readdir(uploadsDir);
      uploadFiles.forEach((file, index) => {
        const ext = path.extname(file).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          const isVideo = ['.mp4', '.webm', '.mov', '.mkv'].includes(ext);
          const isHuman = file.toLowerCase().includes('human');
          const cleanName = path.basename(file, ext).replace(/[-_]/g, ' ');
          localMediaItems.push({
            id: `local-upload-${index}-${Date.now()}`,
            title: cleanName || `Uploaded Media #${index + 1}`,
            url: `/media/uploads/${file}`,
            type: isVideo ? 'VIDEO' : 'IMAGE',
            source: isHuman ? 'HUMAN' : 'AI',
            attribution: 'Saved locally in public/media/uploads',
            category: 'Uploads',
            difficulty: 'Medium',
            createdDate: new Date().toISOString().slice(0, 10),
            fileSize: 'Local File'
          });
        }
      });
    } catch (err) {
      console.error('Error scanning Uploads directory:', err);
    }

    return NextResponse.json({
      success: true,
      count: localMediaItems.length,
      mediaList: localMediaItems
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
