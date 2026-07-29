'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuizStore } from '@/lib/store';
import { Trophy, Sparkles, ArrowRight, Zap, Flame, Award } from 'lucide-react';

export const RoundCompletedScreen: React.FC = () => {
  const store = useQuizStore();
  const sortedTeams = [...store.teams].sort((a, b) => b.score - a.score);
  const roundWinner = sortedTeams[0];

  useEffect(() => {
    // Launch fireworks burst on round completion
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f3ff', '#ff00a0', '#ffe600', '#00ff66']
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-white text-center relative font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-3xl w-full rounded-3xl border-2 border-purple-500/50 bg-slate-900/90 p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(176,0,255,0.3)] space-y-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 font-extrabold text-xs tracking-widest uppercase">
          <Sparkles className="w-4 h-4 text-amber-400" /> ROUND {store.currentRound} FINISHED!
        </div>

        <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300 drop-shadow-md">
          ROUND {store.currentRound} COMPLETED!
        </h1>

        <p className="text-sm md:text-base text-slate-300 font-medium max-w-lg mx-auto">
          Every team has taken their turn for Round {store.currentRound}. Here are the standings before moving to Round {store.currentRound + 1}!
        </p>

        {/* Round Leader Highlight Card */}
        {roundWinner && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-400/50 flex items-center justify-between text-left">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{roundWinner.avatar}</div>
              <div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block">ROUND LEADER</span>
                <h3 className="text-2xl font-black font-display text-white">{roundWinner.name}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black font-display text-amber-300">{roundWinner.score} PTS</div>
              <div className="text-xs text-slate-400 font-semibold">{roundWinner.correctAnswers} Correct</div>
            </div>
          </div>
        )}

        {/* Round Standings Summary */}
        <div className="space-y-2">
          {sortedTeams.slice(0, 4).map((team, idx) => (
            <div
              key={team.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3 font-bold">
                <span className="text-slate-500 w-6">#{idx + 1}</span>
                <span className="text-xl">{team.avatar}</span>
                <span className="text-white">{team.name}</span>
              </div>
              <div className="font-extrabold text-cyan-300">{team.score} Points</div>
            </div>
          ))}
        </div>

        {/* Continue Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => store.continueToNextRound()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 font-black text-lg text-white shadow-[0_0_30px_rgba(0,243,255,0.4)] flex items-center justify-center gap-3 cursor-pointer hover:shadow-[0_0_40px_rgba(0,243,255,0.6)] transition-all mt-4"
        >
          START ROUND {store.currentRound + 1} NOW <ArrowRight className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  );
};
