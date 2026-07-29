'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Tv, Sliders, Shield, Smartphone, Users, Volume2, VolumeX, Gamepad2, Eye, EyeOff } from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { useQuizStore } from '@/lib/store';

export const NavigationHeader: React.FC = () => {
  const pathname = usePathname();
  const settings = useQuizStore((s) => s.settings);
  const updateSettings = useQuizStore((s) => s.updateSettings);

  const toggleSound = () => {
    const nextState = !settings.soundEnabled;
    soundManager.setMuted(!nextState);
    updateSettings({ soundEnabled: nextState });
  };

  const toggleCaptions = () => {
    updateSettings({ showCaptions: !settings.showCaptions });
  };

  const navItems = [
    { href: '/', label: 'Portal', icon: Sparkles },
    { href: '/arena', label: 'All-in-One Arena Game', icon: Gamepad2 },
    { href: '/host', label: 'Host & Team Remote', icon: Sliders },
    { href: '/admin', label: 'Admin Studio', icon: Shield },
    { href: '/audience', label: 'Audience View', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(0,243,255,0.4)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-cyan-400 text-lg">
              AI
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight font-display flex items-center gap-1.5">
              AI <span className="text-slate-500 font-light">vs</span> HUMAN
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                LIVE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Enterprise Quiz Platform
            </p>
          </div>
        </Link>

        {/* View Switcher Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2">
          {/* Captions Visibility Toggle Button */}
          <button
            onClick={toggleCaptions}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all cursor-pointer ${
              settings.showCaptions
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={settings.showCaptions ? 'Captions Visible (Click to Hide)' : 'Captions Hidden (Click to Show)'}
          >
            {settings.showCaptions ? <Eye className="w-4 h-4 text-purple-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <span className="hidden lg:inline">{settings.showCaptions ? 'Captions: ON' : 'Captions: OFF'}</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
              settings.soundEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={settings.soundEnabled ? 'Mute Sound FX' : 'Unmute Sound FX'}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
