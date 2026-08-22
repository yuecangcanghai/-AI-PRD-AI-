import { useState } from 'react';
import { useConfigStore } from '../../core/store/useConfigStore';
import { ModelProvider, MODEL_OPTIONS } from '../../core/types/config';

export function ModelConfig() {
  const { modelConfig, setModelConfig, setProvider } = useConfigStore();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { getAdapter } = await import('../../core/ai');
      const adapter = getAdapter(modelConfig.provider);
      const valid = await adapter.validateKey(modelConfig.apiKey, modelConfig.model);
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
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

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

      <div>
        <label className="text-gray-400 text-xs block mb-1">模型</label>
        <select
          className="w-full bg-[#1a1a2e] border border-[#2d2d44] text-gray-200 text-sm px-3 py-2 rounded"
          value={modelConfig.model}
          onChange={(e) => setModelConfig({ model: e.target.value })}
        >
          {MODEL_OPTIONS[modelConfig.provider].models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleTestKey}
        disabled={testing || !modelConfig.apiKey}
        className="bg-[#2d2d44] text-gray-200 text-sm px-4 py-2 rounded hover:bg-[#3d3d54] transition-colors disabled:opacity-40"
      >
        {testing ? '验证中...' : '验证 API Key'}
      </button>
      {testResult === 'success' && <p className="text-green-400 text-xs">✓ Key 验证成功</p>}
      {testResult === 'error' && <p className="text-red-400 text-xs">✗ Key 验证失败，请检查</p>}
    </div>
  );
}
