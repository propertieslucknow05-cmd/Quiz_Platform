'use client';

import { useQuizStore } from './store';
import { GameState } from '@/types/quiz';

const SYNC_CHANNEL_NAME = 'AI_VS_HUMAN_QUIZ_SYNC';
let broadcastChannel: BroadcastChannel | null = null;

export function initSyncEngine() {
  if (typeof window === 'undefined') return;

  if (!broadcastChannel && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);

    broadcastChannel.onmessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'STATE_UPDATE' && event.data.state) {
        const store = useQuizStore.getState();
        // Preserve local mediaList while importing state to avoid heavy array copy overhead
        store.importFullState({
          ...event.data.state,
          mediaList: store.mediaList
        });
      }
    };
  }

  let isReceiving = false;
  let lastBroadcastTime = 0;

  useQuizStore.subscribe((state) => {
    if (isReceiving) return;

    // Throttle high-frequency updates to max 20 broadcasts per second (50ms)
    const now = Date.now();
    if (now - lastBroadcastTime < 45) return;
    lastBroadcastTime = now;

    if (broadcastChannel) {
      // Pick lightweight dynamic payload (omit static 120-item mediaList)
      const statePayload: Partial<GameState> = {
        quizId: state.quizId,
        quizTitle: state.quizTitle,
        phase: state.phase,
        currentQuestionIndex: state.currentQuestionIndex,
        currentRound: state.currentRound,
        timerRemaining: state.timerRemaining,
        isTimerRunning: state.isTimerRunning,
        teams: state.teams,
        activeTeamId: state.activeTeamId,
        submissions: state.submissions,
        reactions: state.reactions,
        settings: state.settings,
      };

      try {
        broadcastChannel.postMessage({ type: 'STATE_UPDATE', state: statePayload });
      } catch (err) {
        console.error('Sync broadcast failed:', err);
      }
    }
  });
}
