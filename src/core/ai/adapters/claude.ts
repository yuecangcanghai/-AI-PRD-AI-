import { IModelAdapter, StreamOptions } from '../ModelAdapter';
import { MODEL_OPTIONS } from '../../types/config';

export class ClaudeAdapter implements IModelAdapter {
  name = 'claude';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, onChunk, onDone, onError } = options;

    fetch(MODEL_OPTIONS.claude.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
        }
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
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text;
                if (text) onChunk(text);
              } else if (parsed.type === 'message_stop') {
                onDone();
                return;
              }
            } catch {
              // skip
            }
          }
        }
        onDone();
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err);
      });

    return controller;
  }

  async validateKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const res = await fetch(MODEL_OPTIONS.claude.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
