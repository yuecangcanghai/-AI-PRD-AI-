export type ModelProvider = 'openai' | 'claude' | 'deepseek' | 'qwen' | 'zhipu';

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
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  claude: {
    label: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  deepseek: {
    label: 'DeepSeek',
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-v4-flash-vision-exp'],
    endpoint: 'https://api.deepseek.com/chat/completions',
  },
  qwen: {
    label: '通义千问',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  },
  zhipu: {
    label: '智谱 GLM',
    models: ['glm-4-flash', 'glm-4'],
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  },
};
