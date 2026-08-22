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
    models: [
      'gpt-5.6-terra',   // Best balance of reasoning and cost (Aug 2026 flagship)
      'gpt-5.6-sol',     // Most powerful reasoning (advanced tasks)
      'gpt-5.6-luna',    // Affordable reasoning (fast & cheap)
      'gpt-5.4-nano',    // Ultra-fast, ultra-cheap
      'gpt-4.1',         // Best non-reasoning multimodal
      'gpt-4.1-mini',    // Balanced non-reasoning
    ],
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  claude: {
    label: 'Anthropic Claude',
    models: [
      'claude-sonnet-5-20250715',  // Best speed/intelligence ratio (Jul 2026)
      'claude-opus-4-8-20260501',  // Frontier reasoning flagship (May 2026)
      'claude-sonnet-4-6-20260201', // Advanced coding & agents
      'claude-haiku-4-5-20251001', // Speed & cost efficiency
    ],
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  deepseek: {
    label: 'DeepSeek',
    models: [
      'deepseek-v4-pro',             // V4-Pro-0813 旗舰推理
      'deepseek-v4-flash',           // V4-Flash-0731 快速均衡
      'deepseek-v4-flash-vision-exp', // 实验性多模态（支持图片输入）
    ],
    endpoint: 'https://api.deepseek.com/chat/completions',
  },
  qwen: {
    label: '通义千问',
    models: [
      'qwen3.8-max',  // Latest flagship (Jul 2026)
      'qwen3-max',    // Previous flagship
      'qwen3-plus',   // Balanced performance
      'qwen3-turbo',  // Fast & affordable
    ],
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  },
  zhipu: {
    label: '智谱 GLM',
    models: [
      'glm-5.3',  // Latest (2026, +50% coding vs 5.2)
      'glm-5.2',  // Previous generation
      'glm-4.7',  // Stable & affordable
    ],
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  },
  custom: {
    label: '✏️ 自定义（OpenAI 兼容）',
    models: [],
    endpoint: '',
  },
};
