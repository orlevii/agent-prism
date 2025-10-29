import { useState } from 'react';
import type { ToolCall } from '../../types/playground';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ToolCallMockProps {
  toolCall: ToolCall;
  index: number;
  onResponseSubmit: (index: number, response: string) => void;
  existingResponse?: string;
}

export default function ToolCallMock({
  toolCall,
  index,
  onResponseSubmit,
  existingResponse,
}: ToolCallMockProps) {
  const [response, setResponse] = useState(existingResponse || '');
  const [isSubmitted, setIsSubmitted] = useState(!!existingResponse);

  const handleSubmit = () => {
    if (response.trim()) {
      setIsSubmitted(true);
      onResponseSubmit(index, response);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-violet-500/5 p-4 text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40">
      {/* Tool Call Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-purple-600 px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          Tool Call
        </span>
        <span className="font-mono font-semibold text-foreground">{toolCall.function.name}</span>
        {isSubmitted && (
          <span className="ml-auto inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold">
            <Check size={14} />
            Responded
          </span>
        )}
      </div>

      {/* Tool Call Arguments */}
      <div className="rounded-lg bg-card/80 backdrop-blur-sm p-3 font-mono text-xs text-foreground/80 mb-3 border border-border/30 shadow-inner">
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(toolCall.function.arguments, null, 2)}
        </pre>
      </div>

      {/* Mock Response Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground">Mock Response:</label>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Enter mock tool response..."
          disabled={isSubmitted}
          className="min-h-[80px] text-sm bg-background border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitted || !response.trim()}
            className="text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitted ? 'Submitted' : 'Submit Response'}
          </Button>
        </div>
      </div>
    </div>
  );
}
