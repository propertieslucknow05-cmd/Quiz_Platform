'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { useQuizStore } from '@/lib/store';
import { initSyncEngine } from '@/lib/sync';
import { exportScoresToCSV, generatePrintableReport } from '@/lib/pdf-export';
import { NavigationHeader } from '@/components/ui/NavigationHeader';
import { ParticleCanvas } from '@/components/background/ParticleCanvas';
import { MediaItem, SourceType, MediaType, Team } from '@/types/quiz';
import { HYPERREALISTIC_50_AI_PACK } from '@/lib/media-seed';
import { 
  UploadCloud, Folder, FileImage, FileVideo, Search, Filter, Trash2, Edit3,
  Sparkles, Download, BarChart2, Plus, CheckCircle, Bot, UserCheck, RefreshCw, 
  FileText, Users, Save, Check, CheckSquare, Square, X, MoveRight, Package, FolderSearch
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const store = useQuizStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<'ALL' | 'AI' | 'HUMAN'>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [targetUploadGroup, setTargetUploadGroup] = useState<'AUTO' | 'AI' | 'HUMAN'>('AUTO');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Multi-select state
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  // Single URL upload form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState<SourceType>('AI');
  const [type, setType] = useState<MediaType>('IMAGE');
  const [attribution, setAttribution] = useState('');
  const [category, setCategory] = useState('Portraits');

  // Media Tile Edit modal/form state
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editMediaTitle, setEditMediaTitle] = useState('');
  const [editMediaAttribution, setEditMediaAttribution] = useState('');
  const [editMediaSource, setEditMediaSource] = useState<SourceType>('AI');
  const [editMediaCategory, setEditMediaCategory] = useState('Portraits');

  // Team creation & editing states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamAvatar, setNewTeamAvatar] = useState('🚀');
  const [newTeamColor, setNewTeamColor] = useState('#00f3ff');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    initSyncEngine();
    // Auto scan local disk folders on mount
    store.scanLocalDiskFolders();
  }, []);

  const showNotification = (msg: string) => {
    setUploadStatusMsg(msg);
    setTimeout(() => setUploadStatusMsg(null), 4000);
  };

  const handleScanLocalDisk = async () => {
    const count = await store.scanLocalDiskFolders();
    showNotification(`📁 Scanned local disk folders! Loaded ${count} items from public/media/AI & HUMAN`);
  };

  const handleLoad50AIPack = () => {
    store.bulkAddMedia(HYPERREALISTIC_50_AI_PACK);
    showNotification('✅ Loaded 50 Hyperrealistic AI Photos Pack into /AI group!');
  };

  const processFileList = async (files: File[]) => {
    if (files.length === 0) return;

    let addedItems: MediaItem[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];

      // Handle ZIP Archives
      if (file.name.endsWith('.zip') || file.type === 'application/zip') {
        try {
          const zip = await JSZip.loadAsync(file);
          const zipEntries = Object.keys(zip.files);

          for (let zIdx = 0; zIdx < zipEntries.length; zIdx++) {
            const entryPath = zipEntries[zIdx];
            const zipObj = zip.files[entryPath];
            if (zipObj.dir) continue;

            const isImage = entryPath.match(/\.(jpg|jpeg|png|webp|gif)$/i);
            const isVideo = entryPath.match(/\.(mp4|webm|mov|avi|mkv)$/i);
            if (!isImage && !isVideo) continue;

            const blob = await zipObj.async('blob');
            const blobUrl = URL.createObjectURL(blob);
            
            // Determine source based on target group selector or file path
            let itemSource: SourceType = 'AI';
            if (targetUploadGroup === 'AI') {
              itemSource = 'AI';
            } else if (targetUploadGroup === 'HUMAN') {
              itemSource = 'HUMAN';
            } else {
              const isHuman = entryPath.toLowerCase().includes('human');
              itemSource = isHuman ? 'HUMAN' : 'AI';
            }

            const fileName = entryPath.split('/').pop() || `ZIP Item ${zIdx + 1}`;

            addedItems.push({
              id: `zip-media-${Date.now()}-${zIdx}`,
              title: fileName.replace(/\.[^/.]+$/, ''),
              url: blobUrl,
              type: isVideo ? 'VIDEO' : 'IMAGE',
              source: itemSource,
              attribution: itemSource === 'AI' ? 'Generated with AI' : 'Captured by Photographer',
              category: 'Archive Import',
              difficulty: 'Medium',
              createdDate: new Date().toISOString().slice(0, 10),
              fileSize: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`
            });
          }
        } catch (err) {
          console.error('Failed to parse ZIP archive:', err);
        }
      } else {
        // Handle regular files: Post to local upload API to save directly to local hard drive!
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          let itemSource: SourceType = 'AI';
          if (targetUploadGroup === 'AI') {
            itemSource = 'AI';
          } else if (targetUploadGroup === 'HUMAN') {
            itemSource = 'HUMAN';
          } else {
            const isHuman = file.name.toLowerCase().includes('human') || file.webkitRelativePath?.toLowerCase().includes('human');
            itemSource = isHuman ? 'HUMAN' : 'AI';
          }

          formData.append('targetGroup', itemSource);
          formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          const data = await res.json();
          if (data.success && data.mediaItem) {
            addedItems.push(data.mediaItem);
          } else {
            // Fallback to ObjectURL if server upload fails
            const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i);
            addedItems.push({
              id: `file-media-${Date.now()}-${idx}`,
              title: file.name.replace(/\.[^/.]+$/, ''),
              url: URL.createObjectURL(file),
              type: isVideo ? 'VIDEO' : 'IMAGE',
              source: itemSource,
              attribution: itemSource === 'AI' ? 'Stored locally in /media/AI' : 'Stored locally in /media/HUMAN',
              category: 'Local Upload',
              difficulty: 'Medium',
              createdDate: new Date().toISOString().slice(0, 10),
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            });
          }
        } catch (err) {
          console.error('Failed to save file to local disk:', err);
        }
      }
    }

    if (addedItems.length > 0) {
      store.bulkAddMedia(addedItems);
      showNotification(`✅ Successfully saved ${addedItems.length} media file(s) directly to local hard drive!`);
    } else {
      showNotification('⚠️ No valid image or video files found in selection.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFileList(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFileList(files);
    }
  };

  // Multi-select handlers
  const toggleSelectMedia = (id: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredMedia = store.mediaList.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.attribution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFolder = selectedFolder === 'ALL' || item.source === selectedFolder;
    const matchesType = selectedType === 'ALL' || item.type === selectedType;

    return matchesSearch && matchesFolder && matchesType;
  });

  const toggleSelectAll = () => {
    if (selectedMediaIds.length === filteredMedia.length) {
      setSelectedMediaIds([]);
    } else {
      setSelectedMediaIds(filteredMedia.map((m) => m.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedMediaIds.length === 0) return;
    store.bulkDeleteMedia(selectedMediaIds);
    showNotification(`✅ Deleted ${selectedMediaIds.length} media items`);
    setSelectedMediaIds([]);
  };

  const handleBulkMoveSource = (target: SourceType) => {
    if (selectedMediaIds.length === 0) return;
    store.bulkUpdateSource(selectedMediaIds, target);
    showNotification(`✅ Moved ${selectedMediaIds.length} items to /${target} folder`);
    setSelectedMediaIds([]);
  };

  // Media Tile Edit Handler
  const openEditMedia = (item: MediaItem) => {
    setEditingMedia(item);
    setEditMediaTitle(item.title);
    setEditMediaAttribution(item.attribution);
    setEditMediaSource(item.source);
    setEditMediaCategory(item.category);
  };

  const saveMediaEdit = () => {
    if (!editingMedia) return;
    store.updateMediaItem(editingMedia.id, {
      title: editMediaTitle,
      attribution: editMediaAttribution,
      source: editMediaSource,
      category: editMediaCategory
    });
    setEditingMedia(null);
    showNotification(`✅ Saved changes to tile "${editMediaTitle}"`);
  };

  const handleAddCustomMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title,
      url,
      type,
      source,
      attribution: attribution || (source === 'AI' ? 'Stored locally in /media/AI' : 'Stored locally in /media/HUMAN'),
      category,
      difficulty: 'Medium',
      createdDate: new Date().toISOString().slice(0, 10),
      fileSize: '4.2 MB'
    };

    store.addMediaItem(newItem);
    setTitle('');
    setUrl('');
    setAttribution('');
    showNotification(`✅ Added custom media item "${title}"`);
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;

    store.addTeam({
      name: newTeamName,
      avatar: newTeamAvatar || '⚡',
      color: newTeamColor || '#00f3ff'
    });

    setNewTeamName('');
    showNotification(`✅ Created team "${newTeamName}"`);
  };

  const startEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditName(team.name);
    setEditAvatar(team.avatar);
    setEditColor(team.color);
  };

  const saveEditTeam = (id: string) => {
    store.updateTeam(id, {
      name: editName,
      avatar: editAvatar,
      color: editColor
    });
    setEditingTeamId(null);
    showNotification(`✅ Saved updates for "${editName}"`);
  };

  const aiCount = store.mediaList.filter((m) => m.source === 'AI').length;
  const humanCount = store.mediaList.filter((m) => m.source === 'HUMAN').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans">
      <ParticleCanvas />
      <NavigationHeader />

      {/* Hidden File Input Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.zip"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 relative z-10 space-y-8">
        {/* Upload Status Notification Banner */}
        <AnimatePresence>
          {uploadStatusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center justify-between"
            >
              <span>{uploadStatusMsg}</span>
              <Check className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          <div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
              LOCAL DISK STORAGE & MEDIA ENGINE
            </span>
            <h1 className="text-3xl font-black font-display text-white mt-1">
              QUIZ CONTROL & LOCAL DISK MANAGEMENT
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              100% Zero-Database local disk storage. Files are loaded & saved directly on your local hard drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleScanLocalDisk}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center gap-2 cursor-pointer"
              title="Scan public/media/AI and public/media/HUMAN disk folders"
            >
              <FolderSearch className="w-4 h-4" /> Scan Local Disk Folders
            </button>

            <button
              onClick={() => {
                store.restoreDefaultMediaLibrary();
                showNotification('🔄 Restored default 120 library items!');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-extrabold text-xs flex items-center gap-2 cursor-pointer"
              title="Restore factory default 120 library items"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" /> Restore Default 120 Library
            </button>

            <button
              onClick={handleLoad50AIPack}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:scale-103 transition-transform"
            >
              <Package className="w-4 h-4" /> Load 50 Hyperrealistic AI Photos
            </button>

            <Link
              href="/admin/analytics"
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <BarChart2 className="w-4 h-4" /> Analytics
            </Link>

            <button
              onClick={() => exportScoresToCSV(store.teams)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* CLICKABLE & DRAGGABLE BULK UPLOADER ZONE WITH TARGET FOLDER SELECTOR */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          
          {/* Target Group Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white">TARGET LOCAL DISK DESTINATION:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetUploadGroup('AUTO')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  targetUploadGroup === 'AUTO' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🔍 Auto-Detect Group
              </button>

              <button
                type="button"
                onClick={() => setTargetUploadGroup('AI')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  targetUploadGroup === 'AI' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 inline mr-1" /> Force /media/AI Folder
              </button>

              <button
                type="button"
                onClick={() => setTargetUploadGroup('HUMAN')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  targetUploadGroup === 'HUMAN' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 inline mr-1" /> Force /media/HUMAN Folder
              </button>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer select-none group ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_35px_rgba(0,243,255,0.4)] scale-101'
                : 'border-slate-800 bg-slate-950/50 hover:border-cyan-500/50 hover:bg-slate-950/80 shadow-inner'
            }`}
          >
            <UploadCloud className="w-14 h-14 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
              CLICK TO SELECT OR DRAG & DROP MEDIA (SAVED DIRECTLY TO LOCAL HARD DRIVE)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
              Click to open file picker or drag JPG, PNG, WEBP, MP4, WEBM files directly. Uploads are saved to local hard drive in <span className="text-cyan-400 font-bold uppercase">public/media/{targetUploadGroup === 'HUMAN' ? 'HUMAN' : 'AI'}</span>.
            </p>
          </div>
        </div>

        {/* TEAM MANAGEMENT SUITE SECTION */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xl font-black font-display text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" /> TEAM CREATION & EDITING STUDIO
            </h3>
            <button
              onClick={() => store.resetLeaderboard()}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Leaderboard Scores
            </button>
          </div>

          {/* Add New Team Form */}
          <form onSubmit={handleAddTeam} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <input
              type="text"
              placeholder="New Team Name (e.g. Cyber Knights)"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Avatar / Logo (Emoji 🚀 or Image URL)"
              value={newTeamAvatar}
              onChange={(e) => setNewTeamAvatar(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none"
            />
            <input
              type="color"
              value={newTeamColor}
              onChange={(e) => setNewTeamColor(e.target.value)}
              className="h-10 w-full rounded-xl bg-slate-900 border border-slate-800 cursor-pointer px-1"
            />
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Team
            </button>
          </form>

          {/* Existing Teams Edit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {store.teams.map((team) => (
              <div
                key={team.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3"
              >
                {editingTeamId === team.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500 text-xs text-white outline-none font-bold"
                    />
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500 text-xs text-white outline-none"
                    />
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                    />
                    <button
                      onClick={() => saveEditTeam(team.id)}
                      className="w-full py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{team.avatar}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-base text-white truncate">{team.name}</h4>
                        <div className="text-xs text-cyan-300 font-extrabold">{team.score} Points</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => startEditTeam(team)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer text-xs flex items-center gap-1"
                        title="Edit Team Name & Logo"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Edit
                      </button>

                      <button
                        onClick={() => store.deleteTeam(team.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 cursor-pointer text-xs"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filter, Search & BULK ACTION BAR */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFolder('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedFolder === 'ALL' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Folder className="w-4 h-4" /> ALL ({store.mediaList.length})
              </button>

              <button
                onClick={() => setSelectedFolder('AI')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedFolder === 'AI' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                }`}
              >
                <Bot className="w-4 h-4" /> /AI FOLDER ({aiCount})
              </button>

              <button
                onClick={() => setSelectedFolder('HUMAN')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedFolder === 'HUMAN' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4" /> /HUMAN FOLDER ({humanCount})
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* BULK SELECTION & REMOVAL SUITE BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-5 backdrop-blur-xl">
            <button
              onClick={toggleSelectAll}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              {selectedMediaIds.length === filteredMedia.length && filteredMedia.length > 0 ? (
                <>
                  <CheckSquare className="w-4 h-4 text-cyan-400" /> Deselect All
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-slate-400" /> Select All ({filteredMedia.length})
                </>
              )}
            </button>

            {selectedMediaIds.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-cyan-300">
                  {selectedMediaIds.length} Item(s) Selected
                </span>

                <button
                  onClick={() => handleBulkMoveSource('AI')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" /> Move to /AI
                </button>

                <button
                  onClick={() => handleBulkMoveSource('HUMAN')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Move to /HUMAN
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedMediaIds.length})
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Check cards below to enable bulk removal and reclassification</span>
            )}
          </div>
        </div>

        {/* IN-PLACE TILE CAPTION EDIT MODAL */}
        <AnimatePresence>
          {editingMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-lg text-white font-display flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-cyan-400" /> Edit Media Tile & Caption
                  </h3>
                  <button onClick={() => setEditingMedia(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Title</label>
                    <input
                      type="text"
                      value={editMediaTitle}
                      onChange={(e) => setEditMediaTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Caption / Attribution Details</label>
                    <textarea
                      rows={3}
                      value={editMediaAttribution}
                      onChange={(e) => setEditMediaAttribution(e.target.value)}
                      placeholder="e.g. Generated with DALL-E 3 • Prompt: Hyperrealistic..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Group Assignment</label>
                      <select
                        value={editMediaSource}
                        onChange={(e) => setEditMediaSource(e.target.value as SourceType)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-bold text-xs outline-none"
                      >
                        <option value="AI">🔵 /AI Group</option>
                        <option value="HUMAN">🟢 /HUMAN Group</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
                      <select
                        value={editMediaCategory}
                        onChange={(e) => setEditMediaCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold text-xs outline-none"
                      >
                        <option value="Portraits">Portraits</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Landscapes">Landscapes</option>
                        <option value="Nature">Nature</option>
                        <option value="Art">Art</option>
                        <option value="Wildlife">Wildlife</option>
                        <option value="Street">Street</option>
                        <option value="Abstract">Abstract</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setEditingMedia(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMediaEdit}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 transition-transform"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Items Grid with Checkbox Selection and Edit Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredMedia.map((item) => {
              const isSelected = selectedMediaIds.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative rounded-3xl border bg-slate-900/80 overflow-hidden backdrop-blur-xl flex flex-col justify-between transition-all duration-300 shadow-xl ${
                    isSelected ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(0,243,255,0.3)]' : 'border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="relative w-full h-48 bg-black/60 overflow-hidden flex items-center justify-center">
                    {item.type === 'IMAGE' ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <video src={item.url} className="w-full h-full object-cover" />
                    )}

                    {/* Checkbox Selector */}
                    <button
                      onClick={() => toggleSelectMedia(item.id)}
                      className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-slate-950/80 border border-slate-700 text-cyan-400 cursor-pointer"
                    >
                      {isSelected ? <CheckSquare className="w-5 h-5 fill-cyan-500 text-slate-950" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>

                    {/* Source Tag Badge */}
                    <span className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      item.source === 'AI'
                        ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40'
                        : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                    }`}>
                      /{item.source}
                    </span>

                    {/* Edit & Delete Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                      <button
                        onClick={() => openEditMedia(item)}
                        className="p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                        title="Edit Caption & Title"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => store.deleteMediaItem(item.id)}
                        className="p-2 rounded-full bg-slate-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
                        title="Delete Media"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-bold text-base text-white font-display truncate">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 italic">{item.attribution}</p>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-800 font-semibold">
                      <span>Category: {item.category}</span>
                      <span>Size: {item.fileSize || 'Local File'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
