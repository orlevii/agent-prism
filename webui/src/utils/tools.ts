import type { GoogleAIStudioTool, Tool } from '../types/playground';

export function isGoogleAIStudioTool(tool: unknown): tool is GoogleAIStudioTool {
  if (!tool || typeof tool !== 'object') return false;

  const obj = tool as Record<string, unknown>;

  // Google AI Studio tools have 'name' at top level but NOT 'type: function'
  return (
    'name' in obj && typeof obj.name === 'string' && !('type' in obj && obj.type === 'function')
  );
}

export function transformGoogleToolToStandard(tool: GoogleAIStudioTool): Tool {
  const { name, description, parameters } = tool;

  const standardParameters = parameters
    ? {
        type: parameters.type,
        properties: parameters.properties,
        ...(parameters.required && { required: parameters.required }),
      }
    : undefined;

  return {
    type: 'function',
    function: {
      name,
      ...(description && { description }),
      ...(standardParameters && { parameters: standardParameters as Record<string, unknown> }),
    },
  };
}

export function transformGoogleToolsToStandard(tools: GoogleAIStudioTool[]): Tool[] {
  return tools.map(transformGoogleToolToStandard);
}

export function normalizeTools(tools: unknown[]): Tool[] {
  if (!Array.isArray(tools) || tools.length === 0) {
    return [];
  }

  const firstTool = tools[0];

  if (isGoogleAIStudioTool(firstTool)) {
    return transformGoogleToolsToStandard(tools as GoogleAIStudioTool[]);
  }

  return tools as Tool[];
}
