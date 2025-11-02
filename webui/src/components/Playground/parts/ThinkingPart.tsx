import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ThinkingPart as ThinkingPartType } from '@/types/message';

interface ThinkingPartProps {
  part: ThinkingPartType;
  isStreaming?: boolean;
}

export default function ThinkingPart({ part, isStreaming }: ThinkingPartProps) {
  return (
    <div className="flex justify-start mb-6 animate-fadeInUp">
      <div className="max-w-[75%] rounded-2xl px-5 py-3.5 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 border border-purple-500/30 shadow-sm shadow-purple-500/10 transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="text-xs font-semibold tracking-wide uppercase text-purple-600">
            Thinking Process
          </span>
          {isStreaming && (
            <span className="text-xs animate-pulse flex items-center gap-1 text-purple-500">
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

        <Accordion type="single" collapsible className="transition-all duration-200">
          <AccordionItem value="thinking" className="border-none">
            <AccordionTrigger className="py-2 text-xs hover:no-underline text-purple-600 hover:text-purple-700 transition-colors">
              <div className="flex items-center gap-2">
                <span className="font-medium">View reasoning trace</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="transition-all duration-300">
              <div className="text-sm whitespace-pre-wrap break-words bg-card/50 backdrop-blur-sm rounded-xl p-4 mt-2 font-mono text-foreground/80 max-h-96 overflow-y-auto border border-border/30 shadow-inner">
                {part.content || (
                  <span className="text-muted-foreground italic">
                    Waiting for thinking process...
                  </span>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
