import { useState, KeyboardEvent } from 'react';
import { useChatStore } from '../../core/store/useChatStore';
import { useConfigStore } from '../../core/store/useConfigStore';
import { Language, AskMode, LANGUAGE_OPTIONS, ASK_MODE_OPTIONS } from '../../core/types/config';

interface Props {
  onSend: (message: string) => void;
}

export function ChatInput({ onSend }: Props) {
  const [input, setInput] = useState('');
  const { isGenerating } = useChatStore();
  const { modelConfig, setLanguage, setAskMode } = useConfigStore();

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMode = () => {
    setAskMode(modelConfig.askMode === 'standard' ? 'efficient' : 'standard');
  };

  return (
    <div className="p-3 border-t border-[#2d2d44] bg-[#0f0f1a]">
      <div className="flex items-center gap-2 mb-2">
        <select
          className="bg-[#1a1a2e] border border-[#2d2d44] text-gray-300 text-xs px-2 py-1 rounded outline-none focus:border-[#4ecdc4]"
          value={modelConfig.language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          title="回复语言"
        >
          {(Object.entries(LANGUAGE_OPTIONS) as [Language, string][]).map(([key, label]) => (
            <option key={key} value={key}>🌐 {label}</option>
          ))}
        </select>

        <button
          onClick={toggleMode}
          className={`text-xs px-2.5 py-1 rounded border transition-colors ${
            modelConfig.askMode === 'efficient'
              ? 'bg-[#1a2e2e] border-[#4ecdc4] text-[#4ecdc4]'
              : 'bg-[#1a1a2e] border-[#2d2d44] text-gray-400 hover:text-gray-200'
          }`}
          title="切换提问模式：标准（每轮一个问题）/ 高效（结构化卡片）"
        >
          {modelConfig.askMode === 'efficient' ? '⚡ ' : '💬 '}
          {ASK_MODE_OPTIONS[modelConfig.askMode as AskMode]}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3.5 py-2.5 rounded-lg outline-none focus:border-[#4ecdc4] transition-colors"
          placeholder="描述你的想法或回答问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
        />
        <button
          onClick={handleSend}
          disabled={isGenerating || !input.trim()}
          className="bg-[#4ecdc4] text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#3dbdb5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  );
}
