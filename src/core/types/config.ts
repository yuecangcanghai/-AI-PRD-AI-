export type ModelProvider = 'openai' | 'claude' | 'deepseek' | 'qwen' | 'zhipu' | 'custom';

export type Language = 'zh' | 'en' | 'ja';

export type AskMode = 'standard' | 'efficient';

export interface ModelConfig {
  provider: ModelProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  language: Language;
  askMode: AskMode;
  // Custom provider fields
  customEndpoint: string;
  customModel: string;
}

export const LANGUAGE_OPTIONS: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
};

// Instruction injected into the system prompt so the AI answers in the chosen language.
export const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  zh: '请始终使用简体中文与用户交流，所有提问和 PRD 输出均使用中文。',
  en: 'Always communicate with the user in English. All questions and the PRD output must be written in English.',
  ja: '常に日本語でユーザーと対話してください。すべての質問と PRD の出力は日本語で記述してください。',
};

export const ASK_MODE_OPTIONS: Record<AskMode, string> = {
  standard: '标准模式',
  efficient: '高效模式',
};

export const MODEL_OPTIONS: Record<ModelProvider, { label: string; models: string[]; endpoint: string }> = {
  openai: {
    label: 'OpenAI',
    models: ['gpt-5', 'gpt-5-mini', 'gpt-4.1', 'gpt-4.1-mini'],
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  claude: {
    label: 'Anthropic Claude',
    models: ['claude-opus-5', 'claude-sonnet-5', 'claude-sonnet-4'],
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  deepseek: {
    label: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    endpoint: 'https://api.deepseek.com/chat/completions',
  },
  qwen: {
    label: '通义千问',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  },
  zhipu: {
    label: '智谱 GLM',
    models: ['glm-5.3', 'glm-5.2', 'glm-5.1'],
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  },
  custom: {
    label: '自定义（OpenAI 兼容）',
    models: [],
    endpoint: '',
  },
};
