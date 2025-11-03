import type { ModelMessage, ModelResponse, MessagePart } from '../types/message';

/**
 * Validates and extracts the last response message from the message array.
 * Returns null if there's no last message or if it's not a response message.
 */
export function getLastResponseMessage(messages: ModelMessage[]): ModelResponse | null {
  if (messages.length === 0) return null;
  const lastMsg = messages[messages.length - 1];
  if (lastMsg.kind !== 'response') return null;
  return lastMsg;
}

/**
 * Immutably replaces the last message in the array with an updated version.
 */
export function replaceLastMessage(
  messages: ModelMessage[],
  updatedMessage: ModelMessage
): ModelMessage[] {
  return [...messages.slice(0, -1), updatedMessage];
}

/**
 * Generic function to update or create a message part by type.
 * If a part with the given kind exists, it updates it. Otherwise, it creates a new one.
 */
export function updateMessagePart<T extends MessagePart>(
  messages: ModelMessage[],
  partKind: T['part_kind'],
  createOrUpdatePart: (existingPart?: T) => T
): ModelMessage[] {
  const lastMsg = getLastResponseMessage(messages);
  if (!lastMsg) return messages;

  const parts = [...lastMsg.parts];
  const partIndex = parts.findIndex((p) => p.part_kind === partKind);

  if (partIndex >= 0) {
    // Update existing part
    parts[partIndex] = createOrUpdatePart(parts[partIndex] as T);
  } else {
    // Create new part
    parts.push(createOrUpdatePart());
  }

  return replaceLastMessage(messages, { ...lastMsg, parts });
}

/**
 * Adds a new part to the last response message.
 * Returns the original messages array if conditions aren't met.
 */
export function addMessagePart(messages: ModelMessage[], newPart: MessagePart): ModelMessage[] {
  const lastMsg = getLastResponseMessage(messages);
  if (!lastMsg) return messages;

  const parts = [...lastMsg.parts, newPart];
  return replaceLastMessage(messages, { ...lastMsg, parts });
}

/**
 * Checks if a part with the given predicate already exists in the last message.
 */
export function hasMessagePart(
  messages: ModelMessage[],
  predicate: (part: MessagePart) => boolean
): boolean {
  const lastMsg = getLastResponseMessage(messages);
  if (!lastMsg) return false;
  return lastMsg.parts.some(predicate);
}
