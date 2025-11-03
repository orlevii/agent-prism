import { useCallback } from 'react';
import type { StreamEvent } from '../types/agent';
import type { ModelMessage, TextPart, ThinkingPart } from '../types/message';
import { updateMessagePart, addMessagePart, hasMessagePart } from '../utils/messageHelpers';

interface ProcessStreamOptions {
  stream: AsyncIterable<StreamEvent>;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  setMessages: React.Dispatch<React.SetStateAction<ModelMessage[]>>;
  onToolApprovalRequest?: (
    toolCallId: string,
    toolName: string,
    args: Record<string, unknown>
  ) => void;
  onAwaitingApprovals?: () => void;
  onError?: (error: string) => void;
}

interface ProcessStreamResult {
  completed: boolean;
  pendingApproval?: boolean;
}

export function useStreamingResponse() {
  const processStream = useCallback(
    async ({
      stream,
      abortControllerRef,
      setMessages,
      onToolApprovalRequest,
      onAwaitingApprovals,
      onError,
    }: ProcessStreamOptions): Promise<ProcessStreamResult> => {
      // Accumulate deltas for real-time UI updates
      let accumulatedContent = '';
      let accumulatedThinking = '';
      const toolCallsMap = new Map<
        string,
        {
          tool_call_id: string;
          tool_name: string;
          args: Record<string, unknown>;
          result?: unknown;
          isExecuting?: boolean;
        }
      >();

      // Event handler functions
      const handleTextDelta = (delta: string) => {
        accumulatedContent += delta;
        setMessages((prev) =>
          updateMessagePart<TextPart>(prev, 'text', () => ({
            part_kind: 'text',
            content: accumulatedContent,
          }))
        );
      };

      const handleThinkingDelta = (delta: string) => {
        accumulatedThinking += delta;
        setMessages((prev) =>
          updateMessagePart<ThinkingPart>(prev, 'thinking', () => ({
            part_kind: 'thinking',
            content: accumulatedThinking,
          }))
        );
      };

      const handleToolCallExecuting = (
        toolCallId: string,
        toolName: string,
        args: Record<string, unknown>
      ) => {
        toolCallsMap.set(toolCallId, {
          tool_call_id: toolCallId,
          tool_name: toolName,
          args,
          isExecuting: true,
        });

        setMessages((prev) => {
          // Skip if this tool call already exists
          if (
            hasMessagePart(
              prev,
              (p) => p.part_kind === 'tool-call' && p.tool_call_id === toolCallId
            )
          ) {
            return prev;
          }

          return addMessagePart(prev, {
            part_kind: 'tool-call',
            tool_name: toolName,
            tool_call_id: toolCallId,
            args,
          });
        });
      };

      const handleToolResult = (toolCallId: string, result: unknown) => {
        const existingToolCall = toolCallsMap.get(toolCallId);
        if (existingToolCall) {
          toolCallsMap.set(toolCallId, {
            ...existingToolCall,
            result,
            isExecuting: false,
          });
        }

        setMessages((prev) =>
          addMessagePart(prev, {
            part_kind: 'tool-return',
            tool_name: existingToolCall?.tool_name || '',
            content: result,
            tool_call_id: toolCallId,
            timestamp: new Date().toISOString(),
          })
        );
      };

      const handleToolApprovalRequest = (
        toolCallId: string,
        toolName: string,
        args: Record<string, unknown>
      ) => {
        toolCallsMap.set(toolCallId, {
          tool_call_id: toolCallId,
          tool_name: toolName,
          args,
          isExecuting: false,
        });
        onToolApprovalRequest?.(toolCallId, toolName, args);
      };

      const handleMessageHistory = (messageHistory: unknown[]) => {
        try {
          const modelMessages: ModelMessage[] = messageHistory.map(
            (msg) => msg as unknown as ModelMessage
          );
          setMessages(modelMessages);
        } catch (err) {
          console.error('Failed to parse message history:', err);
        }
      };

      // Main event processing loop
      for await (const event of stream) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request cancelled');
        }

        switch (event.type) {
          case 'text_delta':
            handleTextDelta(event.delta);
            break;

          case 'thinking_delta':
            handleThinkingDelta(event.delta);
            break;

          case 'tool_call_executing':
            handleToolCallExecuting(event.tool_call_id, event.tool_name, event.arguments);
            break;

          case 'tool_result':
            handleToolResult(event.tool_call_id, event.result);
            break;

          case 'tool_approval_request':
            handleToolApprovalRequest(event.tool_call_id, event.tool_name, event.arguments);
            break;

          case 'message_history':
            handleMessageHistory(event.message_history);
            break;

          case 'error':
            console.error('Stream error:', event.error);
            onError?.(event.error);
            break;

          case 'done':
            if (event.status === 'pending_approval') {
              onAwaitingApprovals?.();
              return { completed: false, pendingApproval: true };
            }
            break;
        }
      }

      return { completed: true, pendingApproval: false };
    },
    []
  );

  return { processStream };
}
