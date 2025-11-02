import { TextPart as TextPartType } from '@/types/message';
import { detectTextDirection } from '@/utils/text';

interface TextPartProps {
  part: TextPartType;
  isStreaming?: boolean;
}

export default function TextPart({ part, isStreaming }: TextPartProps) {
  return (
    <div className="flex justify-start mb-6 animate-fadeInUp">
      <div className="max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm transition-all duration-300 hover:shadow-md bg-card text-card-foreground border border-border/50 shadow-card/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Assistant
          </span>
          {isStreaming && (
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

        <div
          className="whitespace-pre-wrap break-words leading-relaxed"
          dir={detectTextDirection(part.content)}
        >
          {part.content || (
            <span className="text-muted-foreground italic">Waiting for response...</span>
          )}
        </div>
      </div>
    </div>
  );
}
