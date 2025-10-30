import type { Tool } from '../types/playground';
import { normalizeTools } from './tools';

export function parseTools(toolsString: string): Tool[] | undefined {
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
