import type { ChatRequest, StreamEvent } from '../types/agent';

export const initializeApiClient = (baseUrl: string) => {
  return {
    baseUrl,
    abortController: new AbortController(),
  };
};

export const makeStreamingChatRequest = async function* (
  client: ReturnType<typeof initializeApiClient>,
  request: ChatRequest
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${client.baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal: client.abortController.signal,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line) as StreamEvent;
          yield data;
        } catch {
          // Skip invalid JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
