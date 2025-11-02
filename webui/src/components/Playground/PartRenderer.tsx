import { MessagePart } from '@/types/message';
import SystemPromptPart from './parts/SystemPromptPart';
import UserPromptPart from './parts/UserPromptPart';
import TextPart from './parts/TextPart';
import ToolCallPart from './parts/ToolCallPart';
import ToolReturnPart from './parts/ToolReturnPart';
import ThinkingPart from './parts/ThinkingPart';

interface PartRendererProps {
  part: MessagePart;
  isStreaming?: boolean;
  isExecuting?: boolean;
}

export default function PartRenderer({ part, isStreaming, isExecuting }: PartRendererProps) {
  switch (part.part_kind) {
    case 'system-prompt':
      return <SystemPromptPart part={part} />;

    case 'user-prompt':
      return <UserPromptPart part={part} />;

    case 'text':
      return <TextPart part={part} isStreaming={isStreaming} />;

    case 'tool-call':
      return <ToolCallPart part={part} isExecuting={isExecuting} />;

    case 'tool-return':
      return <ToolReturnPart part={part} />;

    case 'thinking':
      return <ThinkingPart part={part} isStreaming={isStreaming} />;

    default: {
      // Exhaustive check - TypeScript will error if we miss a case
      const _exhaustiveCheck: never = part;
      console.warn('Unknown part kind:', _exhaustiveCheck);
      return null;
    }
  }
}
