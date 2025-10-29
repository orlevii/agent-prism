import { useState, useEffect } from 'react';
import type { Message, ToolResponse, ToolCall } from '../../types/playground';
import ToolCallMock from './ToolCallMock';
import { Button } from '@/components/ui/button';

interface ToolCallGroupProps {
  messages: Message[]; // All messages in the same response group with tool calls
  onToolResponsesSubmit: (responseGroupId: string, responses: ToolResponse[]) => void;
}

export default function ToolCallGroup({ messages, onToolResponsesSubmit }: ToolCallGroupProps) {
  const [toolResponses, setToolResponses] = useState<Map<number, string>>(new Map());

  // Collect all tool calls from all messages
  const allToolCalls: ToolCall[] = [];
  messages.forEach((msg) => {
    if (msg.tool_calls) {
      allToolCalls.push(...msg.tool_calls);
    }
  });

  const allResponsesSubmitted = toolResponses.size === allToolCalls.length;

  // Reset tool responses if messages change
  useEffect(() => {
    setToolResponses(new Map());
  }, [messages]);

  const handleResponseSubmit = (index: number, response: string) => {
    setToolResponses((prev) => new Map(prev).set(index, response));
  };

  const handleContinueConversation = () => {
    if (allResponsesSubmitted && messages[0]?.responseGroupId) {
      const responses: ToolResponse[] = Array.from(toolResponses.entries()).map(
        ([index, response]) => ({
          toolCallIndex: index,
          response,
        })
      );
      onToolResponsesSubmit(messages[0].responseGroupId, responses);
    }
  };

  if (allToolCalls.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start mb-6 animate-fadeInUp">
      <div className="max-w-[75%] rounded-2xl px-5 py-3.5 bg-card text-card-foreground border border-border/50 shadow-sm shadow-card/10 transition-all duration-300 hover:shadow-md">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Assistant
          </span>
          {messages.some((msg) => msg.isStreaming) && (
            <span className="text-xs animate-pulse flex items-center gap-1 text-muted-foreground">
              <span
                className="inline-block w-1 h-1 rounded-full bg-current animate-bounce"
                style={{ animationDelay: '0ms' }}
              ></span>
              <span
                className="inline-block w-1 h-1 rounded-full bg-current animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></span>
              <span
                className="inline-block w-1 h-1 rounded-full bg-current animate-bounce"
                style={{ animationDelay: '300ms' }}
              ></span>
            </span>
          )}
        </div>

        {/* Show content from messages (if any) */}
        {messages.some((msg) => msg.content) && (
          <div className="mb-4">
            {messages.map(
              (msg) =>
                msg.content && (
                  <div key={msg.id} className="whitespace-pre-wrap break-words leading-relaxed">
                    {msg.content}
                  </div>
                )
            )}
          </div>
        )}

        {/* Tool Calls */}
        <div className="space-y-3">
          {allToolCalls.map((toolCall, index) => (
            <ToolCallMock
              key={index}
              toolCall={toolCall}
              index={index}
              onResponseSubmit={handleResponseSubmit}
              existingResponse={toolResponses.get(index)}
            />
          ))}

          {/* Continue Conversation Button */}
          {allResponsesSubmitted && !messages.some((msg) => msg.isStreaming) && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleContinueConversation}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
              >
                Continue Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
