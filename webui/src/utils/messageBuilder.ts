import type { Message } from '../types/playground';
import type { ApiMessage } from '../types/agent';
import type { ModelMessage } from '../types/message';

export function buildApiMessages(
  messages: Message[],
  includeToolData: boolean = false
): ApiMessage[] {
  return messages
    .filter((msg) => !msg.isStreaming)
    .map((msg) => {
      const baseMessage: ApiMessage = {
        role: msg.role,
        content: msg.content,
      };

      if (includeToolData) {
        if (msg.role === 'assistant' && msg.tool_calls) {
          baseMessage.tool_calls = msg.tool_calls;
        }
        if (msg.role === 'tool' && msg.tool_name) {
          baseMessage.tool_name = msg.tool_name;
        }
      }

      return baseMessage;
    });
}

export function buildApiMessagesWithUserInput(
  messages: Message[],
  userContent: string
): ApiMessage[] {
  const apiMessages = buildApiMessages(messages);
  apiMessages.push({
    role: 'user',
    content: userContent,
  });
  return apiMessages;
}

export function buildApiMessagesFromModelMessages(messages: ModelMessage[]): ApiMessage[] {
  const apiMessages: ApiMessage[] = [];

  for (const msg of messages) {
    if (msg.kind === 'request') {
      // Find user-prompt or tool-return parts
      for (const part of msg.parts) {
        if (part.part_kind === 'user-prompt') {
          apiMessages.push({
            role: 'user',
            content: part.content,
          });
        } else if (part.part_kind === 'tool-return') {
          apiMessages.push({
            role: 'tool',
            content: typeof part.content === 'string' ? part.content : JSON.stringify(part.content),
            tool_name: part.tool_name,
          });
        }
      }
    } else if (msg.kind === 'response') {
      // Find text and tool-call parts
      let textContent = '';
      const toolCalls: Array<{
        function: { name: string; arguments: Record<string, unknown> };
      }> = [];

      for (const part of msg.parts) {
        if (part.part_kind === 'text') {
          textContent += part.content;
        } else if (part.part_kind === 'tool-call') {
          const args = typeof part.args === 'string' ? JSON.parse(part.args) : part.args;
          toolCalls.push({
            function: {
              name: part.tool_name,
              arguments: args,
            },
          });
        }
      }

      // Only add message if there's content or tool calls
      if (textContent || toolCalls.length > 0) {
        const assistantMessage: ApiMessage = {
          role: 'assistant',
          content: textContent,
        };

        if (toolCalls.length > 0) {
          assistantMessage.tool_calls = toolCalls;
        }

        apiMessages.push(assistantMessage);
      }
    }
  }

  return apiMessages;
}
