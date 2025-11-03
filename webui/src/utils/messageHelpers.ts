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

/**
 * Edits a specific part at the given index in the flattened parts array,
 * and removes all parts that come after it. Returns the reconstructed messages.
 */
export function editPartAndTruncate(
  messages: ModelMessage[],
  flatPartIndex: number,
  newContent: string | Record<string, unknown>
): ModelMessage[] {
  // Flatten all parts with message metadata
  const flatParts: Array<{
    part: MessagePart;
    messageIndex: number;
    partIndex: number;
  }> = [];

  messages.forEach((message, messageIndex) => {
    message.parts.forEach((part, partIndex) => {
      flatParts.push({ part, messageIndex, partIndex });
    });
  });

  // Validate index
  if (flatPartIndex < 0 || flatPartIndex >= flatParts.length) {
    return messages;
  }

  // Update the part at the specified index
  const targetFlatPart = flatParts[flatPartIndex];
  const targetPart = targetFlatPart.part;

  // Update content based on part type
  let updatedPart: MessagePart;
  if (targetPart.part_kind === 'user-prompt') {
    updatedPart = { ...targetPart, content: newContent as string };
  } else if (targetPart.part_kind === 'tool-return') {
    updatedPart = { ...targetPart, content: newContent };
  } else {
    // Should not happen, but handle gracefully
    return messages;
  }

  // Keep only parts up to and including the edited part
  const keptFlatParts = flatParts.slice(0, flatPartIndex + 1);
  // Update the edited part
  keptFlatParts[flatPartIndex] = {
    ...keptFlatParts[flatPartIndex],
    part: updatedPart,
  };

  // Reconstruct messages from kept parts
  const newMessages: ModelMessage[] = [];
  let currentMessageIndex = -1;
  let currentParts: MessagePart[] = [];

  keptFlatParts.forEach((flatPart, idx) => {
    if (flatPart.messageIndex !== currentMessageIndex) {
      // Save previous message if exists
      if (currentMessageIndex >= 0 && currentParts.length > 0) {
        newMessages.push({
          ...messages[currentMessageIndex],
          parts: currentParts,
        });
      }
      // Start new message
      currentMessageIndex = flatPart.messageIndex;
      currentParts = [flatPart.part];
    } else {
      // Add to current message
      currentParts.push(flatPart.part);
    }

    // If this is the last part, save the message
    if (idx === keptFlatParts.length - 1) {
      newMessages.push({
        ...messages[currentMessageIndex],
        parts: currentParts,
      });
    }
  });

  return newMessages;
}
