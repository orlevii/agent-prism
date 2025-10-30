import { useState, useCallback, useRef } from 'react';
import type { Message, PlaygroundSettings, ToolResponse, ToolCall } from '../types/playground';
import { buildApiMessagesWithUserInput, buildApiMessages } from '../utils/messageBuilder';
import { initializeApiClient, makeStreamingChatRequest } from '../utils/apiClient';
import { handleChatError, cleanup } from '../utils/chatErrorHandler';
import { useStreamingResponse } from './useStreamingResponse';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
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

      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Create response group ID and assistant message placeholder
      const responseGroupId = crypto.randomUUID();
      const initialMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: initialMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
        responseGroupId,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let assistantMessageIds: string[] = [initialMessageId];

      try {
        const apiMessages = buildApiMessagesWithUserInput(messages, content);
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

        const result = await processStream({
          stream: response,
          initialMessageId,
          responseGroupId,
          abortControllerRef,
          setMessages,
        });

        assistantMessageIds = result.assistantMessageIds;
      } catch (err) {
        handleChatError(err, assistantMessageIds, setError, setMessages);
      } finally {
        cleanup(setIsLoading, apiClientRef, abortControllerRef);
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

  const editMessage = useCallback(
    async (messageId: string, newContent: string, settings: PlaygroundSettings) => {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);

      if (messageIndex === -1) {
        setError('Message not found');
        return;
      }

      const message = messages[messageIndex];

      if (message.role !== 'user') {
        setError('Only user messages can be edited');
        return;
      }

      if (!newContent.trim() || !settings.agent) {
        setError('Please enter a message and select an agent');
        return;
      }

      setError(null);
      setIsLoading(true);

      // Truncate messages and add edited message
      const updatedMessages = messages.slice(0, messageIndex);
      const editedMessage: Message = {
        ...message,
        content: newContent,
        timestamp: Date.now(),
      };
      updatedMessages.push(editedMessage);
      setMessages(updatedMessages);

      // Create response group ID and assistant message placeholder
      const responseGroupId = crypto.randomUUID();
      const initialMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: initialMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
        responseGroupId,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let assistantMessageIds: string[] = [initialMessageId];

      try {
        const apiMessages = buildApiMessages(updatedMessages);
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

        const result = await processStream({
          stream: response,
          initialMessageId,
          responseGroupId,
          abortControllerRef,
          setMessages,
        });

        assistantMessageIds = result.assistantMessageIds;
      } catch (err) {
        handleChatError(err, assistantMessageIds, setError, setMessages);
      } finally {
        cleanup(setIsLoading, apiClientRef, abortControllerRef);
      }
    },
    [messages, processStream]
  );

  const submitToolResponses = useCallback(
    async (responseGroupId: string, responses: ToolResponse[], settings: PlaygroundSettings) => {
      setError(null);
      setIsLoading(true);

      // Collect tool calls from response group
      const groupMessages = messages.filter((msg) => msg.responseGroupId === responseGroupId);
      const allToolCalls: Array<{ toolCall: ToolCall; messageId: string; indexInMessage: number }> =
        [];
      groupMessages.forEach((msg) => {
        if (msg.tool_calls) {
          msg.tool_calls.forEach((toolCall, index) => {
            allToolCalls.push({ toolCall, messageId: msg.id, indexInMessage: index });
          });
        }
      });

      if (allToolCalls.length === 0) {
        setError('No tool calls found in response group');
        setIsLoading(false);
        return;
      }

      // Create tool response messages
      const toolResponseMessages: Message[] = responses.map((resp) => {
        const toolInfo = allToolCalls[resp.toolCallIndex];
        return {
          id: crypto.randomUUID(),
          role: 'tool' as const,
          content: resp.response,
          timestamp: Date.now(),
          tool_name: toolInfo.toolCall.function.name,
        };
      });

      setMessages((prev) => [...prev, ...toolResponseMessages]);

      // Create response group ID and assistant message placeholder
      const newResponseGroupId = crypto.randomUUID();
      const initialMessageId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: initialMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
        responseGroupId: newResponseGroupId,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let assistantMessageIds: string[] = [initialMessageId];

      try {
        const apiMessages = buildApiMessages([...messages, ...toolResponseMessages], true);
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

        const result = await processStream({
          stream: response,
          initialMessageId,
          responseGroupId: newResponseGroupId,
          abortControllerRef,
          setMessages,
        });

        assistantMessageIds = result.assistantMessageIds;
      } catch (err) {
        handleChatError(err, assistantMessageIds, setError, setMessages);
      } finally {
        cleanup(setIsLoading, apiClientRef, abortControllerRef);
      }
    },
    [messages, processStream]
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
