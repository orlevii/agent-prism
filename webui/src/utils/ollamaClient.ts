import { Ollama } from 'ollama/browser';
import type { OllamaTool } from '../types/playground';
import type { ApiMessage } from './messageBuilder';

export interface ChatRequestOptions {
  model: string;
  messages: ApiMessage[];
  temperature: number;
  enableThinking: boolean;
  tools?: OllamaTool[];
}

/**
 * Initializes an Ollama client and creates an abort controller
 * @param baseUrl - Ollama server base URL
 * @param ollamaClientRef - Ref to store the Ollama client instance
 * @param abortControllerRef - Ref to store the AbortController instance
 * @returns Initialized Ollama client
 */
export function initializeOllamaClient(
  baseUrl: string,
  ollamaClientRef: React.MutableRefObject<Ollama | null>,
  abortControllerRef: React.MutableRefObject<AbortController | null>
): Ollama {
  const ollama = new Ollama({ host: baseUrl });
  ollamaClientRef.current = ollama;
  abortControllerRef.current = new AbortController();
  return ollama;
}

/**
 * Makes a streaming chat request to Ollama
 * @param ollama - Ollama client instance
 * @param options - Chat request options
 * @returns Async iterable stream of chat responses
 */
export async function makeStreamingChatRequest(ollama: Ollama, options: ChatRequestOptions) {
  return await ollama.chat({
    model: options.model,
    messages: options.messages,
    stream: true,
    options: {
      temperature: options.temperature,
    },
    think: options.enableThinking,
    ...(options.tools && { tools: options.tools }),
  });
}
