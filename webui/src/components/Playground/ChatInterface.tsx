import { useEffect, useRef } from 'react';
import PartRenderer from './PartRenderer';
import type { ModelMessage, MessagePart } from '@/types/message';
import type { PendingTool } from '@/hooks/usePendingToolApprovals';
import type { ToolCallsMap } from '@/hooks/useStreamingResponse';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ModelMessage[];
  error: string | null;
  isLoading?: boolean;
  awaitingApprovals?: boolean;
  pendingTools?: PendingTool[];
  allHandled?: boolean;
  toolCallsMap?: ToolCallsMap;
  onContinueWithApprovals?: () => void;
  onApprove?: (toolCallId: string) => void;
  onReject?: (toolCallId: string) => void;
  onMock?: (toolCallId: string, mockValue: unknown) => void;
  onEdit?: (partIndex: number, newContent: string | Record<string, unknown>) => void;
}

export default function ChatInterface({
  messages,
  error,
  isLoading,
  awaitingApprovals,
  pendingTools,
  allHandled,
  toolCallsMap,
  onContinueWithApprovals,
  onApprove,
  onReject,
  onMock,
  onEdit,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Flatten all parts from all messages
  const allParts: Array<{
    part: MessagePart;
    messageKind: 'request' | 'response';
    isLastMessage: boolean;
  }> = [];

  messages.forEach((msg, msgIndex) => {
    const isLastMessage = msgIndex === messages.length - 1;
    msg.parts.forEach((part) => {
      allParts.push({
        part,
        messageKind: msg.kind,
        isLastMessage,
      });
    });
  });

  // Helper to get tool approval status
  const getToolStatus = (toolCallId: string) => {
    return pendingTools?.find((t) => t.tool_call_id === toolCallId);
  };

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
              Agent Prism
            </h2>
            <p className="text-lg text-muted-foreground mb-2">
              Interactive testing environment for pydantic-ai agents
            </p>
            <p className="text-sm text-muted-foreground/70">
              Configure your agent on the right and start chatting below
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {allParts.map((item, index) => {
            let toolCallId: string | undefined;
            if (item.part.part_kind === 'tool-call') {
              toolCallId = item.part.tool_call_id;
            }
            const toolStatus = toolCallId ? getToolStatus(toolCallId) : undefined;
            const isExecuting = toolCallId ? toolCallsMap?.get(toolCallId)?.isExecuting : false;

            return (
              <PartRenderer
                key={index}
                part={item.part}
                partIndex={index}
                isStreaming={isLoading && item.isLastMessage}
                isExecuting={isExecuting}
                pendingApproval={awaitingApprovals && !!toolStatus}
                approvalStatus={toolStatus?.status}
                onApprove={toolCallId && onApprove ? () => onApprove(toolCallId) : undefined}
                onReject={toolCallId && onReject ? () => onReject(toolCallId) : undefined}
                onMock={
                  toolCallId && onMock ? (mockValue) => onMock(toolCallId, mockValue) : undefined
                }
                onEdit={onEdit}
                isLoading={isLoading}
              />
            );
          })}

          {/* Continue Button for Approvals */}
          {awaitingApprovals && (
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 max-w-md">
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  {allHandled
                    ? 'All tool calls have been handled. Click Continue to proceed.'
                    : 'Please approve, reject, or mock all pending tool calls.'}
                </p>
                <Button className="w-full" disabled={!allHandled} onClick={onContinueWithApprovals}>
                  Continue
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

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
