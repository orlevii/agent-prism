import { useCallback } from 'react';
import type { StreamEvent } from '../types/agent';
import type { ModelMessage } from '../types/message';

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

      for await (const event of stream) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request cancelled');
        }

        // Handle different event types
        switch (event.type) {
          case 'text_delta':
            accumulatedContent += event.delta;
            // Update the last message with accumulated text
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.kind !== 'response') return prev;

              // Find or create text part
              const parts = [...lastMsg.parts];
              const textPartIndex = parts.findIndex((p) => p.part_kind === 'text');

              if (textPartIndex >= 0) {
                parts[textPartIndex] = {
                  ...parts[textPartIndex],
                  part_kind: 'text',
                  content: accumulatedContent,
                };
              } else {
                parts.push({
                  part_kind: 'text',
                  content: accumulatedContent,
                });
              }

              return [...prev.slice(0, -1), { ...lastMsg, parts }];
            });
            break;

          case 'thinking_delta':
            accumulatedThinking += event.delta;
            // Update the last message with accumulated thinking
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.kind !== 'response') return prev;

              const parts = [...lastMsg.parts];
              const thinkingPartIndex = parts.findIndex((p) => p.part_kind === 'thinking');

              if (thinkingPartIndex >= 0) {
                parts[thinkingPartIndex] = {
                  ...parts[thinkingPartIndex],
                  part_kind: 'thinking',
                  content: accumulatedThinking,
                };
              } else {
                parts.push({
                  part_kind: 'thinking',
                  content: accumulatedThinking,
                });
              }

              return [...prev.slice(0, -1), { ...lastMsg, parts }];
            });
            break;

          case 'tool_call_executing':
            // Track tool call for UI updates
            toolCallsMap.set(event.tool_call_id, {
              tool_call_id: event.tool_call_id,
              tool_name: event.tool_name,
              args: event.arguments,
              isExecuting: true,
            });
            // Update the last message with tool call
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.kind !== 'response') return prev;

              const parts = [...lastMsg.parts];
              const isDupTool = parts.some(
                (p) => p.part_kind == 'tool-call' && p.tool_call_id == event.tool_call_id
              );
              if (isDupTool) return prev;

              parts.push({
                part_kind: 'tool-call',
                tool_name: event.tool_name,
                tool_call_id: event.tool_call_id,
                args: event.arguments,
              });

              return [...prev.slice(0, -1), { ...lastMsg, parts }];
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

            // Add tool return part to the last message
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const lastMsg = prev[prev.length - 1];
              if (lastMsg.kind !== 'response') return prev;

              const parts = [...lastMsg.parts];
              parts.push({
                part_kind: 'tool-return',
                tool_name: existingToolCall?.tool_name || '',
                content: event.result,
                tool_call_id: event.tool_call_id,
                timestamp: new Date().toISOString(),
              });

              return [...prev.slice(0, -1), { ...lastMsg, parts }];
            });
            break;
          }

          case 'tool_approval_request':
            // Track tool for approval
            toolCallsMap.set(event.tool_call_id, {
              tool_call_id: event.tool_call_id,
              tool_name: event.tool_name,
              args: event.arguments,
              isExecuting: false,
            });

            // Notify parent component
            onToolApprovalRequest?.(event.tool_call_id, event.tool_name, event.arguments);
            break;

          case 'message_history':
            // Replace entire message history with authoritative backend data
            try {
              const modelMessages: ModelMessage[] = event.message_history.map(
                (msg) => msg as unknown as ModelMessage
              );
              setMessages(modelMessages);
            } catch (err) {
              console.error('Failed to parse message history:', err);
            }
            break;

          case 'error':
            console.error('Stream error:', event.error);
            onError?.(event.error);
            break;

          case 'done':
            if (event.status === 'pending_approval') {
              // Notify parent that we're waiting for approvals
              onAwaitingApprovals?.();
              return { completed: false, pendingApproval: true };
            }
            // Stream completed normally
            break;
        }
      }

      return { completed: true, pendingApproval: false };
    },
    []
  );

  return { processStream };
}
