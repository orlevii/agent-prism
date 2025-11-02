// TypeScript types matching pydantic-ai's ModelMessage structure

// Part types - discriminated by part_kind
export interface SystemPromptPart {
  part_kind: 'system-prompt';
  content: string;
  timestamp: string;
  dynamic_ref?: string;
}

export interface UserPromptPart {
  part_kind: 'user-prompt';
  content: string;
  timestamp: string;
}

export interface TextPart {
  part_kind: 'text';
  content: string;
  id?: string | null;
}

export interface ToolCallPart {
  part_kind: 'tool-call';
  tool_name: string;
  args: string | Record<string, unknown>;
  tool_call_id: string;
  id?: string | null;
}

export interface ToolReturnPart {
  part_kind: 'tool-return';
  tool_name: string;
  content: unknown;
  tool_call_id: string;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export interface ThinkingPart {
  part_kind: 'thinking';
  content: string;
  id?: string | null;
  signature?: string | null;
  provider_name?: string | null;
}

// Union type for all part kinds
export type MessagePart =
  | SystemPromptPart
  | UserPromptPart
  | TextPart
  | ToolCallPart
  | ToolReturnPart
  | ThinkingPart;

// Usage information
export interface Usage {
  input_tokens: number;
  cache_write_tokens: number;
  cache_read_tokens: number;
  output_tokens: number;
  input_audio_tokens: number;
  cache_audio_read_tokens: number;
  output_audio_tokens: number;
  details: {
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
    input_tokens: number;
    output_tokens: number;
  };
}

// Provider details
export interface ProviderDetails {
  finish_reason?: string;
  [key: string]: unknown;
}

// Base message structure
interface BaseMessage {
  parts: MessagePart[];
}

// Request message (user input)
export interface ModelRequest extends BaseMessage {
  kind: 'request';
  instructions?: string | null;
}

// Response message (assistant output)
export interface ModelResponse extends BaseMessage {
  kind: 'response';
  usage?: Usage;
  model_name?: string;
  timestamp?: string;
  provider_name?: string;
  provider_details?: ProviderDetails;
  provider_response_id?: string;
  finish_reason?: string;
}

// Union type for all message kinds
export type ModelMessage = ModelRequest | ModelResponse;

// Helper type guard functions
export function isSystemPromptPart(part: MessagePart): part is SystemPromptPart {
  return part.part_kind === 'system-prompt';
}

export function isUserPromptPart(part: MessagePart): part is UserPromptPart {
  return part.part_kind === 'user-prompt';
}

export function isTextPart(part: MessagePart): part is TextPart {
  return part.part_kind === 'text';
}

export function isToolCallPart(part: MessagePart): part is ToolCallPart {
  return part.part_kind === 'tool-call';
}

export function isToolReturnPart(part: MessagePart): part is ToolReturnPart {
  return part.part_kind === 'tool-return';
}

export function isThinkingPart(part: MessagePart): part is ThinkingPart {
  return part.part_kind === 'thinking';
}

export function isModelRequest(message: ModelMessage): message is ModelRequest {
  return message.kind === 'request';
}

export function isModelResponse(message: ModelMessage): message is ModelResponse {
  return message.kind === 'response';
}
