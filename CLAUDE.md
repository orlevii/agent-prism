# Agent Playbook - Repository Context

## Mission

Agent Playbook is **"Storybook for AI Agents"** - an interactive development tool that provides an isolated testing environment for `pydantic-ai` agents. It enables rapid iteration, debugging, and showcasing of agents through a web playground with real-time visibility into agent thinking, tool executions, and streaming responses.

## Architecture Overview

### Key Patterns

#### 1. Agent Discovery Convention

- Agents are auto-discovered using the `__scenarios` suffix pattern:
- Files ending with `__scenarios.py` are automatically imported
- `export_agent()` registers agents during module import
- Multiple dependency configurations enable testing different scenarios

#### 2. Streaming Event Architecture

All agent interactions use Server-Sent Events (SSE) for streaming responses.

**Event Types** (defined in `src/agent_playbook/types.py`):
- `TextDeltaEvent` - Streaming text content
- `ThinkingDeltaEvent` - Agent reasoning/thought process
- `ToolCallExecutingEvent` - Tool invocation with arguments
- `ToolResultEvent` - Tool execution results
- `ErrorEvent` - Error information
- `DoneEvent` - Stream completion signal

**API Endpoint**: `POST /api/chat` accepts messages and streams events back as newline-delimited JSON.

## Common Tasks Context

### Modifying Streaming Events

1. Update event types in `src/agent_playbook/types.py`
2. Update event emission in `src/agent_playbook/api.py:chat_endpoint`
3. Update TypeScript types in `webui/src/types/events.ts`
4. Update event handling in `webui/src/hooks/useStreamingResponse.ts`

### Frontend Component Changes

- UI primitives: `webui/src/components/ui/` (ShadCN)
- Feature components: `webui/src/components/Playground/`
- Update imports if moving/renaming components
- TailwindCSS v4 uses new `@theme` syntax in CSS

### Backend API Changes

- Add endpoints in `src/agent_playbook/api.py`
- Update TypeScript API client in `webui/src/utils/apiClient.ts`
- Maintain type consistency between Python and TypeScript

## Testing

- Backend tests in `tests/` using pytest
- Type checking with `poe mypy` (strict mode enforced)
- Frontend component testing with React Testing Library (if added)
- Integration testing via example agents in `examples/`
