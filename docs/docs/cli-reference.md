# CLI Reference

Complete reference for the `agent-playbook` command-line interface.

## Basic Usage

```bash
agent-playbook PACKAGE [OPTIONS]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `PACKAGE` | Python package containing your agents (e.g., `my_agents`) |

## Options

### `--port PORT`

Specify the port for the web server.

```bash
agent-playbook my_agents --port 8001
```

**Default:** `8765`

### `--host HOST`

Specify the host/IP address to bind to.

```bash
agent-playbook my_agents --host 127.0.0.1
```

**Default:** `127.0.0.1`

### `--reload`

Enable hot reload when files change. Useful during development.

```bash
agent-playbook my_agents --reload
```

When `--reload` is enabled:
- Server automatically restarts when Python files change
- Agents are re-discovered and re-loaded
- Your conversation history is lost (page refreshes)

### `--dev`

Run in development mode with Vite dev server for frontend.

```bash
agent-playbook my_agents --dev
```

Use this when developing the Agent Playbook frontend itself, not for testing your agents.

### `--workers WORKERS`

Set the number of worker processes for the ASGI server.

```bash
agent-playbook my_agents --workers 4
```

**Default:** `1`

**Note:** Only use this for production. For development, keep this at 1.

### `--root-path ROOT_PATH`

Set the root path for the API (useful when behind a reverse proxy).

```bash
agent-playbook my_agents --root-path /agents
```

This prefixes all API endpoints with `/agents/`, so the API becomes:
- `http://example.com/agents/api/chat`
- `http://example.com/agents/api/agents`

## Common Workflows

### Development with Hot Reload

```bash
agent-playbook my_agents --reload
```

This enables:

- ✅ Automatic restart on file changes
- ✅ Console output for debugging
- ✅ Easy iteration on agents

### Behind a Reverse Proxy

```bash
agent-playbook my_agents --root-path /my-agents --host 0.0.0.0
```

Then configure your proxy to forward requests to `/my-agents/*` to the server.
