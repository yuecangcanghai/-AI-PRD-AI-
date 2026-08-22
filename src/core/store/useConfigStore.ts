import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelConfig, ModelProvider, Language, AskMode, MODEL_OPTIONS } from '../types/config';

interface ConfigState {
  modelConfig: ModelConfig;
  setModelConfig: (config: Partial<ModelConfig>) => void;
  setProvider: (provider: ModelProvider) => void;
  setLanguage: (language: Language) => void;
  setAskMode: (askMode: AskMode) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      modelConfig: {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-5',
        temperature: 0.7,
        maxTokens: 4096,
        language: 'zh',
        askMode: 'standard',
        customEndpoint: '',
        customModel: '',
      },
      setModelConfig: (config) =>
        set((state) => ({ modelConfig: { ...state.modelConfig, ...config } })),
      setProvider: (provider) =>
        set((state) => ({
          modelConfig: {
            ...state.modelConfig,
            provider,
            apiKey: '',
            model: provider === 'custom' ? '' : MODEL_OPTIONS[provider].models[0],
          },
        })),
      setLanguage: (language) =>
        set((state) => ({ modelConfig: { ...state.modelConfig, language } })),
      setAskMode: (askMode) =>
        set((state) => ({ modelConfig: { ...state.modelConfig, askMode } })),
    }),
    { name: 'productforge-config' },
  ),
);
