import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, MediaItem, Team, SourceType, AnswerSubmission, QuizSettings, GamePhase, AudienceReaction } from '@/types/quiz';
import { SEED_MEDIA_ITEMS } from './media-seed';
import { soundManager } from './audio';

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Cyber Mavericks',
    avatar: '🤖',
    color: '#00f3ff',
    score: 0,
    streak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeMs: 0,
    availablePowerups: ['FIFTY_FIFTY', 'DOUBLE_SCORE', 'FREEZE_TIMER']
  },
  {
    id: 'team-2',
    name: 'Neural Ninjas',
    avatar: '⚡',
    color: '#ff00a0',
    score: 0,
    streak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeMs: 0,
    availablePowerups: ['FIFTY_FIFTY', 'DOUBLE_SCORE', 'STEAL_POINTS']
  },
  {
    id: 'team-3',
    name: 'Humanist Visionaries',
    avatar: '🎨',
    color: '#00ff66',
    score: 0,
    streak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeMs: 0,
    availablePowerups: ['FIFTY_FIFTY', 'DOUBLE_SCORE', 'SECOND_CHANCE']
  },
  {
    id: 'team-4',
    name: 'Quantum Detectives',
    avatar: '🔮',
    color: '#ffe600',
    score: 0,
    streak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTimeMs: 0,
    availablePowerups: ['FIFTY_FIFTY', 'FREEZE_TIMER', 'STEAL_POINTS']
  }
];

const INITIAL_SETTINGS: QuizSettings = {
  questionDuration: 15,
  totalQuestions: 120,
  autoAdvance: false,
  soundEnabled: true,
  bgmEnabled: false,
  showCaptions: false,
  selectedCategories: ['All']
};

interface QuizStoreActions {
  startQuiz: () => void;
  nextQuestion: () => void;
  continueToNextRound: () => void;
  resumeGameFromLeaderboard: () => void;
  previousQuestion: () => void;
  setPhase: (phase: GamePhase) => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  tickTimer: () => void;
  revealAnswer: () => void;
  showLeaderboard: () => void;
  showWinner: () => void;
  resetQuiz: () => void;
  restoreDefaultMediaLibrary: () => void;

  scanLocalDiskFolders: () => Promise<number>;
  shuffleMediaList: () => void;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => void;
  deleteMediaItem: (id: string) => void;
  bulkAddMedia: (items: MediaItem[]) => void;
  bulkDeleteMedia: (ids: string[]) => void;
  bulkUpdateSource: (ids: string[], source: SourceType) => void;

