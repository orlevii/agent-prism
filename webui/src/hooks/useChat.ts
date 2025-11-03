import { useState, useCallback, useRef } from 'react';
import type { PlaygroundSettings } from '../types/playground';
import type { ModelMessage } from '../types/message';
import type { DeferredToolResults } from '../types/agent';
import { initializeApiClient, makeStreamingChatRequest } from '../utils/apiClient';
import { useStreamingResponse } from './useStreamingResponse';
import { usePendingToolApprovals } from './usePendingToolApprovals';
import { editPartAndTruncate } from '../utils/messageHelpers';

export function useChat() {
  const [messages, setMessages] = useState<ModelMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingApprovals, setAwaitingApprovals] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const apiClientRef = useRef<ReturnType<typeof initializeApiClient> | null>(null);
  const { processStream } = useStreamingResponse();
  const {
    pendingTools,
    decisions,
    addPendingTool,
    handleApprove,
    handleReject,
    handleMock,
    clearPendingTools,
    allHandled,
  } = usePendingToolApprovals();

  const sendMessage = useCallback(
    async (
      content: string,
      settings: PlaygroundSettings,
      deferredToolResults?: DeferredToolResults
    ) => {
      if (!content.trim() || !settings.agent) {
        setError('Please enter a message and select an agent');
        return;
      }

      setError(null);
      setIsLoading(true);

      // Add user message as ModelRequest (only if not resuming)
      let apiMessages = messages;
      if (!deferredToolResults) {
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
        apiMessages = messages.concat(userMessage);

        // Create assistant message placeholder
        const assistantMessage: ModelMessage = {
          kind: 'response',
          parts: [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }

      try {
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
          use_tools: settings.autoApproveTools ? 'auto' : 'request_approval',
          deferred_tool_results: deferredToolResults,
        });

        const result = await processStream({
          stream: response,
          abortControllerRef,
          setMessages,
          onToolApprovalRequest: addPendingTool,
          onAwaitingApprovals: () => setAwaitingApprovals(true),
          onError: setError,
        });

        if (result.pendingApproval) {
          // Stream paused waiting for approvals
          return;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        // Remove the placeholder assistant message on error
        if (!deferredToolResults) {
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        setIsLoading(false);
        apiClientRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [messages, processStream, addPendingTool]
  );

  const continueWithApprovals = useCallback(
    async (settings: PlaygroundSettings) => {
      if (!allHandled) {
        setError('Please handle all pending tool approvals');
        return;
      }

      setError(null);
      setIsLoading(true);
      setAwaitingApprovals(false);

      try {
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
          messages,
          dependencies,
          stream: true,
          use_tools: settings.autoApproveTools ? 'auto' : 'request_approval',
          deferred_tool_results: decisions,
        });

        // Clear pending tools after sending
        clearPendingTools();

        const result = await processStream({
          stream: response,
          abortControllerRef,
          setMessages,
          onToolApprovalRequest: addPendingTool,
          onAwaitingApprovals: () => setAwaitingApprovals(true),
          onError: setError,
        });

        if (result.pendingApproval) {
          // Stream paused again waiting for more approvals
          return;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        apiClientRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [messages, decisions, allHandled, clearPendingTools, processStream, addPendingTool]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setAwaitingApprovals(false);
    clearPendingTools();
  }, [clearPendingTools]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (apiClientRef.current) {
      apiClientRef.current.abortController.abort();
    }
  }, []);

  const editPart = useCallback(
    async (
      partIndex: number,
      newContent: string | Record<string, unknown>,
      settings: PlaygroundSettings
    ) => {
      if (!settings.agent) {
        setError('Please select an agent');
        return;
      }

      setError(null);
      setIsLoading(true);

      // Edit the part and truncate all parts after it
      const truncatedMessages = editPartAndTruncate(messages, partIndex, newContent);
      setMessages(truncatedMessages);

      // Create assistant message placeholder for the new response
      const assistantMessage: ModelMessage = {
        kind: 'response',
        parts: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
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
          messages: truncatedMessages,
          dependencies,
          stream: true,
          use_tools: settings.autoApproveTools ? 'auto' : 'request_approval',
        });

        const result = await processStream({
          stream: response,
          abortControllerRef,
          setMessages,
          onToolApprovalRequest: addPendingTool,
          onAwaitingApprovals: () => setAwaitingApprovals(true),
          onError: setError,
        });

        if (result.pendingApproval) {
          // Stream paused waiting for approvals
          return;
        }
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
    [messages, processStream, addPendingTool]
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
    awaitingApprovals,
    pendingTools,
    allHandled,
    sendMessage,
    clearMessages,
    cancelRequest,
    continueWithApprovals,
    handleApprove,
    handleReject,
    handleMock,
    editPart,
    submitToolResponses,
  };
}
