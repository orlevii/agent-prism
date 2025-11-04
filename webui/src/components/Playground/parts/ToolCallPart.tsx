import { useState } from 'react';
import { ToolCallPart as ToolCallPartType } from '@/types/message';
import { Loader2, Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ToolCallPartProps {
  part: ToolCallPartType;
  isExecuting?: boolean;
  pendingApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'mocked';
  onApprove?: () => void;
  onReject?: () => void;
  onMock?: (mockValue: unknown) => void;
}

export default function ToolCallPart({
  part,
  isExecuting,
  pendingApproval,
  approvalStatus,
  onApprove,
  onReject,
  onMock,
}: ToolCallPartProps) {
  const [showMockInput, setShowMockInput] = useState(false);
  const [mockValue, setMockValue] = useState('');
  const [mockError, setMockError] = useState<string | null>(null);
  // Parse args if they're a string
  const args = typeof part.args === 'string' ? JSON.parse(part.args || '{}') : part.args;

  const handleMockSubmit = () => {
    if (!mockValue.trim()) {
      setMockError('Mock value cannot be empty');
      return;
    }
    setMockError(null);
    onMock?.(mockValue);
    setShowMockInput(false);
    setMockValue('');
  };

  const showApprovalButtons = pendingApproval && approvalStatus === 'pending';

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
          {approvalStatus === 'approved' && (
            <span className="ml-auto inline-flex items-center gap-1 text-green-500 text-xs font-semibold">
              <Check size={14} />
              Approved
            </span>
          )}
          {approvalStatus === 'rejected' && (
            <span className="ml-auto inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
              <X size={14} />
              Rejected
            </span>
          )}
          {approvalStatus === 'mocked' && (
            <span className="ml-auto inline-flex items-center gap-1 text-purple-500 text-xs font-semibold">
              <Zap size={14} />
              Mocked
            </span>
          )}
          {approvalStatus === 'pending' && pendingApproval && (
            <span className="ml-auto inline-flex items-center gap-1 text-yellow-500 text-xs font-semibold">
              Pending Approval
            </span>
          )}
        </div>

        {/* Tool Call Arguments */}
        <div className="rounded-lg bg-card/80 backdrop-blur-sm p-3 font-mono text-xs text-foreground/80 border border-border/30 shadow-inner max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(args, null, 2)}</pre>
        </div>

        {/* Approval Buttons */}
        {showApprovalButtons && (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={onApprove}
              >
                <Check size={14} className="mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={onReject}>
                <X size={14} className="mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowMockInput(!showMockInput)}
              >
                <Zap size={14} className="mr-1" />
                Mock
              </Button>
            </div>

            {/* Mock Value Input */}
            {showMockInput && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter mock return value (free text)"
                  value={mockValue}
                  onChange={(e) => setMockValue(e.target.value)}
                  rows={3}
                  className="font-mono text-xs"
                />
                {mockError && <p className="text-xs text-red-500">{mockError}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleMockSubmit}>
                    Submit Mock
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowMockInput(false);
                      setMockValue('');
                      setMockError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
