import { useState, useCallback, useRef } from 'react';
import { Ollama } from 'ollama/browser';
import type { Message, PlaygroundSettings, ToolResponse, ToolCall } from '../types/playground';
import { parseTools } from '../utils/toolParser';
import { buildApiMessagesWithUserInput, buildApiMessages } from '../utils/messageBuilder';
import { initializeOllamaClient, makeStreamingChatRequest } from '../utils/ollamaClient';
import { handleChatError, cleanup } from '../utils/chatErrorHandler';
import { useOllamaStream } from './useOllamaStream';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const ollamaClientRef = useRef<Ollama | null>(null);
  const { processStream } = useOllamaStream();

  const sendMessage = useCallback(
    async (content: string, settings: PlaygroundSettings) => {
      if (!content.trim() || !settings.model) {
        setError('Please enter a message and select a model');
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
        const tools = parseTools(settings.tools);
        const apiMessages = buildApiMessagesWithUserInput(messages, content, settings.systemPrompt);
        const ollama = initializeOllamaClient(
          settings.baseUrl,
          ollamaClientRef,
          abortControllerRef
        );
        const response = await makeStreamingChatRequest(ollama, {
          model: settings.model,
          messages: apiMessages,
          temperature: settings.temperature,
          enableThinking: settings.enableThinking,
          tools,
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
        cleanup(setIsLoading, ollamaClientRef, abortControllerRef);
      }
    },
    [messages, processStream]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (ollamaClientRef.current) {
      ollamaClientRef.current.abort();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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

      if (!newContent.trim() || !settings.model) {
        setError('Please enter a message and select a model');
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
        const tools = parseTools(settings.tools);
        const apiMessages = buildApiMessages(updatedMessages, settings.systemPrompt);
        const ollama = initializeOllamaClient(
          settings.baseUrl,
          ollamaClientRef,
          abortControllerRef
        );
        const response = await makeStreamingChatRequest(ollama, {
          model: settings.model,
          messages: apiMessages,
          temperature: settings.temperature,
          enableThinking: settings.enableThinking,
          tools,
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
        cleanup(setIsLoading, ollamaClientRef, abortControllerRef);
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
        const tools = parseTools(settings.tools);
        const apiMessages = buildApiMessages(
          [...messages, ...toolResponseMessages],
          settings.systemPrompt,
          true // include tool data
        );
        const ollama = initializeOllamaClient(
          settings.baseUrl,
          ollamaClientRef,
          abortControllerRef
        );
        const response = await makeStreamingChatRequest(ollama, {
          model: settings.model,
          messages: apiMessages,
          temperature: settings.temperature,
          enableThinking: settings.enableThinking,
          tools,
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
        cleanup(setIsLoading, ollamaClientRef, abortControllerRef);
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
