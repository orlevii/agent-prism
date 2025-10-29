import type { OllamaTool } from '../types/playground';
import { normalizeTools } from './tools';

/**
 * Parses and normalizes tools from a JSON string
 * @param toolsString - JSON string containing tool definitions
 * @returns Normalized tools array or undefined if invalid/empty
 */
export function parseTools(toolsString: string): OllamaTool[] | undefined {
  if (!toolsString.trim()) {
    return undefined;
  }

  try {
    const parsedTools = JSON.parse(toolsString);
    if (Array.isArray(parsedTools) && parsedTools.length > 0) {
      return normalizeTools(parsedTools);
    }
  } catch (e) {
    console.warn('Invalid tools JSON:', e);
  }

  return undefined;
}
