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
  tool_calls?: ToolCall[];
  tool_responses?: ToolResponse[];
  tool_name?: string; // For tool response messages
  responseGroupId?: string; // Groups related assistant messages from same streaming response
  isEditing?: boolean; // Track if message is currently being edited
}

export interface PlaygroundSettings {
  baseUrl: string;
  agent: string;
  dependencies: string; // JSON string
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