  addTeam: (team: Omit<Team, 'id' | 'score' | 'streak' | 'correctAnswers' | 'wrongAnswers' | 'totalTimeMs' | 'availablePowerups'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  submitAnswer: (teamId: string, answer: SourceType, responseTimeMs: number) => void;
  resetLeaderboard: () => void;

  addReaction: (emoji: string) => void;
  updateSettings: (settings: Partial<QuizSettings>) => void;
  importFullState: (newState: GameState) => void;
}

export const useQuizStore = create<GameState & QuizStoreActions>()(
  persist(
    (set, get) => ({
      quizId: 'quiz-session-001',
      quizTitle: 'AI vs Human World Championship 2026',
      phase: 'LOBBY',
      currentQuestionIndex: 0,
      currentRound: 1,
      timerRemaining: 15,
      timerTargetTimeMs: null,
      isTimerRunning: false,
      mediaList: SEED_MEDIA_ITEMS,
      deletedUrls: [],
      teams: INITIAL_TEAMS,
      activeTeamId: INITIAL_TEAMS[0].id,
      submissions: {},
      reactions: [],
      settings: INITIAL_SETTINGS,

      restoreDefaultMediaLibrary: () => {
        set({ mediaList: SEED_MEDIA_ITEMS, deletedUrls: [], currentQuestionIndex: 0 });
      },

      scanLocalDiskFolders: async () => {
        try {
          const res = await fetch('/api/local-media');
          const data = await res.json();
          if (data.success && Array.isArray(data.mediaList) && data.mediaList.length > 0) {
            set(state => {
              const existingUrls = new Set(state.mediaList.map(m => m.url));
              const deletedSet = new Set(state.deletedUrls);
              
              // Filter out items that are already in list OR have been deleted
              const newItems = data.mediaList.filter((m: MediaItem) => 
                !existingUrls.has(m.url) && !deletedSet.has(m.url) && !deletedSet.has(m.id)
              );

              return {
                mediaList: [...newItems, ...state.mediaList]
              };
            });
            return data.mediaList.length;
          }
          return 0;
        } catch (err) {
          console.error('Failed to scan local disk folders:', err);
          return 0;
        }
      },

      startQuiz: () => {
        const { mediaList, settings, teams } = get();
        const shuffled = [...mediaList].sort(() => Math.random() - 0.5);
        const activeTeamId = teams.length > 0 ? teams[0].id : undefined;
        const isUntimed = settings.questionDuration === 0;

        set({
          mediaList: shuffled,
          currentQuestionIndex: 0,
          currentRound: 1,
          activeTeamId,
          phase: 'QUESTION_ACTIVE',
          timerRemaining: settings.questionDuration,
          timerTargetTimeMs: isUntimed ? null : Date.now() + settings.questionDuration * 1000,
          isTimerRunning: !isUntimed,
        });
      },

      nextQuestion: () => {
        const { currentQuestionIndex, mediaList, settings, teams } = get();
        const teamCount = Math.max(1, teams.length);
        const isUntimed = settings.questionDuration === 0;

        if (currentQuestionIndex < mediaList.length - 1) {
          const isRoundJustCompleted = (currentQuestionIndex + 1) % teamCount === 0;

          if (isRoundJustCompleted) {
            soundManager.playWinnerFanfare();
            set({
              phase: 'ROUND_COMPLETED',
              isTimerRunning: false,
              timerTargetTimeMs: null
            });
          } else {
            const nextIdx = currentQuestionIndex + 1;
            const nextRound = Math.floor(nextIdx / teamCount) + 1;
            const nextActiveTeamId = teams[nextIdx % teamCount].id;

            set({
              currentQuestionIndex: nextIdx,
              currentRound: nextRound,
              activeTeamId: nextActiveTeamId,
              phase: 'QUESTION_ACTIVE',
              timerRemaining: settings.questionDuration,
              timerTargetTimeMs: isUntimed ? null : Date.now() + settings.questionDuration * 1000,
              isTimerRunning: !isUntimed,
            });
          }
        } else {
          get().showWinner();
        }
      },

      continueToNextRound: () => {
        const { currentQuestionIndex, mediaList, settings, teams } = get();
        const teamCount = Math.max(1, teams.length);
        const nextIdx = currentQuestionIndex + 1;
        const isUntimed = settings.questionDuration === 0;

        if (nextIdx < mediaList.length) {
          const nextRound = Math.floor(nextIdx / teamCount) + 1;
          const nextActiveTeamId = teams[nextIdx % teamCount].id;

          set({
            currentQuestionIndex: nextIdx,
            currentRound: nextRound,
            activeTeamId: nextActiveTeamId,
            phase: 'QUESTION_ACTIVE',
            timerRemaining: settings.questionDuration,
            timerTargetTimeMs: isUntimed ? null : Date.now() + settings.questionDuration * 1000,
            isTimerRunning: !isUntimed,
          });
        } else {
          get().showWinner();
        }
      },

      resumeGameFromLeaderboard: () => {
        const duration = get().settings.questionDuration;
        const remaining = get().timerRemaining || duration;
        const isUntimed = duration === 0;

        set({
          phase: 'QUESTION_ACTIVE',
          isTimerRunning: !isUntimed,
          timerTargetTimeMs: isUntimed ? null : Date.now() + remaining * 1000
        });
      },

      previousQuestion: () => {
        const { currentQuestionIndex, settings, teams } = get();
        const teamCount = Math.max(1, teams.length);
        const isUntimed = settings.questionDuration === 0;

        if (currentQuestionIndex > 0) {
          const prevIdx = currentQuestionIndex - 1;
          const prevRound = Math.floor(prevIdx / teamCount) + 1;
          const prevActiveTeamId = teams[prevIdx % teamCount].id;

          set({
            currentQuestionIndex: prevIdx,
            currentRound: prevRound,
            activeTeamId: prevActiveTeamId,
            phase: 'QUESTION_ACTIVE',
            timerRemaining: settings.questionDuration,
            timerTargetTimeMs: isUntimed ? null : Date.now() + settings.questionDuration * 1000,
            isTimerRunning: !isUntimed,
          });
        }
      },

      setPhase: (phase: GamePhase) => set({ phase }),
      pauseQuiz: () => {
        const { timerTargetTimeMs, timerRemaining } = get();
        const pauseRemaining = timerTargetTimeMs ? Math.max(0, Math.ceil((timerTargetTimeMs - Date.now()) / 1000)) : timerRemaining;
        set({
          isTimerRunning: false,
          timerTargetTimeMs: null,
          timerRemaining: pauseRemaining
        });
      },

      resumeQuiz: () => {
        const remaining = get().timerRemaining;
        const isUntimed = get().settings.questionDuration === 0;
        if (!isUntimed && remaining > 0) {
          set({
            isTimerRunning: true,
            timerTargetTimeMs: Date.now() + remaining * 1000
          });
        }
      },

      tickTimer: () => {
        const { timerTargetTimeMs, isTimerRunning, phase, settings, timerRemaining } = get();
        if (!isTimerRunning || phase !== 'QUESTION_ACTIVE' || settings.questionDuration === 0 || !timerTargetTimeMs) return;

        const remaining = Math.max(0, Math.ceil((timerTargetTimeMs - Date.now()) / 1000));

        if (remaining !== timerRemaining) {
          if (remaining > 0) {
            soundManager.playTick(remaining);
            set({ timerRemaining: remaining });
          } else {
            soundManager.playBuzzer();
            set({
              timerRemaining: 0,
              timerTargetTimeMs: null,
              isTimerRunning: false
            });
            get().revealAnswer();
          }
        }
      },

      revealAnswer: () => {
        soundManager.playReveal();
        const { currentQuestionIndex, mediaList, submissions, teams } = get();
        const currentMedia = mediaList[currentQuestionIndex];
        if (!currentMedia) return;

        const currentSubmissions = submissions[currentQuestionIndex] || {};

        let fastestTimeMs = Infinity;
        let fastestTeamId: string | null = null;
        
        Object.values(currentSubmissions).forEach(sub => {
          if (sub.isCorrect && sub.responseTimeMs < fastestTimeMs) {
            fastestTimeMs = sub.responseTimeMs;
            fastestTeamId = sub.teamId;
          }
        });

        const updatedTeams = teams.map(team => {
          const sub = currentSubmissions[team.id];
          if (!sub) {
            return { ...team, streak: 0 };
          }

          let pointsEarned = 0;
          let newStreak = team.streak;
          let correctInc = 0;
          let wrongInc = 0;

          if (sub.isCorrect) {
            pointsEarned = 10;
            newStreak += 1;
            correctInc = 1;

            if (team.id === fastestTeamId) {
              pointsEarned += 5;
            }

            if (newStreak >= 3) {
              pointsEarned += 3;
            }
            soundManager.playCorrect();
          } else {
            newStreak = 0;
            wrongInc = 1;
            soundManager.playWrong();
          }

          return {
            ...team,
            score: team.score + pointsEarned,
            streak: newStreak,
            correctAnswers: team.correctAnswers + correctInc,
            wrongAnswers: team.wrongAnswers + wrongInc,
            totalTimeMs: team.totalTimeMs + sub.responseTimeMs,
            lastAnswer: {
              choice: sub.answer,
              responseTimeMs: sub.responseTimeMs,
              isCorrect: sub.isCorrect,
              pointsEarned,
              submittedAt: Date.now()
            }
          };
        });

        set({
          teams: updatedTeams,
          phase: 'ANSWER_REVEAL',
          isTimerRunning: false,
          timerTargetTimeMs: null
        });
      },

      showLeaderboard: () => set({ phase: 'LEADERBOARD', isTimerRunning: false, timerTargetTimeMs: null }),
      showWinner: () => {
        soundManager.playWinnerFanfare();
        set({ phase: 'WINNER_PODIUM', isTimerRunning: false, timerTargetTimeMs: null });
      },

      resetQuiz: () => {
        const teams = get().teams;
        set({
          currentQuestionIndex: 0,
          currentRound: 1,
          activeTeamId: teams.length > 0 ? teams[0].id : undefined,
          phase: 'LOBBY',
          timerRemaining: get().settings.questionDuration,
          timerTargetTimeMs: null,
          isTimerRunning: false,
          submissions: {},
          reactions: [],
          teams: teams.map(t => ({
            ...t,
            score: 0,
            streak: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            totalTimeMs: 0,
            lastAnswer: undefined
          }))
        });
      },

      shuffleMediaList: () => {
        const shuffled = [...get().mediaList].sort(() => Math.random() - 0.5);
        set({ mediaList: shuffled });
      },

      addMediaItem: (item: MediaItem) => set(state => ({
        mediaList: [item, ...state.mediaList]
      })),

      updateMediaItem: (id: string, updates: Partial<MediaItem>) => set(state => ({
        mediaList: state.mediaList.map(i => i.id === id ? { ...i, ...updates } : i)
      })),

      deleteMediaItem: (id: string) => set(state => {
        const target = state.mediaList.find(i => i.id === id);
        const newDeletedUrls = target ? [...state.deletedUrls, target.url, target.id] : state.deletedUrls;
        return {
          mediaList: state.mediaList.filter(i => i.id !== id),
          deletedUrls: newDeletedUrls
        };
      }),

      bulkAddMedia: (items: MediaItem[]) => set(state => ({
        mediaList: [...items, ...state.mediaList]
      })),

      bulkDeleteMedia: (ids: string[]) => set(state => {
        const targets = state.mediaList.filter(i => ids.includes(i.id));
        const deletedAdditions = targets.flatMap(t => [t.url, t.id]);
        return {
          mediaList: state.mediaList.filter(i => !ids.includes(i.id)),
          deletedUrls: [...state.deletedUrls, ...deletedAdditions]
        };
      }),

      bulkUpdateSource: (ids: string[], source: SourceType) => set(state => ({
        mediaList: state.mediaList.map(i => ids.includes(i.id) ? { ...i, source } : i)
      })),

      addTeam: (teamData) => set(state => {
        const newTeam: Team = {
          ...teamData,
          id: `team-${Date.now()}`,
          score: 0,
          streak: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          totalTimeMs: 0,
          availablePowerups: ['FIFTY_FIFTY', 'DOUBLE_SCORE', 'FREEZE_TIMER']
        };
        return { 
          teams: [...state.teams, newTeam],
          activeTeamId: state.activeTeamId || newTeam.id
        };
      }),

      updateTeam: (id: string, updates: Partial<Team>) => set(state => ({
        teams: state.teams.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteTeam: (id: string) => set(state => ({
        teams: state.teams.filter(t => t.id !== id)
      })),

      submitAnswer: (teamId: string, answer: SourceType, responseTimeMs: number) => {
        const { currentQuestionIndex, mediaList, teams, submissions } = get();
        const currentMedia = mediaList[currentQuestionIndex];
        if (!currentMedia) return;

        const isCorrect = answer === currentMedia.source;
        const team = teams.find(t => t.id === teamId);

        const submission: AnswerSubmission = {
          teamId,
          teamName: team ? team.name : 'Unknown Team',
          answer,
          responseTimeMs,
          timestamp: Date.now(),
          isCorrect,
          pointsEarned: isCorrect ? 10 : 0
        };

        const updatedSubmissions = {
          ...submissions,
          [currentQuestionIndex]: {
            ...(submissions[currentQuestionIndex] || {}),
            [teamId]: submission
          }
        };

        set({ 
          submissions: updatedSubmissions,
          isTimerRunning: false,
          timerTargetTimeMs: null
        });

        get().revealAnswer();
      },

      resetLeaderboard: () => set(state => ({
        teams: state.teams.map(t => ({
          ...t,
          score: 0,
          streak: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          totalTimeMs: 0,
          lastAnswer: undefined
        }))
      })),

      addReaction: (emoji: string) => set(state => ({
        reactions: [...state.reactions.slice(-30), { id: `react-${Date.now()}-${Math.random()}`, emoji, timestamp: Date.now() }]
      })),

      updateSettings: (newSettings: Partial<QuizSettings>) => set(state => {
        const updatedSettings = { ...state.settings, ...newSettings };
        const isUntimed = updatedSettings.questionDuration === 0;
        return {
          settings: updatedSettings,
          timerRemaining: updatedSettings.questionDuration,
          timerTargetTimeMs: isUntimed ? null : (state.phase === 'QUESTION_ACTIVE' ? Date.now() + updatedSettings.questionDuration * 1000 : null),
          isTimerRunning: !isUntimed && state.phase === 'QUESTION_ACTIVE'
        };
      }),

      importFullState: (newState: GameState) => set(newState)
    }),
    {
      name: 'quiz_platform_storage_v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mediaList: state.mediaList,
        deletedUrls: state.deletedUrls,
        teams: state.teams,
        settings: state.settings,
        quizTitle: state.quizTitle
      })
    }
  )
);
