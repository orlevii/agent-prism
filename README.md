# Agent Prism 🔬

**The Storybook for AI Agents** - Build, test, and showcase your `pydantic-ai` agents in an interactive playground.

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

---

## 🎯 Motivation

Building AI agents is hard. Testing them is even harder.

When developing UI components, tools like Storybook revolutionized the workflow by providing an isolated environment to build, test, and showcase components. **Agent Prism brings this same philosophy to AI agent development.**

### The Problem

- **Slow iteration cycles** - Running agents in full applications slows down development
- **Hard to debug** - Understanding agent behavior, tool calls, and decision-making is opaque
- **Difficult to demonstrate** - Showing agent capabilities to stakeholders requires complex setups
- **No organized testing** - Agents scattered across codebases without a unified testing environment

### The Solution

Agent Prism automatically discovers your `pydantic-ai` agents, loads them into an interactive web playground, and lets you test, debug, and showcase them in real-time with full visibility into their thinking process and tool executions.

## ✨ Key Features

- 🔍 **Auto-Discovery** - Automatically finds and loads agents from your codebase
- 🎮 **Interactive Playground** - Beautiful web UI for testing agents in real-time
- 🔄 **Streaming Support** - Watch agent responses, thinking, and tool calls as they happen
- 🧩 **Dependency Injection** - Configure and switch between different dependency contexts
- 🛠️ **Tool Visualization** - See exactly what tools agents call with arguments and results
- 🎭 **Multi-Agent Support** - Test multiple agents in the same environment
- 📦 **Type-Safe** - Full TypeScript and Python type hints throughout

## 🚀 Quick Start

### Installation

```bash
pip install agent-prism
```

### Basic Example

Create an agent file with the `__prisim` suffix (e.g., `support_agent__prisim.py`):

```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from agent_prism.export import export_agent

class SupportDeps(BaseModel):
    company_name: str
    support_email: str

support_agent = Agent(
    model="openai:gpt-4",
    deps_type=SupportDeps
)

@support_agent.system_prompt
async def support_system_prompt(ctx: RunContext[SupportDeps]) -> str:
    return f"You are a helpful customer support agent for {ctx.deps.company_name}."

@support_agent.tool
async def check_order_status(ctx: RunContext[SupportDeps], order_id: str) -> str:
    """Check the status of a customer order."""
    return f"Order {order_id} is being processed and will ship in 2-3 business days."

@support_agent.tool
async def create_ticket(ctx: RunContext[SupportDeps], issue: str, priority: str) -> str:
    """Create a support ticket."""
    return f"Ticket created with {priority} priority. Contact: {ctx.deps.support_email}"

export_agent(
    agent=support_agent,
    dependencies=[
        {"name": "ACME Corp", "dependency": SupportDeps(company_name="ACME Corporation", support_email="support@acme.com")},
        {"name": "TechStart", "dependency": SupportDeps(company_name="TechStart Inc", support_email="help@techstart.io")}
    ]
)
```

Start the server and open `http://localhost:8765`:

```bash
agent-prism myapp.agents --reload
```

## 🛠️ CLI Reference

```bash
agent-prism <package> [options]

Options:
  --host TEXT      Server host (default: 0.0.0.0)
  --port INTEGER   Server port (default: 8765)
  --reload         Auto-reload on code changes
  --dev            Development mode (Vite dev server)
```

## 🤝 Contributing

Contributions are welcome! Fork the repository, create a feature branch, and submit a Pull Request.

## 📄 License

Licensed under **AGPL-3.0**. See [LICENSE](LICENSE) for details.
