'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Team } from '@/types/quiz';
import { Trophy, Award, Sparkles, Zap, Clock, RotateCcw } from 'lucide-react';
import { useQuizStore } from '@/lib/store';

interface WinnerPodiumProps {
  teams: Team[];
}

export const WinnerPodium: React.FC<WinnerPodiumProps> = ({ teams }) => {
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const runnerUp = sorted[1];
  const thirdPlace = sorted[2];

  useEffect(() => {
    // Launch fireworks & confetti sequence
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00f3ff', '#ff00a0', '#ffe600', '#00ff66']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00f3ff', '#ff00a0', '#ffe600', '#00ff66']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="mb-8"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm tracking-wider uppercase backdrop-blur-md">
          <Sparkles className="w-4 h-4" /> CHAMPIONS ANNOUNCEMENT
        </span>
        <h1 className="text-6xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 mt-3 drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
          VICTORY CELEBRATION
        </h1>
      </motion.div>

      {/* Podium Stage */}
      <div className="flex items-end justify-center gap-6 w-full max-w-4xl mx-auto my-8 min-h-[380px]">
        {/* 2nd Place */}
        {runnerUp && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="text-4xl mb-2 animate-bounce">{runnerUp.avatar}</div>
            <div className="font-bold text-slate-200 text-lg mb-1">{runnerUp.name}</div>
            <div className="text-cyan-400 font-black text-2xl font-display mb-3">{runnerUp.score} pts</div>
            <div className="w-full h-48 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl border-t border-slate-600 flex flex-col items-center justify-center shadow-xl">
              <Award className="w-10 h-10 text-slate-300 mb-1" />
              <span className="font-black text-3xl text-slate-300">2ND</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Winner) */}
        {winner && (
          <motion.div
            initial={{ y: 150, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1.05 }}
            transition={{ type: 'spring', damping: 12, delay: 0.1 }}
            className="flex-1 flex flex-col items-center z-10"
          >
            <div className="relative">
              <Trophy className="w-20 h-20 text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-200 rounded-full opacity-20 blur-xl"
              />
            </div>

            <div className="text-5xl my-2">{winner.avatar}</div>
            <div className="font-extrabold text-2xl text-amber-300 mb-1">{winner.name}</div>
            <div className="text-amber-400 font-black text-4xl font-display mb-4 drop-shadow-md">
              {winner.score} PTS
            </div>

            <div className="w-full h-64 bg-gradient-to-t from-amber-600/90 via-amber-500/80 to-yellow-400/90 rounded-t-3xl border-t-2 border-yellow-200 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)] p-4 text-slate-950">
              <Sparkles className="w-12 h-12 text-slate-950 mb-2" />
              <span className="font-black text-5xl">1ST</span>
              <span className="font-bold text-xs uppercase tracking-widest mt-1 opacity-90">GRAND CHAMPION</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex-1 flex flex-col items-center"
          >
            <div className="text-4xl mb-2">{thirdPlace.avatar}</div>
            <div className="font-bold text-slate-300 text-lg mb-1">{thirdPlace.name}</div>
            <div className="text-amber-500 font-black text-2xl font-display mb-3">{thirdPlace.score} pts</div>
            <div className="w-full h-36 bg-gradient-to-t from-amber-900/90 to-amber-800/80 rounded-t-2xl border-t border-amber-700 flex flex-col items-center justify-center shadow-xl">
              <Award className="w-10 h-10 text-amber-600 mb-1" />
              <span className="font-black text-3xl text-amber-500">3RD</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Winner Detailed Stats Card */}
      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-xl max-w-2xl w-full mx-auto grid grid-cols-3 gap-4 my-6 shadow-2xl"
        >
          <div className="text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Correct Answers</span>
            <span className="text-2xl font-black text-emerald-400 font-display flex items-center justify-center gap-1">
              <Zap className="w-5 h-5" /> {winner.correctAnswers}
            </span>
          </div>
          <div className="text-center border-x border-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Accuracy</span>
            <span className="text-2xl font-black text-cyan-300 font-display">
              {winner.correctAnswers + winner.wrongAnswers > 0
                ? Math.round((winner.correctAnswers / (winner.correctAnswers + winner.wrongAnswers)) * 100)
                : 0}%
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Avg Response</span>
            <span className="text-2xl font-black text-purple-300 font-display flex items-center justify-center gap-1">
              <Clock className="w-5 h-5" />
              {winner.correctAnswers + winner.wrongAnswers > 0
                ? (winner.totalTimeMs / (winner.correctAnswers + winner.wrongAnswers) / 1000).toFixed(1)
                : 0}s
            </span>
          </div>
        </motion.div>
      )}

      {/* Restart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={resetQuiz}
        className="mt-4 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-lg text-white shadow-[0_0_30px_rgba(2,132,199,0.5)] flex items-center gap-3 mx-auto cursor-pointer"
      >
        <RotateCcw className="w-5 h-5" /> PLAY AGAIN / NEW QUIZ
      </motion.button>
    </div>
  );
};
