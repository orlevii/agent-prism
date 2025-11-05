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

**Default:** `8000`

### `--host HOST`

Specify the host/IP address to bind to.

```bash
agent-playbook my_agents --host 0.0.0.0
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
agent-playbook my_agents --reload --port 8000
```

This enables:
- ✅ Automatic restart on file changes
- ✅ Console output for debugging
- ✅ Easy iteration on agents

### Production Setup

```bash
agent-playbook my_agents --host 0.0.0.0 --workers 4 --port 8000
```

This:
- ✅ Listens on all network interfaces
- ✅ Uses 4 worker processes
- ✅ Ready for reverse proxy setup

### Behind a Reverse Proxy

```bash
agent-playbook my_agents --root-path /my-agents --host 0.0.0.0
```

Then configure your proxy to forward requests to `/my-agents/*` to the server.

## Environment Variables

Agent Playbook respects standard Python environment variables:

- `PYTHONPATH` — Add directories to Python module search path
- `PYTHONDONTWRITEBYTECODE` — Prevent `.pyc` file generation

Example:

```bash
PYTHONPATH=/my/custom/path agent-playbook my_agents
```

## Example Commands

**Local development:**
```bash
agent-playbook my_agents --reload
```

**Test on a different port:**
```bash
agent-playbook my_agents --port 3000
```

**Production on Linux:**
```bash
agent-playbook my_agents --host 0.0.0.0 --workers 4 --port 8000
```

**Behind Nginx proxy (prefixed path):**
```bash
agent-playbook my_agents --root-path /agents --host 127.0.0.1 --workers 4
```

## Troubleshooting

### "No agents found"

**Solution:**
1. Check that files ending with `__scenarios.py` exist
2. Ensure `export()` is called in those files
3. Verify the package name is correct

```bash
# Debug: Check if package is importable
python -c "import my_agents; print(my_agents.__file__)"
```

### Port already in use

**Solution:** Use a different port

```bash
agent-playbook my_agents --port 8001
```

Or find what's using the port:

```bash
# macOS/Linux
lsof -i :8000

# Windows
netstat -ano | findstr :8000
```

### Changes not reloading

**Solution:** Make sure you're using `--reload`

```bash
agent-playbook my_agents --reload
```

### Connection refused

**Solution:** Check that the server is running and accessible

```bash
# Test if server is responding
curl http://localhost:8000/api/agents
```

## Next Steps

- **Getting started?** See [Getting Started](getting-started.md)
- **Need help with agents?** Check [Exporting Agents](exporting-agents.md)
