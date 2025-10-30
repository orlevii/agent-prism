import type { Message } from '../types/playground';
import type { ApiMessage } from '../types/agent';

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
