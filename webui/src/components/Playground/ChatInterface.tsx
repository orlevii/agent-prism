import { useEffect, useRef, useMemo } from 'react';
import MessageBubble from './MessageBubble';
import ThinkingMessage from './ThinkingMessage';
import ToolCallGroup from './ToolCallGroup';
import type { Message, ToolResponse } from '../../types/playground';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  error: string | null;
  isLoading?: boolean;
  onToolResponsesSubmit?: (responseGroupId: string, responses: ToolResponse[]) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
}

export default function ChatInterface({
  messages,
  error,
  isLoading,
  onToolResponsesSubmit,
  onEditMessage,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by responseGroupId
  const groupedMessages = useMemo(() => {
    const groups: Array<{ type: 'single' | 'toolGroup'; messages: Message[] }> = [];
    const processedIds = new Set<string>();

    messages.forEach((message) => {
      if (processedIds.has(message.id)) return;

      // Check if this message has a responseGroupId and tool_calls (new or old format)
      const hasToolCalls =
        (message.tool_calls_with_results && message.tool_calls_with_results.length > 0) ||
        (message.tool_calls && message.tool_calls.length > 0);

      if (message.responseGroupId && hasToolCalls && message.role === 'assistant') {
        // Find all messages in this response group with tool calls
        const groupMessages = messages.filter((msg) => {
          const msgHasToolCalls =
            (msg.tool_calls_with_results && msg.tool_calls_with_results.length > 0) ||
            (msg.tool_calls && msg.tool_calls.length > 0);
          return (
            msg.responseGroupId === message.responseGroupId &&
            msg.role === 'assistant' &&
            msgHasToolCalls
          );
        });

        // Mark all as processed
        groupMessages.forEach((msg) => processedIds.add(msg.id));

        groups.push({ type: 'toolGroup', messages: groupMessages });
      } else {
        // Single message
        processedIds.add(message.id);
        groups.push({ type: 'single', messages: [message] });
      }
    });

    return groups;
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 bg-background">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-2xl animate-fadeInUp">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-violet-500/20 blur-3xl -z-10 animate-pulse"></div>
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-violet-500/10 border border-primary/20 shadow-lg shadow-primary/10">
                <svg
                  className="w-16 h-16 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-violet-500 bg-clip-text text-transparent mb-3">
              Open Playground
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Start a conversation with any OpenAI-compatible LLM
            </p>
            <p className="text-sm text-muted-foreground/70">
              Configure your settings on the right and type a message below
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {groupedMessages.map((group, index) => (
            <div key={index}>
              {group.type === 'toolGroup' ? (
                <>
                  {/* Show thinking messages for any message in the group */}
                  {group.messages.map(
                    (msg) =>
                      msg.thinking && (
                        <ThinkingMessage
                          key={msg.id}
                          thinking={msg.thinking}
                          isStreaming={msg.isStreaming}
                        />
                      )
                  )}
                  {/* Render tool call group */}
                  {onToolResponsesSubmit && (
                    <ToolCallGroup
                      messages={group.messages}
                      onToolResponsesSubmit={onToolResponsesSubmit}
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Single message rendering */}
                  {group.messages[0].role === 'assistant' && group.messages[0].thinking && (
                    <ThinkingMessage
                      thinking={group.messages[0].thinking}
                      isStreaming={group.messages[0].isStreaming}
                    />
                  )}
                  <MessageBubble
                    message={group.messages[0]}
                    onEdit={onEditMessage}
                    isLoading={isLoading}
                  />
                </>
              )}
            </div>
          ))}
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border-destructive/50 shadow-lg shadow-destructive/10"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">Error:</span> {error}
              </AlertDescription>
            </Alert>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
