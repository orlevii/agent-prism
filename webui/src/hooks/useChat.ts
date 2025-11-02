import { useState, useCallback, useRef } from 'react';
import type { PlaygroundSettings } from '../types/playground';
import type { ModelMessage } from '../types/message';
import { buildApiMessagesFromModelMessages } from '../utils/messageBuilder';
import { initializeApiClient, makeStreamingChatRequest } from '../utils/apiClient';
import { useStreamingResponse } from './useStreamingResponse';

export function useChat() {
  const [messages, setMessages] = useState<ModelMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiClientRef = useRef<ReturnType<typeof initializeApiClient> | null>(null);
  const { processStream } = useStreamingResponse();

  const sendMessage = useCallback(
    async (content: string, settings: PlaygroundSettings) => {
      if (!content.trim() || !settings.agent) {
        setError('Please enter a message and select an agent');
        return;
      }

      setError(null);
      setIsLoading(true);

      // Add user message as ModelRequest
      const userMessage: ModelMessage = {
        kind: 'request',
        parts: [
          {
            part_kind: 'user-prompt',
            content,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      setMessages((prev) => [...prev, userMessage]);

      // Create assistant message placeholder
      const assistantMessage: ModelMessage = {
        kind: 'response',
        parts: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const apiMessages = buildApiMessagesFromModelMessages(messages.concat(userMessage));
        const apiClient = initializeApiClient(settings.baseUrl);
        apiClientRef.current = apiClient;

        let dependencies: Record<string, unknown> = {};
        try {
          dependencies = JSON.parse(settings.dependencies || '{}');
        } catch {
          // If dependencies are invalid JSON, use empty object
        }

        const response = makeStreamingChatRequest(apiClient, {
          agent: settings.agent,
          messages: apiMessages,
          dependencies,
          stream: true,
        });

        await processStream({
          stream: response,
          abortControllerRef,
          setMessages,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        // Remove the placeholder assistant message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
        apiClientRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [messages, processStream]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (apiClientRef.current) {
      apiClientRef.current.abortController.abort();
    }
  }, []);

  // TODO: Implement editMessage with new structure
  const editMessage = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (messageId: string, newContent: string, settings: PlaygroundSettings) => {
      setError('Edit functionality not yet implemented for new message format');
    },
    []
  );

  // TODO: Implement submitToolResponses with new structure
  const submitToolResponses = useCallback(
    async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      responseGroupId: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      responses: Array<{ toolCallIndex: number; response: string }>,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      settings: PlaygroundSettings
    ) => {
      setError('Tool response functionality not yet implemented for new message format');
    },
    []
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
    editMessage,
    submitToolResponses,
  };
}
