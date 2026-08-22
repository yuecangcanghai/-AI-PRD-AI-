import { IModelAdapter, StreamOptions } from '../ModelAdapter';

/**
 * Generic adapter for any OpenAI-compatible API (Ollama, vLLM, LM Studio, Together,
 * Groq, OpenRouter, local models, etc.). The endpoint is supplied via StreamOptions.
 */
export class CustomAdapter implements IModelAdapter {
  name = 'custom';

  chat(options: StreamOptions): AbortController {
    const controller = new AbortController();
    const { messages, systemPrompt, model, temperature, maxTokens, apiKey, endpoint, onChunk, onDone, onError } = options;

    if (!endpoint) {
      onError(new Error('自定义模型需要填写 API 地址（Base URL）'));
      return controller;
    }

    const allMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages,
    ];

    // Normalise: ensure endpoint ends with /chat/completions
    const url = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const chatUrl = url.includes('/chat/completions') ? url : `${url}/chat/completions`;

    fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Custom API error: ${response.status} ${response.statusText}`);
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
            const data = trimmed.slice(6);
            if (data === '[DONE]') { onDone(); return; }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onChunk(content);
            } catch { /* skip */ }
          }
        }
        onDone();
      })
      .catch((err) => { if (err.name !== 'AbortError') onError(err); });

    return controller;
  }

  async validateKey(apiKey: string, model: string, endpoint?: string): Promise<boolean> {
    if (!endpoint) return false;
    try {
      const url = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
      const chatUrl = url.includes('/chat/completions') ? url : `${url}/chat/completions`;
      const res = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
