import { UserPromptPart as UserPromptPartType } from '@/types/message';
import { detectTextDirection } from '@/utils/text';

interface UserPromptPartProps {
  part: UserPromptPartType;
}

export default function UserPromptPart({ part }: UserPromptPartProps) {
  return (
    <div className="flex justify-end mb-6 animate-fadeInUp">
      <div className="max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm transition-all duration-300 hover:shadow-md bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wide uppercase text-primary-foreground/80">
            You
          </span>
        </div>

        <div
          className="whitespace-pre-wrap break-words leading-relaxed"
          dir={detectTextDirection(part.content)}
        >
          {part.content}
        </div>
      </div>
    </div>
  );
}
