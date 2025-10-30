export interface Agent {
  id: string;
  name: string;
  description?: string;
}

export interface AgentsResponse {
  agents: string[];
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

export interface StreamChunk {
  message: {
    role: string;
    content: string;
    thinking?: string;
    tool_calls?: Array<{
      function: {
        name: string;
        arguments: Record<string, unknown>;
      };
    }>;
  };
  done: boolean;
}
