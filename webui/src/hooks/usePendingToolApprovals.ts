import { useState, useCallback } from 'react';
import type { DeferredToolResults } from '../types/agent';

export interface PendingTool {
  tool_call_id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'mocked';
  mockValue?: unknown;
}

export function usePendingToolApprovals() {
  const [pendingTools, setPendingTools] = useState<PendingTool[]>([]);
  const [decisions, setDecisions] = useState<DeferredToolResults>({
    calls: {},
    approvals: {},
  });

  const addPendingTool = useCallback(
    (toolCallId: string, toolName: string, args: Record<string, unknown>) => {
      setPendingTools((prev) => [
        ...prev,
        {
          tool_call_id: toolCallId,
          tool_name: toolName,
          arguments: args,
          status: 'pending',
        },
      ]);
    },
    []
  );

  const handleApprove = useCallback((toolCallId: string) => {
    setPendingTools((prev) =>
      prev.map((tool) =>
        tool.tool_call_id === toolCallId ? { ...tool, status: 'approved' as const } : tool
      )
    );
    setDecisions((prev) => ({
      ...prev,
      approvals: { ...prev.approvals, [toolCallId]: true },
    }));
  }, []);

  const handleReject = useCallback((toolCallId: string) => {
    setPendingTools((prev) =>
      prev.map((tool) =>
        tool.tool_call_id === toolCallId ? { ...tool, status: 'rejected' as const } : tool
      )
    );
    setDecisions((prev) => ({
      ...prev,
      approvals: { ...prev.approvals, [toolCallId]: false },
    }));
  }, []);

  const handleMock = useCallback((toolCallId: string, mockValue: unknown) => {
    setPendingTools((prev) =>
      prev.map((tool) =>
        tool.tool_call_id === toolCallId ? { ...tool, status: 'mocked' as const, mockValue } : tool
      )
    );
    setDecisions((prev) => ({
      calls: { ...prev.calls, [toolCallId]: mockValue },
      approvals: { ...prev.approvals, [toolCallId]: true },
    }));
  }, []);

  const clearPendingTools = useCallback(() => {
    setPendingTools([]);
    setDecisions({ calls: {}, approvals: {} });
  }, []);

  const allHandled =
    pendingTools.length > 0 && pendingTools.every((tool) => tool.status !== 'pending');

  return {
    pendingTools,
    decisions,
    addPendingTool,
    handleApprove,
    handleReject,
    handleMock,
    clearPendingTools,
    allHandled,
  };
}
