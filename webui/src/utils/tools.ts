import type { GoogleAIStudioTool, OllamaTool } from '../types/playground';

/**
 * Checks if a tool object is in Google AI Studio format
 */
export function isGoogleAIStudioTool(tool: unknown): tool is GoogleAIStudioTool {
  if (!tool || typeof tool !== 'object') return false;

  const obj = tool as Record<string, unknown>;

  // Google AI Studio tools have 'name' at top level but NOT 'type: function'
  return (
    'name' in obj && typeof obj.name === 'string' && !('type' in obj && obj.type === 'function')
  );
}

/**
 * Transforms Google AI Studio tool format to Ollama tool format
 */
export function transformGoogleToolToOllama(tool: GoogleAIStudioTool): OllamaTool {
  const { name, description, parameters } = tool;

  // Remove Google-specific fields and create Ollama format
  const ollamaParameters = parameters
    ? {
        type: parameters.type,
        properties: parameters.properties,
        ...(parameters.required && { required: parameters.required }),
        // Omit propertyOrdering as Ollama doesn't use it
      }
    : undefined;

  return {
    type: 'function',
    function: {
      name,
      ...(description && { description }),
      ...(ollamaParameters && { parameters: ollamaParameters as Record<string, unknown> }),
    },
  };
}

/**
 * Transforms an array of Google AI Studio tools to Ollama format
 */
export function transformGoogleToolsToOllama(tools: GoogleAIStudioTool[]): OllamaTool[] {
  return tools.map(transformGoogleToolToOllama);
}

/**
 * Normalizes tools to Ollama format, detecting and transforming Google AI Studio format if needed
 */
export function normalizeTools(tools: unknown[]): OllamaTool[] {
  if (!Array.isArray(tools) || tools.length === 0) {
    return [];
  }

  // Check first tool to determine format
  const firstTool = tools[0];

  if (isGoogleAIStudioTool(firstTool)) {
    // Transform all tools from Google format
    return transformGoogleToolsToOllama(tools as GoogleAIStudioTool[]);
  }

  // Assume Ollama format
  return tools as OllamaTool[];
}
