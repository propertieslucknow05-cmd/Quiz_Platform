'use client';

import React, { useEffect } from 'react';
import { useQuizStore } from '@/lib/store';
import { initSyncEngine } from '@/lib/sync';
import { exportScoresToCSV, generatePrintableReport } from '@/lib/pdf-export';
import { NavigationHeader } from '@/components/ui/NavigationHeader';
import { ParticleCanvas } from '@/components/background/ParticleCanvas';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Download, FileText, ArrowLeft, Trophy, Zap, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsDashboardPage() {
  const store = useQuizStore();

  useEffect(() => {
    initSyncEngine();
  }, []);

  // Prepare chart data
  const teamAccuracyData = store.teams.map((t) => {
    const total = t.correctAnswers + t.wrongAnswers;
    const acc = total > 0 ? Math.round((t.correctAnswers / total) * 100) : 0;
    const avgTime = total > 0 ? Number((t.totalTimeMs / total / 1000).toFixed(1)) : 0;
    return {
      name: t.name,
      score: t.score,
      accuracy: acc,
      avgSpeed: avgTime,
    };
  });

  const mediaSourceData = [
    { name: 'AI Generated', value: store.mediaList.filter((m) => m.source === 'AI').length, color: '#00f3ff' },
    { name: 'Human Creation', value: store.mediaList.filter((m) => m.source === 'HUMAN').length, color: '#00ff66' }
  ];

  const difficultyData = [
    { difficulty: 'Easy', count: store.mediaList.filter((m) => m.difficulty === 'Easy').length },
    { difficulty: 'Medium', count: store.mediaList.filter((m) => m.difficulty === 'Medium').length },
    { difficulty: 'Hard', count: store.mediaList.filter((m) => m.difficulty === 'Hard').length }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col font-sans">
      <ParticleCanvas />
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 relative z-10 space-y-8">
        {/* Analytics Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          <div>
            <Link href="/admin" className="text-xs text-cyan-400 font-bold flex items-center gap-1 hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Studio
            </Link>
            <h1 className="text-3xl font-black font-display text-white">
              QUIZ ANALYTICS & INSIGHTS
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Real-time statistical breakdown for {store.quizTitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportScoresToCSV(store.teams)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>

            <button
              onClick={() => generatePrintableReport(store.quizTitle, store.teams, store.mediaList, store.submissions)}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Print PDF Report
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Scores Bar Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white font-display flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Team Final Scores
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamAccuracyData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="score" fill="#00f3ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accuracy % Comparison Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Accuracy Rate (%) per Team
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamAccuracyData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="accuracy" fill="#00ff66" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI vs Human Split Pie Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white font-display">
              Media Dataset Distribution (AI vs Human)
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mediaSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mediaSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Response Speed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" /> Average Response Speed (Seconds)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teamAccuracyData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} unit="s" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="avgSpeed" stroke="#b000ff" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
