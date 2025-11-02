import { ToolCallPart as ToolCallPartType } from '@/types/message';
import { Loader2 } from 'lucide-react';

interface ToolCallPartProps {
  part: ToolCallPartType;
  isExecuting?: boolean;
}

export default function ToolCallPart({ part, isExecuting }: ToolCallPartProps) {
  // Parse args if they're a string
  const args = typeof part.args === 'string' ? JSON.parse(part.args || '{}') : part.args;

  return (
    <div className="flex justify-start mb-6 animate-fadeInUp">
      <div className="max-w-[75%] rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-violet-500/5 p-4 text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40">
        {/* Tool Call Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary to-purple-600 px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            Tool Call
          </span>
          <span className="font-mono font-semibold text-foreground">{part.tool_name}</span>
          {isExecuting && (
            <span className="ml-auto inline-flex items-center gap-1 text-blue-500 text-xs font-semibold">
              <Loader2 size={14} className="animate-spin" />
              Executing
            </span>
          )}
        </div>

        {/* Tool Call Arguments */}
        <div className="rounded-lg bg-card/80 backdrop-blur-sm p-3 font-mono text-xs text-foreground/80 border border-border/30 shadow-inner">
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(args, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
