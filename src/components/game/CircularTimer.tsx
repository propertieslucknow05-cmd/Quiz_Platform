'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ remainingSeconds, totalSeconds }) => {
  // If timer is OFF (totalSeconds === 0), render Untimed Infinity Badge
  if (totalSeconds === 0) {
    return (
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-slate-900 border-2 border-slate-700 shadow-xl">
        <span className="text-2xl font-black text-cyan-400">∞</span>
        <span className="absolute -bottom-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-950 px-1 rounded">
          OFF
        </span>
      </div>
    );
  }

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const strokeDashoffset = circumference - progress * circumference;

  const isCritical = remainingSeconds <= 3 && remainingSeconds > 0;
  const isWarning = remainingSeconds <= 5 && remainingSeconds > 3;

  const strokeColor = isCritical ? '#ff0055' : isWarning ? '#ffaa00' : '#00f3ff';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#1e293b"
          strokeWidth="5"
          fill="transparent"
        />
        {/* Progress Arc */}
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          stroke={strokeColor}
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ ease: 'linear', duration: 0.3 }}
          strokeLinecap="round"
        />
      </svg>

      {/* Timer Text Display */}
      <motion.div
        key={remainingSeconds}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        className={`absolute font-black text-xl font-display ${
          isCritical ? 'text-rose-500 animate-pulse' : isWarning ? 'text-amber-400' : 'text-cyan-300'
        }`}
      >
        {remainingSeconds}
      </motion.div>
    </div>
  );
};
