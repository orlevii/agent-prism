import { useEffect, useRef } from 'react';
import PartRenderer from './PartRenderer';
import type { ModelMessage, MessagePart } from '@/types/message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ModelMessage[];
  error: string | null;
  isLoading?: boolean;
}

export default function ChatInterface({ messages, error, isLoading }: ChatInterfaceProps) {
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
          {allParts.map((item, index) => (
            <PartRenderer
              key={index}
              part={item.part}
              isStreaming={isLoading && item.isLastMessage}
            />
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
