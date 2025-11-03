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
  pendingApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'mocked';
  onApprove?: () => void;
  onReject?: () => void;
  onMock?: (mockValue: unknown) => void;
}

export default function PartRenderer({
  part,
  isStreaming,
  isExecuting,
  pendingApproval,
  approvalStatus,
  onApprove,
  onReject,
  onMock,
}: PartRendererProps) {
  switch (part.part_kind) {
    case 'system-prompt':
      return <SystemPromptPart part={part} />;

    case 'user-prompt':
      return <UserPromptPart part={part} />;

    case 'text':
      return <TextPart part={part} isStreaming={isStreaming} />;

    case 'tool-call':
      return (
        <ToolCallPart
          part={part}
          isExecuting={isExecuting}
          pendingApproval={pendingApproval}
          approvalStatus={approvalStatus}
          onApprove={onApprove}
          onReject={onReject}
          onMock={onMock}
        />
      );

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
