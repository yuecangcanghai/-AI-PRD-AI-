import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, StructuredCard } from '../types/chat';

// A standalone product-brief card shown once at first load (not attached to any message).
export interface OnboardingCard {
  submitted: boolean;
}

// Newbie guide: lightweight pre-onboarding flow with simple, conversational questions.
export interface NewbieGuideAnswers {
  whatToBuild: string;
  whoNeedsIt: string;
  whatSituation: string;
  currentSolution: string;
  painDepth: string;
}

export interface NewbieGuideState {
  step: number; // 0 = not started, 1–5 = current question, 6 = done
  answers: Partial<NewbieGuideAnswers>;
  done: boolean;
  skipped: boolean;
}

// ── Message volume limits ───────────────────────────────────────────
// A runaway completeNewbieGuide loop once appended thousands of messages,
// all of which were persisted. On reload ChatPanel renders every message
// (no virtualisation, each one parsed by react-markdown), which froze the
// page. These caps make that failure mode structurally impossible.

/** Hard ceiling on messages held in memory. Oldest are dropped past this. */
export const MAX_MESSAGES = 200;

/** How many messages get written to localStorage. Lower, to stay far from quota. */
const MAX_PERSISTED_MESSAGES = 80;

/**
 * A persisted message count above this can only come from a runaway loop —
 * a full 7-stage session tops out around 70 messages. Such a session is
 * treated as unrecoverable and reset outright.
 */
const RUNAWAY_MESSAGE_COUNT = 300;

const EMPTY_GUIDE: NewbieGuideState = { step: 0, answers: {}, done: false, skipped: false };

/** Keep only the newest `max` messages. */
function capMessages(msgs: Message[], max: number = MAX_MESSAGES): Message[] {
  return msgs.length > max ? msgs.slice(-max) : msgs;
}

interface ChatState {
  messages: Message[];
  isGenerating: boolean;
  onboardingCard: OnboardingCard | null;
  newbieGuide: NewbieGuideState;
  /** Set to true once zustand persist has finished restoring from localStorage. */
  rehydrated: boolean;
  startNewbieGuide: () => void;
  answerNewbieGuide: (answer: string) => void;
  skipNewbieGuide: () => void;
  addMessage: (message: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  setLastAssistantCard: (card: StructuredCard) => void;
  markCardSubmitted: (messageId: string) => void;
  showOnboardingCard: () => void;
  dismissOnboardingCard: () => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isGenerating: false,
      onboardingCard: null,
      newbieGuide: { step: 0, answers: {}, done: false, skipped: false },
      rehydrated: false,
      startNewbieGuide: () =>
        set((state) => {
          if (state.newbieGuide.step > 0) return state; // already started
          return { newbieGuide: { ...state.newbieGuide, step: 1 } };
        }),
      answerNewbieGuide: (answer) =>
        set((state) => {
          const ng = state.newbieGuide;
          const keys: (keyof NewbieGuideAnswers)[] = [
            'whatToBuild', 'whoNeedsIt', 'whatSituation', 'currentSolution', 'painDepth',
          ];
          const key = keys[ng.step - 1];
          const newAnswers = { ...ng.answers, [key]: answer };
          const nextStep = ng.step + 1;
          const done = nextStep > 5;
          return { newbieGuide: { ...ng, step: nextStep, answers: newAnswers, done } };
        }),
      skipNewbieGuide: () =>
        set((state) => ({ newbieGuide: { ...state.newbieGuide, skipped: true, done: true } })),
      addMessage: (message) =>
        set((state) => ({ messages: capMessages([...state.messages, message]) })),
      updateLastAssistantMessage: (content) =>
        set((state) => {
          const msgs = [...state.messages];
          let lastIdx = -1;
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === 'assistant') { lastIdx = i; break; }
          }
          if (lastIdx >= 0) {
            msgs[lastIdx] = { ...msgs[lastIdx], content, isStreaming: false };
          }
          return { messages: msgs };
        }),
      setLastAssistantCard: (card) =>
        set((state) => {
          const msgs = [...state.messages];
          let lastIdx = -1;
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === 'assistant') { lastIdx = i; break; }
          }
          if (lastIdx >= 0) {
            msgs[lastIdx] = { ...msgs[lastIdx], structuredCard: card };
          }
          return { messages: msgs };
        }),
      markCardSubmitted: (messageId) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId && m.structuredCard
              ? { ...m, structuredCard: { ...m.structuredCard, submitted: true } }
              : m,
          ),
        })),
      showOnboardingCard: () => set({ onboardingCard: { submitted: false } }),
      dismissOnboardingCard: () => set({ onboardingCard: null }),
      setStreaming: (streaming) => set({ isGenerating: streaming }),
      clearMessages: () => set({ messages: [], isGenerating: false, onboardingCard: null, newbieGuide: { ...EMPTY_GUIDE } }),
    }),
    {
      name: 'productforge-chat',
      version: 2,
      // Only persist durable state. `rehydrated` and `isGenerating` are
      // per-session flags — persisting isGenerating:true (tab closed during a
      // stream) would leave the UI stuck showing "generating" forever.
      partialize: (state) => ({
        messages: capMessages(state.messages, MAX_PERSISTED_MESSAGES),
        onboardingCard: state.onboardingCard,
        newbieGuide: state.newbieGuide,
      }) as unknown as ChatState,
      migrate: (persisted, fromVersion) => {
        const p = (persisted || {}) as Partial<ChatState>;
        if (fromVersion >= 2) return p as ChatState;

        // v1 → v2: repair state left behind by the runaway-loop bug.
        const msgs = Array.isArray(p.messages) ? p.messages : [];
        const guide: NewbieGuideState = { ...EMPTY_GUIDE, ...(p.newbieGuide || {}) };
        const answerCount = Object.values(guide.answers || {}).filter(Boolean).length;

        // Two corruption signatures:
        //  1. Absurd message count — only a loop can produce it.
        //  2. Guide flagged done without the 5 answers that should have produced it.
        const isRunaway = msgs.length > RUNAWAY_MESSAGE_COUNT;
        const isStuckGuide = guide.done && !guide.skipped && answerCount < 5;

        if (isRunaway || isStuckGuide) {
          console.warn(
            `[useChatStore] Corrupted session detected (messages=${msgs.length}, ` +
              `guideDone=${guide.done}, answers=${answerCount}). Resetting chat state.`,
          );
          return {
            ...p,
            messages: [],
            onboardingCard: null,
            newbieGuide: { ...EMPTY_GUIDE },
          } as ChatState;
        }

        return {
          ...p,
          messages: capMessages(msgs, MAX_PERSISTED_MESSAGES),
        } as ChatState;
      },
      onRehydrateStorage: () => {
        // Called after persist finishes restoring from localStorage.
        return (state) => {
          if (state) state.rehydrated = true;
        };
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<ChatState> | undefined;
        return {
          ...current,
          ...(p || {}),
          // Deep-merge nested objects that may be missing from old localStorage
          newbieGuide: {
            ...(current as ChatState).newbieGuide,
            ...((p as ChatState | undefined)?.newbieGuide || {}),
          },
          // Force per-session flags back to their initial values. Pre-v2
          // localStorage persisted these, so a tab closed mid-stream could
          // otherwise restore isGenerating:true and lock the input forever.
          isGenerating: false,
          rehydrated: false,
        };
      },
    },
  ),
);
