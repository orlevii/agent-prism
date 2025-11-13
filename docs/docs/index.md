# Agent Playbook

**Storybook for AI Agents** — An interactive development tool for pydantic-ai agents.

## What is Agent Playbook?

Agent Playbook provides an isolated, interactive testing environment for your pydantic-ai agents. With a beautiful web playground, you get real-time visibility into agent thinking, tool executions, and streaming responses—enabling rapid iteration and debugging.

## Key Features

- 🎭 **Interactive Playground** — Chat with your agents in a web UI without writing code
- 🔍 **See Everything** — Visualize thinking, tool calls, and results as they happen
- 🎯 **Multiple Scenarios** — Test the same agent with different dependencies and configurations
- 🛠️ **Tool Visualization** — Automatically displays all available tools and their results
- ⚡ **Hot Reload** — Iterate faster with live reloading during development
- 📝 **Edit & Regenerate** — Modify message history and re-run conversations at any point

## Quick Start

```bash
# Install
pip install agent-playbook

# Create your agent file with __scenarios.py
# (See "Getting Started" for details)

# Run the playground
agent-playbook your_package
```

Open http://localhost:8765 and start testing your agent!

## Next Steps

- **New to Agent Playbook?** Start with [Getting Started](getting-started.md)
- **Ready to use the UI?** Check out the [Playground Guide](playground-guide.md)
- **Need CLI options?** See the [CLI Reference](cli-reference.md)
