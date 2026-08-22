export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOptions {
  messages: ChatMessage[];
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export interface IModelAdapter {
  name: string;
  chat(options: StreamOptions): AbortController;
  validateKey(apiKey: string, model: string): Promise<boolean>;
}
