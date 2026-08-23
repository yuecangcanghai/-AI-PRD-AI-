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

// Guard 3: Module-level flag — ensures completeNewbieGuide fires at most
// ONCE per page session, regardless of how many zustand state changes occur.
let _completionFired = false;

useChatStore.subscribe((state) => {
  const { done, skipped } = state.newbieGuide;
  if (done && !_prevDone && !skipped && !_completionFired) {
    _completionFired = true; // Set BEFORE calling async function
    console.log('[storeSubscribers] Firing completeNewbieGuide');
    orchestrator.completeNewbieGuide().catch((err) => {
      // Belt-and-suspenders: the Orchestrator already has a try-catch inside
      // completeNewbieGuide, but we catch here too so that NO unhandled
      // rejection can ever escape to crash the app.
      console.error('[storeSubscribers] completeNewbieGuide failed:', err);
    });
  }
  _prevDone = done;
});
