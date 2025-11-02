import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SystemPromptPart as SystemPromptPartType } from '@/types/message';

interface SystemPromptPartProps {
  part: SystemPromptPartType;
}

export default function SystemPromptPart({ part }: SystemPromptPartProps) {
  return (
    <div className="flex justify-start mb-6 animate-fadeInUp">
      <div className="max-w-[75%] rounded-2xl px-5 py-3.5 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-sky-500/10 border border-blue-500/30 shadow-sm shadow-blue-500/10 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xs font-semibold tracking-wide uppercase text-blue-600">
            System Prompt
          </span>
          {part.dynamic_ref && (
            <span className="text-xs text-blue-500/70 font-mono">({part.dynamic_ref})</span>
          )}
        </div>

        <Accordion type="single" collapsible className="transition-all duration-200">
          <AccordionItem value="system" className="border-none">
            <AccordionTrigger className="py-2 text-xs hover:no-underline text-blue-600 hover:text-blue-700 transition-colors">
              <div className="flex items-center gap-2">
                <span className="font-medium">View system instructions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="transition-all duration-300">
              <div className="text-sm whitespace-pre-wrap break-words bg-card/50 backdrop-blur-sm rounded-xl p-4 mt-2 font-mono text-foreground/80 max-h-96 overflow-y-auto border border-border/30 shadow-inner">
                {part.content}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
