/**
 * Zustand store subscribers that bridge store state changes to orchestrator actions.
 *
 * Kept in a separate module to avoid circular imports:
 *   useChatStore → Orchestrator → useChatStore  (would be a cycle)
 *   storeSubscribers imports both (no cycle)
 */
import { useChatStore } from './useChatStore';
import { orchestrator } from '../orchestrator/Orchestrator';

// ── Newbie guide completion ─────────────────────────────────────────
// Fires when the user finishes answering all 5 newbie-guide questions.
//
// IMPORTANT: Initialize _prevDone from the *current* store state so that
// persist-rehydration (localStorage → store) does NOT re-trigger
// completeNewbieGuide() when a returning user reloads the page.
let _prevDone = useChatStore.getState().newbieGuide.done;
useChatStore.subscribe((state) => {
  const { done, skipped } = state.newbieGuide;
  if (done && !_prevDone && !skipped) {
    orchestrator.completeNewbieGuide();
  }
  _prevDone = done;
});
