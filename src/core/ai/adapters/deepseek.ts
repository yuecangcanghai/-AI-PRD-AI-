import { IModelAdapter, StreamOptions } from '../ModelAdapter';
import { MODEL_OPTIONS } from '../../types/config';

export class DeepSeekAdapter implements IModelAdapter {
  name = 'deepseek';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, onChunk, onDone, onError } = options;
    const allMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages];

    fetch(MODEL_OPTIONS.deepseek.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: allMessages, temperature, max_tokens: maxTokens, stream: true }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') { onDone(); return; }
            try { const parsed = JSON.parse(data); const content = parsed.choices?.[0]?.delta?.content; if (content) onChunk(content); } catch { /* skip */ }
          }
        }
        onDone();
      })
      .catch((err) => { if (err.name !== 'AbortError') onError(err); });
    return controller;
  }

  async validateKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const res = await fetch(MODEL_OPTIONS.deepseek.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
      });
      return res.ok;
    } catch { return false; }
  }
}
