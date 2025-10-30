import { useCallback } from 'react';
import type { Message, ToolCall } from '../types/playground';

interface StreamChunk {
  message?: {
    content?: string;
    thinking?: string;
    tool_calls?: ToolCall[];
  };
}

interface ProcessStreamOptions {
  stream: AsyncIterable<StreamChunk>;
  initialMessageId: string;
  responseGroupId: string;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface ProcessStreamResult {
  currentMessageId: string;
  assistantMessageIds: string[];
}

export function useStreamingResponse() {
  const processStream = useCallback(
    async ({
      stream,
      initialMessageId,
      responseGroupId,
      abortControllerRef,
      setMessages,
    }: ProcessStreamOptions): Promise<ProcessStreamResult> => {
      let accumulatedContent = '';
      let accumulatedThinking = '';
      let accumulatedToolCalls: ToolCall[] | undefined;
      let currentMessageId = initialMessageId;
      const assistantMessageIds: string[] = [initialMessageId];

      for await (const part of stream) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request cancelled');
        }

        const content = part.message?.content || '';
        const thinking = part.message?.thinking || '';
        const toolCalls = part.message?.tool_calls;

        if (content) {
          accumulatedContent += content;
        }

        if (thinking) {
          accumulatedThinking += thinking;
        }

        // Check if we're getting a NEW set of tool calls (indicates a new assistant message)
        if (toolCalls && toolCalls.length > 0) {
          // If we already have tool calls, this is a NEW assistant message
          if (accumulatedToolCalls && accumulatedToolCalls.length > 0) {
            // Finalize the current message
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === currentMessageId ? { ...msg, isStreaming: false } : msg
              )
            );

            // Create a new assistant message for the new tool calls
            currentMessageId = crypto.randomUUID();
            assistantMessageIds.push(currentMessageId);

            const newAssistantMessage: Message = {
              id: currentMessageId,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
              isStreaming: true,
              responseGroupId,
            };

            setMessages((prev) => [...prev, newAssistantMessage]);

            // Reset accumulators for new message
            accumulatedContent = '';
            accumulatedThinking = '';
          }

          accumulatedToolCalls = toolCalls;
        }

        // Update current message with accumulated content, thinking, and tool calls
        if (content || thinking || toolCalls) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === currentMessageId
                ? {
                    ...msg,
                    content: accumulatedContent,
                    ...(accumulatedThinking && { thinking: accumulatedThinking }),
                    ...(accumulatedToolCalls && { tool_calls: accumulatedToolCalls }),
                  }
                : msg
            )
          );
        }
      }

      // Mark all streaming messages as complete
      setMessages((prev) =>
        prev.map((msg) =>
          assistantMessageIds.includes(msg.id) ? { ...msg, isStreaming: false } : msg
        )
      );

      return { currentMessageId, assistantMessageIds };
    },
    []
  );

  return { processStream };
}
