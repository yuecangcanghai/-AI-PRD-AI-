import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, StructuredCard } from '../types/chat';

// A standalone product-brief card shown once at first load (not attached to any message).
export interface OnboardingCard {
  submitted: boolean;
}

interface ChatState {
  messages: Message[];
  isGenerating: boolean;
  onboardingCard: OnboardingCard | null;
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
      clearMessages: () => set({ messages: [], isGenerating: false, onboardingCard: null }),
    }),
    { name: 'productforge-chat' },
  ),
);
