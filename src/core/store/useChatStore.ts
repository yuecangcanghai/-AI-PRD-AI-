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

interface ChatState {
  messages: Message[];
  isGenerating: boolean;
  onboardingCard: OnboardingCard | null;
  newbieGuide: NewbieGuideState;
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
        set((state) => ({ messages: [...state.messages, message] })),
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
      clearMessages: () => set({ messages: [], isGenerating: false, onboardingCard: null, newbieGuide: { step: 0, answers: {}, done: false, skipped: false } }),
    }),
    {
      name: 'productforge-chat',
      version: 1,
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
        };
      },
    },
  ),
);
