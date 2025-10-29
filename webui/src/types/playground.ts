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
  model: string;
  systemPrompt: string;
  temperature: number;
  tools: string; // JSON string
  enableThinking: boolean;
}

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaTool {
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

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
  };
  tools?: OllamaTool[];
}

export interface OllamaModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaTagsResponse {
  models: OllamaModel[];
}

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
    thinking?: string;
    tool_calls?: ToolCall[];
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}
