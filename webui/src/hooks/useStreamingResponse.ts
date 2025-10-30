import { useCallback } from 'react';
import type { Message } from '../types/playground';
import type { StreamEvent } from '../types/agent';

interface ProcessStreamOptions {
  stream: AsyncIterable<StreamEvent>;
  initialMessageId: string;
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
      abortControllerRef,
      setMessages,
    }: ProcessStreamOptions): Promise<ProcessStreamResult> => {
      let accumulatedContent = '';
      let accumulatedThinking = '';
      const toolCallsMap = new Map<
        string,
        {
          id: string;
          name: string;
          arguments: Record<string, unknown>;
          result?: unknown;
          isExecuting?: boolean;
        }
      >();
      const currentMessageId = initialMessageId;
      const assistantMessageIds: string[] = [initialMessageId];
      let pendingApproval = false;

      for await (const event of stream) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request cancelled');
        }

        // Handle different event types
        switch (event.type) {
          case 'text_delta':
            accumulatedContent += event.delta;
            break;

          case 'thinking_delta':
            accumulatedThinking += event.delta;
            break;

          case 'tool_call_executing':
            // Add or update tool call with executing status
            toolCallsMap.set(event.tool_call_id, {
              id: event.tool_call_id,
              name: event.tool_name,
              arguments: event.arguments,
              isExecuting: true,
            });
            break;

          case 'tool_result': {
            // Update existing tool call with result
            const existingToolCall = toolCallsMap.get(event.tool_call_id);
            if (existingToolCall) {
              toolCallsMap.set(event.tool_call_id, {
                ...existingToolCall,
                result: event.result,
                isExecuting: false,
              });
            }
            break;
          }

          case 'error':
            // Handle error event - you might want to show this in the UI
            console.error('Stream error:', event.error);
            break;

          case 'done':
            // Set approval status based on done status
            pendingApproval = event.status === 'pending_approval';
            break;
        }

        // Update current message with accumulated data
        const toolCallsArray = Array.from(toolCallsMap.values());
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentMessageId
              ? {
                  ...msg,
                  content: accumulatedContent,
                  ...(accumulatedThinking && { thinking: accumulatedThinking }),
                  ...(toolCallsArray.length > 0 && {
                    tool_calls_with_results: toolCallsArray,
                  }),
                  ...(pendingApproval && { pending_approval: true }),
                }
              : msg
          )
        );
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
