'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store';
import { initSyncEngine } from '@/lib/sync';
import { AnimatedLeaderboard } from '@/components/leaderboard/AnimatedLeaderboard';
import { NavigationHeader } from '@/components/ui/NavigationHeader';
import { ParticleCanvas } from '@/components/background/ParticleCanvas';
import { CircularTimer } from '@/components/game/CircularTimer';
import { Sparkles, Heart, Flame, Zap, Trophy, Users } from 'lucide-react';

export default function AudienceSpectatorPage() {
  const store = useQuizStore();

  useEffect(() => {
    initSyncEngine();
  }, []);

  const currentMedia = store.mediaList[store.currentQuestionIndex];
  const cheerEmojis = ['🔥', '🤖', '📸', '👏', '🎉', '⚡', '🏆', '💎'];

  const triggerCheer = (emoji: string) => {
    store.addReaction(emoji);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans">
      <ParticleCanvas />
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 relative z-10 space-y-8">
        {/* Spectator Top Banner */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          <div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit mb-1">
              <Users className="w-3.5 h-3.5" /> LIVE AUDIENCE SPECTATOR MODE
            </span>
            <h1 className="text-3xl font-black font-display text-white">
              {store.quizTitle}
            </h1>
          </div>

          <CircularTimer
            remainingSeconds={store.timerRemaining}
            totalSeconds={store.settings.questionDuration}
          />
        </div>

        {/* Live Reaction Cheer Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl text-center space-y-3 shadow-xl">
          <div className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> CHEER FOR YOUR FAVORITE TEAM! (TAP TO SEND REACTION)
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {cheerEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => triggerCheer(emoji)}
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-gradient-to-tr hover:from-cyan-500 hover:to-blue-600 border border-slate-700 text-3xl flex items-center justify-center shadow-lg cursor-pointer transition-all"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Floating Reactions Canvas Layer */}
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          <AnimatePresence>
            {store.reactions.slice(-15).map((r) => (
              <motion.div
                key={r.id}
                initial={{ y: 300, opacity: 1, scale: 0.8, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 100 : 500) }}
                animate={{ y: -400, opacity: 0, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: 'easeOut' }}
                className="absolute bottom-10 text-6xl drop-shadow-[0_0_20px_rgba(0,243,255,0.8)]"
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Audience Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question Media Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question #{store.currentQuestionIndex + 1} Media Feed
              </span>

              {currentMedia && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black h-72 flex items-center justify-center">
                  {currentMedia.type === 'IMAGE' ? (
                    <img src={currentMedia.url} alt={currentMedia.title} className="w-full h-full object-cover" />
                  ) : (
                    <video src={currentMedia.url} autoPlay loop muted className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <h3 className="text-2xl font-black text-white font-display">{currentMedia?.title}</h3>
            </div>
          </div>

          {/* Real-time Standings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <AnimatedLeaderboard teams={store.teams} />
          </div>
        </div>
      </main>
    </div>
  );
}
