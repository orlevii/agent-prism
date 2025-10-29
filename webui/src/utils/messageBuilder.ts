import type { Message, ToolCall } from '../types/playground';

export interface ApiMessage {
  role: string;
  content: string;
  tool_calls?: ToolCall[];
  tool_name?: string;
}

/**
 * Builds API messages array from chat messages
 * @param messages - Array of chat messages
 * @param systemPrompt - Optional system prompt to prepend
 * @param includeToolData - Whether to include tool_calls and tool_name fields
 * @returns Array of API-formatted messages
 */
export function buildApiMessages(
  messages: Message[],
  systemPrompt: string = '',
  includeToolData: boolean = false
): ApiMessage[] {
  const apiMessages = messages
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

  // Add system prompt if provided
  if (systemPrompt.trim()) {
    apiMessages.unshift({
      role: 'system',
      content: systemPrompt,
    });
  }

  return apiMessages;
}

/**
 * Builds API messages for a new user message
 * @param messages - Existing chat messages
 * @param userContent - New user message content
 * @param systemPrompt - Optional system prompt
 * @returns Array of API-formatted messages
 */
export function buildApiMessagesWithUserInput(
  messages: Message[],
  userContent: string,
  systemPrompt: string = ''
): ApiMessage[] {
  const apiMessages = buildApiMessages(messages, systemPrompt);
  apiMessages.push({
    role: 'user',
    content: userContent,
  });
  return apiMessages;
}
