import type { Message } from '../types/playground';

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

export function cleanup(
  setIsLoading: (loading: boolean) => void,
  apiClientRef: React.MutableRefObject<unknown>,
  abortControllerRef: React.MutableRefObject<AbortController | null>
): void {
  setIsLoading(false);
  abortControllerRef.current = null;
  apiClientRef.current = null;
}
