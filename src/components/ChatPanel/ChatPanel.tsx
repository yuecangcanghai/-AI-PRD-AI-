import { useEffect, useRef } from 'react';
import { useChatStore } from '../../core/store/useChatStore';
import { usePRDStore } from '../../core/store/usePRDStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatStageChecklist } from './ChatStageChecklist';
import { OnboardingCard } from './OnboardingCard';
import { NewbieGuideFlow } from './NewbieGuideFlow';
import { orchestrator } from '../../core/orchestrator/Orchestrator';
import { Message } from '../../core/types/chat';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `你好！我是你的产品顾问。

请告诉我你在日常生活中观察到了什么让你觉得不方便、不合理、或者"为什么没人解决这个问题"的事情？

不需要是成熟的想法，一个模糊的感受就可以。我们一起来看看它值不值得做成产品。`,
  timestamp: Date.now(),
};

export function ChatPanel() {
  const { messages, addMessage, onboardingCard, newbieGuide, rehydrated } = useChatStore();
  const { prd } = usePRDStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // First-load: show newbie guide → onboarding card → welcome (in priority order).
  // Wait for zustand persist to finish restoring localStorage before deciding.
  useEffect(() => {
    if (!rehydrated) return;
    if (messages.length > 0 || onboardingCard || newbieGuide.step > 0) return;
    if (!prd.meta.oneLiner) {
      // Start the lightweight newbie guide instead of the full onboarding card.
      orchestrator.startNewbieGuide();
    } else {
      addMessage(WELCOME_MESSAGE);
    }
  }, [rehydrated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, onboardingCard]);

  const handleSend = (content: string) => {
    orchestrator.sendMessage(content);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1a]">
      <ChatStageChecklist />
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="p-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
        {newbieGuide.step >= 1 && !newbieGuide.done && <NewbieGuideFlow />}
        {onboardingCard && <OnboardingCard />}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
