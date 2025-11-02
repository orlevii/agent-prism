export interface DependencyInfo {
  name: string;
  data: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  dependencies: DependencyInfo[];
}

export interface AgentsResponse {
  agents: Array<{
    name: string;
    dependencies: DependencyInfo[];
  }>;
}

export interface ApiMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: Array<{
    function: {
      name: string;
      arguments: Record<string, unknown>;
    };
  }>;
  tool_name?: string;
}

export interface ChatRequest {
  agent: string;
  messages: ApiMessage[];
  dependencies?: Record<string, unknown>;
  stream?: boolean;
}

// Stream event types matching backend
export type DoneStatus = 'complete' | 'pending_approval';

export interface TextDeltaEvent {
  type: 'text_delta';
  delta: string;
}

export interface ThinkingDeltaEvent {
  type: 'thinking_delta';
  delta: string;
}

export interface ToolCallExecutingEvent {
  type: 'tool_call_executing';
  tool_call_id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResultEvent {
  type: 'tool_result';
  tool_call_id: string;
  result: unknown;
}

export interface ErrorEvent {
  type: 'error';
  error: string;
}

export interface MessageHistoryEvent {
  type: 'message_history';
  message_history: Array<Record<string, unknown>>;
}

export interface DoneEvent {
  type: 'done';
  status: DoneStatus;
}

export type StreamEvent =
  | TextDeltaEvent
  | ThinkingDeltaEvent
  | ToolCallExecutingEvent
  | ToolResultEvent
  | ErrorEvent
  | MessageHistoryEvent
  | DoneEvent;

// Tool call with result for UI display
export interface ToolCallWithResult {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  isExecuting?: boolean;
}
