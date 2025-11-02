import { useState } from 'react';
import { ToolReturnPart as ToolReturnPartType } from '@/types/message';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';

interface ToolReturnPartProps {
  part: ToolReturnPartType;
}

export default function ToolReturnPart({ part }: ToolReturnPartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex justify-start mb-6 animate-fadeInUp">
      <div className="max-w-[75%] rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5 p-4 text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/40">
        {/* Tool Result Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Tool Result
          </span>
          <span className="font-mono font-semibold text-foreground">{part.tool_name}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold">
            <Check size={14} />
            Completed
          </span>
        </div>

        {/* Collapsible Result */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            View Result
          </button>
          {isExpanded && (
            <div className="mt-2 rounded-lg bg-card/80 backdrop-blur-sm p-3 font-mono text-xs text-foreground/80 border border-border/30 shadow-inner max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap break-words">
                {typeof part.content === 'string'
                  ? part.content
                  : JSON.stringify(part.content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
