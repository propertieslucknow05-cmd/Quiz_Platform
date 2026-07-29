'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/store';
import { initSyncEngine } from '@/lib/sync';
import { CircularTimer } from '@/components/game/CircularTimer';
import { AnimatedLeaderboard } from '@/components/leaderboard/AnimatedLeaderboard';
import { WinnerPodium } from '@/components/game/WinnerPodium';
import { RoundCompletedScreen } from '@/components/game/RoundCompletedScreen';
import { ParticleCanvas } from '@/components/background/ParticleCanvas';
import { NavigationHeader } from '@/components/ui/NavigationHeader';
import { SourceType } from '@/types/quiz';
import { 
  Sparkles, Bot, UserCheck, Play, Pause, ArrowRight, Trophy, Flame, 
  Lock, Eye, EyeOff, SkipForward, Users, Crown, ArrowLeftRight
} from 'lucide-react';

export default function CombinedArenaPage() {
  const store = useQuizStore();
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [chosenAnswer, setChosenAnswer] = useState<SourceType | null>(null);

  useEffect(() => {
    initSyncEngine();

    // High precision tick interval (runs every 200ms for smooth timestamp checking)
    const interval = setInterval(() => {
      const state = useQuizStore.getState();
      if (state.isTimerRunning) {
        state.tickTimer();
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setHasSubmitted(false);
    setChosenAnswer(null);
  }, [store.currentQuestionIndex]);

  const currentMedia = store.mediaList[store.currentQuestionIndex];
  
  const activeTeam = store.teams.find((t) => t.id === store.activeTeamId) || store.teams[store.currentQuestionIndex % Math.max(1, store.teams.length)];
  const currentSubmissions = store.submissions[store.currentQuestionIndex] || {};
  const mySubmission = activeTeam ? currentSubmissions[activeTeam.id] : undefined;

  const progressPercent = Math.round(((store.currentQuestionIndex + 1) / store.mediaList.length) * 100);

  const handleChoice = (choice: SourceType) => {
    if (!activeTeam || store.phase !== 'QUESTION_ACTIVE' || mySubmission || hasSubmitted) return;

    const responseTimeMs = (store.settings.questionDuration - store.timerRemaining) * 1000 + Math.random() * 200;
    store.submitAnswer(activeTeam.id, choice, responseTimeMs);
    setHasSubmitted(true);
    setChosenAnswer(choice);
  };

  const toggleTimer = () => {
    if (store.isTimerRunning) {
      store.pauseQuiz();
    } else {
      store.resumeQuiz();
    }
  };

  const toggleCaptions = () => {
    store.updateSettings({ showCaptions: !store.settings.showCaptions });
  };

  if (store.phase === 'WINNER_PODIUM') {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative">
        <ParticleCanvas />
        <NavigationHeader />
        <WinnerPodium teams={store.teams} />
      </div>
    );
  }

  if (store.phase === 'ROUND_COMPLETED') {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative flex flex-col">
        <ParticleCanvas />
        <NavigationHeader />
        <RoundCompletedScreen />
      </div>
    );
  }

  if (store.phase === 'LEADERBOARD') {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative flex flex-col">
        <ParticleCanvas />
        <NavigationHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <AnimatedLeaderboard teams={store.teams} />
        </div>
      </div>
    );
  }

  const isRevealPhase = store.phase === 'ANSWER_REVEAL';

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans overflow-x-hidden transform-gpu">
      <ParticleCanvas />
      <NavigationHeader />

      {/* Main Unified Arena Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between relative z-10 space-y-5">
        
        {/* Top Arena Header Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 md:px-6 backdrop-blur-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 transform-gpu">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-extrabold text-base md:text-lg">
              QUESTION {store.currentQuestionIndex + 1} / {store.mediaList.length}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <span>{currentMedia?.category}</span> • <span>{currentMedia?.difficulty}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-xs hidden md:block">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(0,243,255,0.8)]"
              />
            </div>
          </div>

          {/* Quick Host Controls & Captions Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCaptions}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                store.settings.showCaptions
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={store.settings.showCaptions ? 'Captions Visible (Click to Hide)' : 'Captions Hidden (Click to Show)'}
            >
              {store.settings.showCaptions ? <Eye className="w-4 h-4 text-purple-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              <span className="hidden lg:inline">{store.settings.showCaptions ? 'CAPTIONS ON' : 'CAPTIONS OFF'}</span>
            </button>

            <button
              onClick={toggleTimer}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                store.isTimerRunning
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {store.isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden lg:inline">{store.isTimerRunning ? 'PAUSE' : 'START'}</span>
            </button>

            <button
              onClick={() => store.revealAnswer()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden lg:inline">REVEAL</span>
            </button>

            <button
              onClick={() => store.nextQuestion()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
              <span className="hidden lg:inline">NEXT TURN</span>
            </button>

            <button
              onClick={() => store.showLeaderboard()}
              className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden lg:inline">SCORES</span>
            </button>
          </div>

          {/* Circular Timer Widget */}
          <CircularTimer
            remainingSeconds={store.timerRemaining}
            totalSeconds={store.settings.questionDuration}
          />
        </div>

        {/* PROMINENT ROUND-ROBIN TURN INDICATOR BANNER */}
        <motion.div
          key={activeTeam?.id}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-500/50 rounded-2xl p-3.5 text-center backdrop-blur-xl shadow-xl flex items-center justify-between transform-gpu"
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-purple-500 text-slate-950 font-black text-xs uppercase tracking-wider">
              ROUND {store.currentRound}
            </span>
            <div className="text-left">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">CURRENT TURN:</span>
              <span className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-200 to-purple-300 font-display flex items-center gap-2">
                <span>{activeTeam?.avatar}</span> {activeTeam?.name}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-300 font-bold">
            <span>Score: <span className="text-cyan-300 font-black">{activeTeam?.score || 0} pts</span></span>
            {activeTeam?.streak >= 2 && (
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <Flame className="w-4 h-4 fill-red-400" /> {activeTeam.streak} Streak
              </span>
            )}
          </div>
        </motion.div>

        {/* ANSWERING CONTROLLER DOCK (MOVED ABOVE THE MEDIA IMAGE FOR OPTIMAL VISIBILITY) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 backdrop-blur-2xl shadow-2xl space-y-3 transform-gpu">
          <div className="text-center font-bold text-xs text-slate-300">
            {store.phase === 'QUESTION_ACTIVE' && !mySubmission ? (
              <span className="text-cyan-400 font-black animate-pulse uppercase tracking-wider">
                👉 IT'S {activeTeam?.name.toUpperCase()}'S TURN TO ANSWER!
              </span>
            ) : mySubmission ? (
              <span className="text-emerald-400 font-black flex items-center justify-center gap-1.5 uppercase">
                <Lock className="w-4 h-4" /> ANSWER LOCKED FOR {activeTeam?.name.toUpperCase()}
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
              className={`py-5 px-4 rounded-2xl border-2 font-black font-display text-xl md:text-2xl flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-xl ${
                mySubmission?.answer === 'HUMAN' || chosenAnswer === 'HUMAN'
                  ? 'bg-emerald-500 text-slate-950 border-white shadow-[0_0_35px_rgba(0,255,102,0.8)] scale-102'
                  : store.phase === 'QUESTION_ACTIVE' && !mySubmission
                  ? 'bg-gradient-to-r from-emerald-950 to-slate-900 border-emerald-500 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_20px_rgba(0,255,102,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-60'
              }`}
            >
              <UserCheck className="w-7 h-7" />
              <span>🟢 HUMAN</span>
            </motion.button>

            {/* 🔵 AI GENERATED Button */}
            <motion.button
              whileHover={{ scale: store.phase === 'QUESTION_ACTIVE' && !mySubmission ? 1.02 : 1 }}
              whileTap={{ scale: store.phase === 'QUESTION_ACTIVE' && !mySubmission ? 0.95 : 1 }}
              disabled={store.phase !== 'QUESTION_ACTIVE' || !!mySubmission}
              onClick={() => handleChoice('AI')}
              className={`py-5 px-4 rounded-2xl border-2 font-black font-display text-xl md:text-2xl flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-xl ${
                mySubmission?.answer === 'AI' || chosenAnswer === 'AI'
                  ? 'bg-cyan-500 text-slate-950 border-white shadow-[0_0_35px_rgba(0,243,255,0.8)] scale-102'
                  : store.phase === 'QUESTION_ACTIVE' && !mySubmission
                  ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-cyan-500 text-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_20px_rgba(0,243,255,0.2)]'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-60'
              }`}
            >
              <Bot className="w-7 h-7" />
              <span>🔵 AI GENERATED</span>
            </motion.button>
          </div>
        </div>

        {/* QUESTION MEDIA FRAME (POSITIONED BELOW THE ANSWERING CONTROLLER DOCK) */}
        <div className={`flex-1 flex flex-col justify-center relative min-h-[340px] ${
          isRevealPhase ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch' : 'items-center'
        }`}>
          {/* Question Media Frame */}
          <AnimatePresence mode="wait">
            {currentMedia && (
              <motion.div
                key={currentMedia.id}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                className={`relative w-full rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-900/90 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col items-center justify-between group transform-gpu ${
                  isRevealPhase ? 'max-w-none h-full' : 'max-w-4xl'
                }`}
              >
                {/* Media Canvas */}
                <div className={`relative w-full flex items-center justify-center bg-black/40 overflow-hidden ${
                  isRevealPhase ? 'h-[300px] lg:h-[360px]' : 'max-h-[360px] h-[340px]'
                }`}>
                  {currentMedia.type === 'IMAGE' ? (
                    <img
                      src={currentMedia.url}
                      alt={currentMedia.title}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-103"
                      loading="eager"
                    />
                  ) : (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-contain"
                    />
                  )}

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-[11px] font-black tracking-widest text-cyan-300 backdrop-blur-md uppercase">
                    {currentMedia.type}
                  </span>
                </div>

                {/* Title & Caption Bar */}
                <div className="w-full px-6 py-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-base text-white font-display truncate">
                    {store.settings.showCaptions || isRevealPhase
                      ? currentMedia.title
                      : `Question #${store.currentQuestionIndex + 1} • Mystery ${currentMedia.type}`}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    Media #{store.currentQuestionIndex + 1}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIDE-BY-SIDE Answer Reveal Announcement Box (when ANSWER_REVEAL is active) */}
          <AnimatePresence>
            {isRevealPhase && currentMedia && (
              <motion.div
                initial={{ x: 50, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 22 }}
                className={`w-full h-full rounded-3xl p-6 md:p-8 backdrop-blur-2xl border-2 shadow-2xl text-center flex flex-col items-center justify-between relative overflow-hidden transform-gpu ${
                  currentMedia.source === 'AI'
                    ? 'bg-gradient-to-br from-cyan-950/95 via-slate-900 to-blue-950/95 border-cyan-400 shadow-[0_0_50px_rgba(0,243,255,0.4)]'
                    : 'bg-gradient-to-br from-emerald-950/95 via-slate-900 to-green-950/95 border-emerald-400 shadow-[0_0_50px_rgba(0,255,102,0.4)]'
                }`}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-white/20 text-xs font-black tracking-widest text-slate-300 uppercase mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> REVEAL ANNOUNCEMENT
                </div>

                <div className="flex flex-col items-center justify-center my-auto space-y-3">
                  {currentMedia.source === 'AI' ? (
                    <>
                      <Bot className="w-14 h-14 text-cyan-400 animate-pulse" />
                      <h2 className="text-3xl md:text-5xl font-black font-display text-cyan-300 tracking-tight drop-shadow-[0_0_30px_rgba(0,243,255,0.8)]">
                        AI GENERATED
                      </h2>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-14 h-14 text-emerald-400 animate-pulse" />
                      <h2 className="text-3xl md:text-5xl font-black font-display text-emerald-300 tracking-tight drop-shadow-[0_0_30px_rgba(0,255,102,0.8)]">
                        REAL HUMAN CREATION
                      </h2>
                    </>
                  )}

                  {/* Attribution & Prompt Details */}
                  <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm font-medium space-y-1 mt-2">
                    <div className="font-bold text-amber-300 text-base">{currentMedia.attribution}</div>
                    {currentMedia.prompt && (
                      <div className="text-xs text-slate-400 italic">"{currentMedia.prompt}"</div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => store.showLeaderboard()}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-600 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
                  </button>

                  <button
                    onClick={() => store.nextQuestion()}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-103 transition-transform uppercase tracking-wider"
                  >
                    NEXT TURN <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
