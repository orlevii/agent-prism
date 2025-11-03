export interface ToolCall {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface ToolResponse {
  toolCallIndex: number;
  response: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  thinking?: string;
  tool_calls?: ToolCall[]; // Legacy format for backward compatibility
  tool_calls_with_results?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
    isExecuting?: boolean;
  }>;
  pending_approval?: boolean; // Indicates if tool calls require manual approval
  tool_responses?: ToolResponse[];
  tool_name?: string; // For tool response messages
  responseGroupId?: string; // Groups related assistant messages from same streaming response
  isEditing?: boolean; // Track if message is currently being edited
}

export interface PlaygroundSettings {
  baseUrl: string;
  agent: string;
  dependencies: string; // JSON string
  forceHumanApproval: boolean;
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface GoogleAIStudioTool {
  name: string;
  description?: string;
  parameters?: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    propertyOrdering?: string[];
  };
}
