import { MediaItem } from '@/types/quiz';

// Helper to generate curated media library of 100 images and 20 videos
const categories = ['Portraits', 'Architecture', 'Landscapes', 'Nature', 'Art', 'Wildlife', 'Street', 'Sci-Fi', 'Food', 'Abstract'];
const aiTools = ['Midjourney v6.1', 'Flux.1 Dev', 'DALL-E 3', 'Stable Diffusion 3', 'Firefly v3', 'Leonardo AI', 'Ideogram v2'];
const humanAttributions = [
  'Shot by Photographer Marco Rossi on Leica M11',
  'Shot by NatGeo Explorer Sarah Jenkins on Sony A7R V',
  'Shot by Architectural Photographer David Chen on Canon EOS R5',
  'Shot by Fine Art Photographer Henri Dupont on Hasselblad H6D',
  'Captured on 35mm Film, Vintage Kodachrome 64',
  'Shot by Wildlife Photographer Elena Rostova on Nikon Z9'
];

const sampleImageUrlsAI = [
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop'
];

const sampleImageUrlsHuman = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop'
];

const sampleVideoUrlsAI = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
];

const sampleVideoUrlsHuman = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2013.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
];

function generate120Items(): MediaItem[] {
  const list: MediaItem[] = [];

  // Generate 100 Images (50 AI, 50 Human)
  for (let i = 1; i <= 100; i++) {
    const isAI = i % 2 !== 0;
    const cat = categories[i % categories.length];
    const url = isAI 
      ? sampleImageUrlsAI[(i - 1) % sampleImageUrlsAI.length] 
      : sampleImageUrlsHuman[(i - 1) % sampleImageUrlsHuman.length];
    
    const tool = aiTools[i % aiTools.length];
    const photographer = humanAttributions[i % humanAttributions.length];

    list.push({
      id: `img-${i}`,
      title: `${isAI ? 'Synthetic AI' : 'Human Masterpiece'} ${cat} #${i}`,
      url,
      type: 'IMAGE',
      source: isAI ? 'AI' : 'HUMAN',
      attribution: isAI ? `Generated with ${tool}` : photographer,
      prompt: isAI ? `Hyperrealistic ${cat.toLowerCase()} composition, 8k resolution, cinematic Octane render --ar 16:9` : undefined,
      category: cat,
      difficulty: i % 3 === 0 ? 'Hard' : i % 2 === 0 ? 'Medium' : 'Easy',
      createdDate: '2026-07-28',
      fileSize: `${(3.0 + (i % 5) * 0.8).toFixed(1)} MB`
    });
  }

  // Generate 20 Videos (10 AI, 10 Human)
  for (let v = 1; v <= 20; v++) {
    const isAI = v % 2 !== 0;
    const cat = categories[v % categories.length];
    const url = isAI
      ? sampleVideoUrlsAI[(v - 1) % sampleVideoUrlsAI.length]
      : sampleVideoUrlsHuman[(v - 1) % sampleVideoUrlsHuman.length];

    list.push({
      id: `vid-${v}`,
      title: `${isAI ? 'OpenAI Sora Video' : '4K Cinema Video'} #${v}`,
      url,
      type: 'VIDEO',
      source: isAI ? 'AI' : 'HUMAN',
      attribution: isAI ? 'Generated with OpenAI Sora v2 Cinema' : 'Filmed by BBC Wildlife 8K Cinema Crew',
      prompt: isAI ? 'Photorealistic 4k slow motion footage with fluid dynamics simulation' : undefined,
      category: cat,
      difficulty: v % 3 === 0 ? 'Hard' : 'Medium',
      createdDate: '2026-07-28',
      fileSize: `${(15.0 + (v % 5) * 4.0).toFixed(1)} MB`
    });
  }

  return list;
}

export const SEED_MEDIA_ITEMS: MediaItem[] = generate120Items();
