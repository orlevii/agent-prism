import { Ollama } from 'ollama/browser';
import type { Message } from '../types/playground';

/**
 * Handles errors that occur during chat requests
 * @param err - The error that occurred
 * @param assistantMessageIds - IDs of assistant messages to remove on error
 * @param setError - Function to set error state
 * @param setMessages - Function to update messages state
 */
export function handleChatError(
  err: unknown,
  assistantMessageIds: string[],
  setError: (error: string | null) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
): void {
  if (err instanceof Error && err.name === 'AbortError') {
    setError('Request cancelled');
  } else {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    setError(errorMessage);
  }

  // Remove all streaming messages on error
  setMessages((prev) => prev.filter((msg) => !assistantMessageIds.includes(msg.id)));
}

/**
 * Cleans up after a chat request completes or errors
 * @param setIsLoading - Function to set loading state
 * @param ollamaClientRef - Ref to the Ollama client instance
 * @param abortControllerRef - Ref to the AbortController instance
 */
export function cleanup(
  setIsLoading: (loading: boolean) => void,
  ollamaClientRef: React.MutableRefObject<Ollama | null>,
  abortControllerRef: React.MutableRefObject<AbortController | null>
): void {
  setIsLoading(false);
  abortControllerRef.current = null;
  ollamaClientRef.current = null;
}
