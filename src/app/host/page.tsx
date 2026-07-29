'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store';
import { initSyncEngine } from '@/lib/sync';
import { NavigationHeader } from '@/components/ui/NavigationHeader';
import { ParticleCanvas } from '@/components/background/ParticleCanvas';
import { SourceType } from '@/types/quiz';
import { 
  Play, Pause, SkipForward, RotateCcw, Trophy, Eye, Volume2, 
  VolumeX, Flame, Zap, Shield, Crown, CheckCircle2, ChevronRight, 
  ChevronLeft, Bot, UserCheck, Lock, Users, Sparkles, Gamepad2
} from 'lucide-react';

export default function HostAndTeamControllerPage() {
  const store = useQuizStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  useEffect(() => {
    initSyncEngine();
  }, []);

  const currentMedia = store.mediaList[store.currentQuestionIndex];
  
  // Effective active team
  const activeTeam = store.teams.find((t) => t.id === (selectedTeamId || store.activeTeamId)) || store.teams[store.currentQuestionIndex % Math.max(1, store.teams.length)];
  const currentSubmissions = store.submissions[store.currentQuestionIndex] || {};
  const mySubmission = activeTeam ? currentSubmissions[activeTeam.id] : undefined;

  const toggleTimer = () => {
    if (store.isTimerRunning) {
      store.pauseQuiz();
    } else {
      store.resumeQuiz();
    }
  };

  const handleSetDuration = (duration: number) => {
    store.updateSettings({ questionDuration: duration });
  };

  const handleChoice = (choice: SourceType) => {
    if (!activeTeam || store.phase !== 'QUESTION_ACTIVE' || mySubmission) return;

    const responseTimeMs = (store.settings.questionDuration - store.timerRemaining) * 1000 + Math.random() * 200;
    store.submitAnswer(activeTeam.id, choice, responseTimeMs);
  };

  const durationPresets = [0, 5, 10, 15, 20, 30, 45, 60];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans overflow-x-hidden transform-gpu">
      <ParticleCanvas />
      <NavigationHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 relative z-10 space-y-6">
        {/* Header Control Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit">
              <Gamepad2 className="w-3.5 h-3.5" /> HOST & TEAM MASTER REMOTE
            </span>
            <h1 className="text-2xl md:text-3xl font-black font-display text-white mt-1.5">
              ALL-IN-ONE GAME & ANSWER CONTROLLER
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Full control over stage timer, team turns, answer choices, and master key reveals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => store.resetQuiz()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reset Game
            </button>
            <button
              onClick={() => store.showLeaderboard()}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 border border-amber-500/40 cursor-pointer"
            >
              <Trophy className="w-4 h-4" /> View Leaderboard
            </button>
          </div>
        </div>

        {/* GAME MASTER QUICK ACTIONS & TIMER PRESETS ROW */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-2xl shadow-2xl space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={toggleTimer}
              className={`py-3.5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-transform ${
                store.isTimerRunning
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {store.isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{store.isTimerRunning ? 'Pause Timer' : 'Start / Resume Timer'}</span>
            </button>

            <button
              onClick={() => store.revealAnswer()}
              className="py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-103 transition-transform"
            >
              <Eye className="w-4 h-4" />
              <span>Reveal Answer</span>
            </button>

            <button
              onClick={() => store.nextQuestion()}
              className="py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-103 transition-transform"
            >
              <SkipForward className="w-4 h-4" />
              <span>Next Turn</span>
            </button>
          </div>

          {/* TIMER PRESET SELECTOR BAR */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => store.previousQuestion()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <span className="text-xs font-bold text-slate-400 ml-2">Timer Presets:</span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {durationPresets.map((dur) => {
                  const isActive = store.settings.questionDuration === dur;
                  return (
                    <button
                      key={dur}
                      onClick={() => handleSetDuration(dur)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {dur === 0 ? 'OFF' : `${dur}s`}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => store.nextQuestion()}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              Next Turn <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ACTIVE TEAM SELECTION & TURN STATUS BAR */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                ROUND {store.currentRound} • TEAM SELECTION:
              </span>
            </div>

            <select
              value={selectedTeamId || store.activeTeamId || ''}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                useQuizStore.setState({ activeTeamId: e.target.value });
              }}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-cyan-300 font-bold outline-none cursor-pointer"
            >
              {store.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.avatar} {t.name} ({t.score} pts)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{activeTeam?.avatar}</div>
              <div>
                <h3 className="text-lg font-black text-white font-display">{activeTeam?.name}</h3>
                <span className="text-xs text-cyan-300 font-extrabold">
                  Score: {activeTeam?.score} pts • Streak: {activeTeam?.streak}
                </span>
              </div>
            </div>

            {activeTeam?.streak >= 2 && (
              <span className="flex items-center gap-1 text-red-400 font-extrabold text-xs bg-red-950/60 px-3 py-1.5 rounded-xl border border-red-500/40">
                <Flame className="w-4 h-4 fill-red-400" /> {activeTeam.streak} STREAK
              </span>
            )}
          </div>
        </div>

        {/* TEAM ANSWERING CONTROLLER DOCK (BIG TOUCH BUTTONS) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="text-center font-bold text-xs text-slate-300">
            {store.phase === 'QUESTION_ACTIVE' && !mySubmission ? (
              <span className="text-cyan-400 font-black animate-pulse uppercase tracking-wider text-sm">
                👉 IT'S {activeTeam?.name.toUpperCase()}'S TURN TO ANSWER!
              </span>
            ) : mySubmission ? (
              <span className="text-emerald-400 font-black flex items-center justify-center gap-1.5 uppercase text-sm">
                <Lock className="w-4 h-4" /> ANSWER LOCKED FOR {activeTeam?.name.toUpperCase()} (AUTO-REVEALING...)
              </span>
            ) : (
              <span className="text-slate-500 uppercase">WAITING FOR NEXT TURN...</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {/* 🟢 HUMAN Button */}
            <motion.button
              whileHover={{ scale: store.phase === 'QUESTION_ACTIVE' && !mySubmission ? 1.02 : 1 }}
              whileTap={{ scale: store.phase === 'QUESTION_ACTIVE' && !mySubmission ? 0.95 : 1 }}
              disabled={store.phase !== 'QUESTION_ACTIVE' || !!mySubmission}
              onClick={() => handleChoice('HUMAN')}
              className={`py-8 px-6 rounded-2xl border-2 font-black font-display text-2xl md:text-3xl flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-xl ${
                mySubmission?.answer === 'HUMAN'
                  ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_40px_rgba(0,255,102,0.8)] scale-102'
                  : store.phase === 'QUESTION_ACTIVE' && !mySubmission
                  ? 'bg-gradient-to-r from-emerald-950 to-slate-900 border-emerald-500 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_20px_rgba(0,255,102,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-60'
              }`}
            >
              <UserCheck className="w-8 h-8" />
              <span>🟢 HUMAN</span>
            </motion.button>

            {/* 🔵 AI GENERATED Button */}
            <motion.button
              whileHover={{ scale: store.phase === 'QUESTION_ACTIVE' && !mySubmission ? 1.02 : 1 }}
              whileTap={{ scale: store.phase === 'QUESTION_ACTIVE' && !mySubmission ? 0.95 : 1 }}
              disabled={store.phase !== 'QUESTION_ACTIVE' || !!mySubmission}
              onClick={() => handleChoice('AI')}
              className={`py-8 px-6 rounded-2xl border-2 font-black font-display text-2xl md:text-3xl flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-xl ${
                mySubmission?.answer === 'AI'
                  ? 'bg-cyan-500 text-slate-950 border-white shadow-[0_0_40px_rgba(0,243,255,0.8)] scale-102'
                  : store.phase === 'QUESTION_ACTIVE' && !mySubmission
                  ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-500 text-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-60'
              }`}
            >
              <Bot className="w-8 h-8" />
              <span>🔵 AI GENERATED</span>
            </motion.button>
          </div>
        </div>

        {/* QUESTION MASTER KEY DETAILS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              QUESTION #{store.currentQuestionIndex + 1} MASTER KEY & ATTR
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
              currentMedia?.source === 'AI' ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
            }`}>
              ANSWER: /{currentMedia?.source}
            </span>
          </div>

          <div>
            <h4 className="font-bold text-base text-white">{currentMedia?.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{currentMedia?.attribution}</p>
            {currentMedia?.prompt && (
              <p className="text-xs text-slate-500 italic mt-1">"{currentMedia.prompt}"</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
