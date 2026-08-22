import { useState } from 'react';
import { useConfigStore } from '../../core/store/useConfigStore';
import { ModelProvider, MODEL_OPTIONS } from '../../core/types/config';

export function ModelConfig() {
  const { modelConfig, setModelConfig, setProvider } = useConfigStore();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const isCustom = modelConfig.provider === 'custom';

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { getAdapter } = await import('../../core/ai');
      const adapter = getAdapter(modelConfig.provider);
      const model = isCustom ? (modelConfig.customModel || modelConfig.model) : modelConfig.model;
      // Custom adapter uses a different validateKey signature with endpoint
      const valid = isCustom
        ? await (adapter as any).validateKey(modelConfig.apiKey, model, modelConfig.customEndpoint)
        : await adapter.validateKey(modelConfig.apiKey, model);
      setTestResult(valid ? 'success' : 'error');
    } catch {
      setTestResult('error');
    }
    setTesting(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-gray-400 text-xs block mb-1">模型提供商</label>
        <select
          className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
          value={modelConfig.provider}
          onChange={(e) => setProvider(e.target.value as ModelProvider)}
        >
          {(Object.entries(MODEL_OPTIONS) as [ModelProvider, typeof MODEL_OPTIONS[ModelProvider]][]).map(([key, val]) => (
            <>
              {key === 'custom' && <option key="__sep" disabled>─────────────</option>}
              <option key={key} value={key}>{val.label}</option>
            </>
          ))}
        </select>
      </div>

      {/* Custom provider fields — visually distinct panel */}
      {isCustom && (
        <div className="border border-[#4ecdc4]/20 rounded-lg p-3 bg-[#0a1a1a]">
          <p className="text-[#4ecdc4] text-xs font-bold mb-3">🔧 自定义模型配置</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-gray-400 text-xs block mb-1">API 地址（Base URL）</label>
              <input
                type="text"
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
                placeholder="https://your-api.com/v1/chat/completions"
                value={modelConfig.customEndpoint}
                onChange={(e) => setModelConfig({ customEndpoint: e.target.value })}
              />
              <p className="text-gray-500 text-[10px] mt-1">
                支持所有 OpenAI 兼容接口（Ollama、vLLM、LM Studio、OpenRouter、Groq 等）
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">模型名称</label>
              <input
                type="text"
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
                placeholder="例如：llama3.1、qwen2.5-72b、mistral-large"
                value={modelConfig.customModel}
                onChange={(e) => setModelConfig({ customModel: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="text-gray-400 text-xs block mb-1">API Key</label>
        <input
          type="password"
          className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
          placeholder="输入你的 API Key"
          value={modelConfig.apiKey}
          onChange={(e) => setModelConfig({ apiKey: e.target.value })}
        />
      </div>

      {/* Model dropdown for standard providers */}
      {!isCustom && (() => {
        const models = MODEL_OPTIONS[modelConfig.provider].models;
        // Fallback: if persisted model is no longer in the list, use the first available.
        const safeModel = models.includes(modelConfig.model) ? modelConfig.model : models[0];
        if (safeModel !== modelConfig.model) {
          // Defer update to avoid setState during render
          setTimeout(() => setModelConfig({ model: safeModel }), 0);
        }
        return (
          <div>
            <label className="text-gray-400 text-xs block mb-1">模型</label>
            <select
              className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
              value={safeModel}
              onChange={(e) => setModelConfig({ model: e.target.value })}
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        );
      })()}

      <button
        onClick={handleTestKey}
        disabled={testing || !modelConfig.apiKey || (isCustom && !modelConfig.customEndpoint)}
        className="bg-[#2d2d44] text-gray-200 text-sm px-4 py-2 rounded hover:bg-[#3d3d54] transition-colors disabled:opacity-40"
      >
        {testing ? '验证中...' : '验证 API Key'}
      </button>
      {testResult === 'success' && <p className="text-green-400 text-xs">✓ Key 验证成功</p>}
      {testResult === 'error' && <p className="text-red-400 text-xs">✗ Key 验证失败，请检查</p>}
    </div>
  );
}
