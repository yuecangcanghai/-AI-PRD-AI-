import { useState, useEffect } from 'react';
import { StageIndicator } from './components/StageIndicator';
import { ChatPanel } from './components/ChatPanel/ChatPanel';
import { ProductCanvas } from './components/Canvas/ProductCanvas';
import { SettingsModal } from './components/Settings/SettingsModal';
import { useConfigStore } from './core/store/useConfigStore';
import { usePRDStore } from './core/store/usePRDStore';
import { useChatStore } from './core/store/useChatStore';
import { exportPRD } from './utils/export';
import { resetSession } from './utils/resetSession';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { modelConfig } = useConfigStore();
  const { messages } = useChatStore();

  useEffect(() => {
    if (!modelConfig.apiKey && messages.length === 0) {
      setSettingsOpen(true);
    }
  }, []);

  return (
    <div className="h-screen bg-[#0a0a14] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-5 py-2.5 bg-[#1a1a2e] border-b border-[#2d2d44] shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">⚡ ProductForge</span>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-gray-400 text-xs">AI 产品开发顾问</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#4ecdc4] text-xs">● 已保存</span>
          <button
            className="bg-[#2d2d44] text-gray-200 text-xs px-3 py-1.5 rounded hover:bg-[#3d3d54] transition-colors"
            onClick={() => exportPRD(usePRDStore.getState().prd)}
          >
            导出 PRD
          </button>
          <button
            className="bg-[#2d2d44] text-gray-200 text-xs px-3 py-1.5 rounded hover:bg-[#3d3d54] transition-colors"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙ 设置
          </button>
          <button
            className="bg-[#2d2d44] text-gray-400 text-xs px-3 py-1.5 rounded hover:bg-[#4a2d2d] hover:text-red-300 transition-colors"
            title="对话卡住或异常时，用这里清空会话重新开始"
            onClick={() => {
              if (window.confirm('重置会话会清空当前对话、PRD 内容和阶段进度（API Key 与模型设置会保留）。\n\n确定继续吗？')) {
                resetSession();
              }
            }}
          >
            🔄 重置会话
          </button>
        </div>
      </header>

      <StageIndicator />

      <main className="flex-1 flex overflow-hidden">
        <ChatPanel />
        <ProductCanvas />
      </main>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
