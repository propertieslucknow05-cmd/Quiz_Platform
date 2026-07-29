'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tv, Sliders, Shield, Smartphone, Users, Play, Sparkles, Image as ImageIcon, Film, Trophy, Shuffle } from 'lucide-react';
import { useQuizStore } from '@/lib/store';
import { initSyncEngine } from '@/lib/sync';
import { ParticleCanvas } from '@/components/background/ParticleCanvas';
import { NavigationHeader } from '@/components/ui/NavigationHeader';

export default function PortalHomePage() {
  const store = useQuizStore();

  useEffect(() => {
    initSyncEngine();
  }, []);

  const totalImages = store.mediaList.filter((m) => m.type === 'IMAGE').length;
  const totalVideos = store.mediaList.filter((m) => m.type === 'VIDEO').length;
  const totalAI = store.mediaList.filter((m) => m.source === 'AI').length;
  const totalHuman = store.mediaList.filter((m) => m.source === 'HUMAN').length;

  const views = [
    {
      title: 'Stage Arena View',
      description: 'Fullscreen 4K projector view for auditoriums with circular timer, high-res media display, and answer reveals.',
      href: '/arena',
      badge: 'Main Projector Display',
      color: 'from-cyan-500 to-blue-600',
      icon: Tv,
      btnText: 'Open Projector View'
    },
    {
      title: 'Host Control Remote',
      description: 'Real-time remote control to pause, reveal answers, skip questions, adjust timer, and launch leaderboards.',
      href: '/host',
      badge: 'Presenter Remote',
      color: 'from-purple-500 to-indigo-600',
      icon: Sliders,
      btnText: 'Open Host Panel'
    },
    {
      title: 'Admin Studio & Media Manager',
      description: 'Drag & drop media uploader, bulk ZIP import, folder sorting (/AI vs /HUMAN), auto-shuffle engine & analytics reports.',
      href: '/admin',
      badge: 'Management Studio',
      color: 'from-emerald-500 to-teal-600',
      icon: Shield,
      btnText: 'Open Admin Studio'
    },
    {
      title: 'Team Captain Answering Device',
      description: 'Interactive controller for team captains to submit answers (🟢 HUMAN vs 🔵 AI GENERATED) & trigger powerups.',
      href: '/play',
      badge: 'Participant Controller',
      color: 'from-pink-500 to-rose-600',
      icon: Smartphone,
      btnText: 'Join as Team Captain'
    },
    {
      title: 'Audience Spectator View',
      description: 'Live spectator view with real-time reaction emojis, cheering feeds, and leaderboard stream.',
      href: '/audience',
      badge: 'Audience Screen',
      color: 'from-amber-500 to-yellow-600',
      icon: Users,
      btnText: 'Open Spectator View'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans overflow-x-hidden">
      <ParticleCanvas />
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 relative z-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-bold backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            ENTERPRISE LIVE MULTIPLAYER PLATFORM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-500"
          >
            AI <span className="text-cyan-400 font-light">vs</span> HUMAN
          </motion.h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The ultimate live auditorium quiz show experience. Can your teams tell synthetic AI media from real human creation?
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/arena"
              onClick={() => store.startQuiz()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 font-black text-lg text-white shadow-[0_0_35px_rgba(0,243,255,0.4)] hover:scale-105 transition-all flex items-center gap-3"
            >
              <Play className="w-6 h-6 fill-white" /> START LIVE QUIZ NOW
            </Link>

            <button
              onClick={() => store.shuffleMediaList()}
              className="px-6 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-cyan-500 font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-5 h-5 text-cyan-400" /> Auto-Shuffle Engine
            </button>
          </div>
        </div>

        {/* Live Quiz Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-display">{totalImages}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Images</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-display">{totalVideos}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Videos</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-display">{totalAI} AI / {totalHuman} Human</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Media Split</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-display">{store.teams.length} Teams</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Competing Teams</div>
            </div>
          </div>
        </div>

        {/* View Launchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {views.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${v.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                      {v.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black font-display text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                    {v.description}
                  </p>
                </div>

                <Link
                  href={v.href}
                  className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 font-bold text-center text-sm text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {v.btnText} →
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
