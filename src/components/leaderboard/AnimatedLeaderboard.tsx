'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team } from '@/types/quiz';
import { Trophy, Flame, Zap, Clock, ArrowLeft, Play } from 'lucide-react';
import { useQuizStore } from '@/lib/store';

interface AnimatedLeaderboardProps {
  teams: Team[];
  highlightTopCount?: number;
}

export const AnimatedLeaderboard: React.FC<AnimatedLeaderboardProps> = ({
  teams,
  highlightTopCount = 3,
}) => {
  const resumeGameFromLeaderboard = useQuizStore((s) => s.resumeGameFromLeaderboard);
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const highestScore = Math.max(...sortedTeams.map((t) => t.score), 1);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 font-sans">
      {/* Top Action Bar with Back to Game Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <button
          onClick={resumeGameFromLeaderboard}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-extrabold text-sm text-slate-950 flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" /> BACK TO GAME / CONTINUE QUIZ
        </button>

        <span className="text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          REAL-TIME RANKING
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-300 to-purple-400 font-display flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          LIVE LEADERBOARD
        </h2>
      </div>

      <AnimatePresence>
        {sortedTeams.map((team, index) => {
          const percentage = Math.round((team.score / highestScore) * 100);
          const totalAnswers = team.correctAnswers + team.wrongAnswers;
          const avgSpeed = totalAnswers > 0 ? (team.totalTimeMs / totalAnswers / 1000).toFixed(1) : '0.0';

          return (
            <motion.div
              key={team.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 ${
                index === 0
                  ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.25)]'
                  : index === 1
                  ? 'bg-gradient-to-r from-slate-300/20 via-slate-400/10 to-transparent border-slate-300/50 shadow-[0_0_20px_rgba(203,213,225,0.15)]'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-800/20 via-orange-900/10 to-transparent border-amber-700/50 shadow-[0_0_20px_rgba(180,83,9,0.15)]'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg ${
                    index === 0
                      ? 'bg-amber-400 text-slate-950 shadow-amber-400/50'
                      : index === 1
                      ? 'bg-slate-300 text-slate-950 shadow-slate-300/50'
                      : index === 2
                      ? 'bg-amber-700 text-white shadow-amber-700/50'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  #{index + 1}
                </div>

                <div className="text-3xl">{team.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-white font-display truncate">
                      {team.name}
                    </span>

                    {team.streak >= 2 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
                        <Flame className="w-3.5 h-3.5 fill-red-400" />
                        {team.streak} STREAK
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-medium">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Zap className="w-3.5 h-3.5" />
                      {team.correctAnswers} Correct
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {avgSpeed}s avg
                    </span>
                  </div>
                </div>

                <div className="text-right font-display">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300">
                    {team.score}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Points
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-60"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Bottom Action Bar */}
      <div className="pt-4 text-center">
        <button
          onClick={resumeGameFromLeaderboard}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-extrabold text-base text-slate-950 inline-flex items-center gap-2 shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3]" /> RETURN & CONTINUE QUIZ
        </button>
      </div>
    </div>
  );
};
