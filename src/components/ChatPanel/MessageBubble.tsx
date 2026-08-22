import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../core/types/chat';
import { StructuredCard } from './StructuredCard';
import { orchestrator } from '../../core/orchestrator/Orchestrator';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`mb-4 ${isUser ? 'flex flex-col items-end' : ''}`}>
      <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
        <span
          className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${isUser ? 'bg-[#667] text-white' : 'bg-[#4ecdc4] text-black'}
          `}
        >
          {isUser ? 'U' : 'AI'}
        </span>
        <span className="text-gray-400 text-xs">{isUser ? '你' : '产品顾问'}</span>
      </div>

      {(message.content || message.isStreaming) && (
        <div
          className={`
            max-w-[85%] px-3 py-2.5 text-sm leading-relaxed
            ${isUser
              ? 'bg-[#2563eb] text-white rounded-xl rounded-tl-none'
              : 'bg-[#1a1a2e] text-gray-200 rounded-xl rounded-tl-none'
            }
          `}
        >
          {message.isStreaming && !message.content ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          )}
        </div>
      )}

      {!isUser && message.structuredCard && (
        <StructuredCard
          card={message.structuredCard}
          onSubmit={(values) =>
            orchestrator.submitCard(message.id, message.structuredCard!, values)
          }
        />
      )}
    </div>
  );
}
