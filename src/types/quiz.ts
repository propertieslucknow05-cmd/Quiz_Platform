export type MediaType = 'IMAGE' | 'VIDEO';
export type SourceType = 'AI' | 'HUMAN';
export type PowerupType = 'FIFTY_FIFTY' | 'DOUBLE_SCORE' | 'FREEZE_TIMER' | 'STEAL_POINTS' | 'SECOND_CHANCE';

export type GamePhase = 
  | 'LOBBY' 
  | 'QUESTION_ACTIVE' 
  | 'ANSWER_LOCKED' 
  | 'ANSWER_REVEAL' 
  | 'ROUND_COMPLETED'
  | 'LEADERBOARD' 
  | 'WINNER_PODIUM';

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  source: SourceType;
  attribution: string;
  prompt?: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdDate: string;
  fileSize?: string;
}

export interface Team {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  streak: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalTimeMs: number;
  lastAnswer?: {
    choice: SourceType;
    responseTimeMs: number;
    isCorrect: boolean;
    pointsEarned: number;
    submittedAt: number;
  };
  availablePowerups: PowerupType[];
  activePowerup?: PowerupType;
}

export interface QuizSettings {
  questionDuration: number;
  totalQuestions: number;
  autoAdvance: boolean;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  showCaptions: boolean;
  selectedCategories: string[];
}

export interface AnswerSubmission {
  teamId: string;
  teamName: string;
  answer: SourceType;
  responseTimeMs: number;
  timestamp: number;
  isCorrect: boolean;
  pointsEarned: number;
  powerupUsed?: PowerupType;
}

export interface AudienceReaction {
  id: string;
  emoji: string;
  timestamp: number;
}

export interface GameState {
  quizId: string;
  quizTitle: string;
  phase: GamePhase;
  currentQuestionIndex: number;
  currentRound: number;
  timerRemaining: number;
  timerTargetTimeMs?: number | null;
  isTimerRunning: boolean;
  mediaList: MediaItem[];
  deletedUrls: string[];
  teams: Team[];
  activeTeamId?: string;
  submissions: Record<number, Record<string, AnswerSubmission>>;
  reactions: AudienceReaction[];
  settings: QuizSettings;
}
