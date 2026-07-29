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

    const localMediaItems: MediaItem[] = [];

    // Safely try to scan public/media/AI
    try {
      await fs.mkdir(aiDir, { recursive: true });
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
      // Vercel serverless read-only filesystem handling
      console.warn('AI folder scan bypassed on serverless platform:', err);
    }

    // Safely try to scan public/media/HUMAN
    try {
      await fs.mkdir(humanDir, { recursive: true });
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
      console.warn('HUMAN folder scan bypassed on serverless platform:', err);
    }

    // Safely try to scan public/media/uploads
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
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
      console.warn('Uploads folder scan bypassed on serverless platform:', err);
    }

    return NextResponse.json({
      success: true,
      count: localMediaItems.length,
      mediaList: localMediaItems
    });
  } catch (error) {
    return NextResponse.json({ success: true, count: 0, mediaList: [] });
  }
}
