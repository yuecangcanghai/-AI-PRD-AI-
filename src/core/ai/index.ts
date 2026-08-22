import { ModelProvider } from '../types/config';
import { IModelAdapter } from './ModelAdapter';
import { OpenAIAdapter } from './adapters/openai';
import { ClaudeAdapter } from './adapters/claude';
import { DeepSeekAdapter } from './adapters/deepseek';
import { QwenAdapter } from './adapters/qwen';
import { ZhipuAdapter } from './adapters/zhipu';

const adapters: Record<ModelProvider, IModelAdapter> = {
  openai: new OpenAIAdapter(),
  claude: new ClaudeAdapter(),
  deepseek: new DeepSeekAdapter(),
  qwen: new QwenAdapter(),
  zhipu: new ZhipuAdapter(),
};

export function getAdapter(provider: ModelProvider): IModelAdapter {
  return adapters[provider];
}

export type { IModelAdapter, ChatMessage, StreamOptions } from './ModelAdapter';
