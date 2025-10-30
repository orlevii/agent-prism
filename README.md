# Agent Prism 🔬

**The Storybook for AI Agents** - Build, test, and showcase your `pydantic-ai` agents in an interactive playground.

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Built with pydantic-ai](https://img.shields.io/badge/built%20with-pydantic--ai-orange.svg)](https://ai.pydantic.dev/)

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

---

## ✨ Key Features

- 🔍 **Auto-Discovery** - Automatically finds and loads agents from your codebase
- 🎮 **Interactive Playground** - Beautiful web UI for testing agents in real-time
- 🔄 **Streaming Support** - Watch agent responses, thinking, and tool calls as they happen
- 🧩 **Dependency Injection** - Configure and switch between different dependency contexts
- 🛠️ **Tool Visualization** - See exactly what tools agents call with arguments and results
- 🎭 **Multi-Agent Support** - Test multiple agents in the same environment
- 📦 **Type-Safe** - Full TypeScript and Python type hints throughout

---

## 🚀 Quick Start

### Installation

```bash
pip install agent-prism
```

### 3 Steps to Your First Agent Playground

**Step 1:** Create an agent file with the `__prisim` suffix (e.g., `support_agent__prisim.py`):

```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from agent_prism.export import export_agent

# Define your dependencies
class SupportDeps(BaseModel):
    company_name: str
    support_email: str

# Create your agent
support_agent = Agent(
    model="openai:gpt-4",
    deps_type=SupportDeps,
    system_prompt="You are a helpful customer support agent for {company_name}."
)

# Add tools to your agent
@support_agent.tool
async def check_order_status(ctx: RunContext[SupportDeps], order_id: str) -> str:
    """Check the status of a customer order."""
    return f"Order {order_id} is currently being processed and will ship within 2-3 business days."

@support_agent.tool
async def create_ticket(ctx: RunContext[SupportDeps], issue: str, priority: str) -> str:
    """Create a support ticket."""
    return f"Ticket created with {priority} priority. Support email: {ctx.deps.support_email}"

# Export the agent with default dependencies
export_agent(
    agent=support_agent,
    dependencies=[
        {
            "name": "ACME Corp",
            "dependency": SupportDeps(
                company_name="ACME Corporation",
                support_email="support@acme.com"
            )
        },
        {
            "name": "TechStart",
            "dependency": SupportDeps(
                company_name="TechStart Inc",
                support_email="help@techstart.io"
            )
        }
    ]
)
```

**Step 2:** Start the Agent Prism server:

```bash
agent-prism myapp.agents
```

**Step 3:** Open your browser to `http://localhost:8765` and start testing!

The playground will:
- Automatically discover your `support_agent`
- Load both dependency configurations ("ACME Corp" and "TechStart")
- Let you chat with the agent and see tool calls in real-time
- Switch between different dependency contexts

---

## 📖 Example Usage

Let's build a simple **Email Assistant** that can search emails and draft responses.

### 1. Create the Agent (`agents/email_assistant__prisim.py`)

```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from datetime import datetime
from agent_prism.export import export_agent

class EmailDeps(BaseModel):
    user_name: str
    user_email: str

email_agent = Agent(
    model="openai:gpt-4",
    deps_type=EmailDeps,
    system_prompt=(
        "You are an email assistant for {user_name}. "
        "Help manage emails, search for messages, and draft responses."
    )
)

@email_agent.tool
async def search_emails(
    ctx: RunContext[EmailDeps],
    query: str,
    limit: int = 5
) -> str:
    """Search through emails using a query string."""
    # In production, this would connect to an actual email API
    mock_results = [
        f"From: john@example.com - Subject: Meeting tomorrow - Date: {datetime.now()}",
        f"From: sarah@company.com - Subject: Project update - Date: {datetime.now()}",
    ]
    return f"Found {len(mock_results)} emails:\n" + "\n".join(mock_results[:limit])

@email_agent.tool
async def draft_reply(
    ctx: RunContext[EmailDeps],
    to_email: str,
    subject: str,
    tone: str = "professional"
) -> str:
    """Draft an email reply with the specified tone."""
    return f"Draft created from {ctx.deps.user_email} to {to_email} with {tone} tone"

# Export with multiple user contexts
export_agent(
    agent=email_agent,
    dependencies=[
        {
            "name": "John's Account",
            "dependency": EmailDeps(
                user_name="John Smith",
                user_email="john@example.com"
            )
        },
        {
            "name": "Sarah's Account",
            "dependency": EmailDeps(
                user_name="Sarah Johnson",
                user_email="sarah@company.com"
            )
        }
    ]
)
```

### 2. Start the Playground

```bash
agent-prism start myapp.agents --port 8765 --reload
```

The `--reload` flag enables auto-reload when you modify agent code.

### 3. Test in the Browser

Navigate to `http://localhost:8765` and try:

```
You: "Search for emails about the project update"
Agent: [Calls search_emails tool] "I found 2 emails about project updates..."

You: "Draft a reply to Sarah thanking her for the update"
Agent: [Calls draft_reply tool] "I've drafted a professional email..."
```

Switch between "John's Account" and "Sarah's Account" in the UI to test different contexts!

---

## 🏗️ How It Works

### Agent Discovery

Agent Prism uses a simple naming convention to discover agents:

1. **Create files with `__prisim` suffix**: `my_agent__prisim.py`
2. **Export agents**: Use `export_agent()` to register them
3. **Start the server**: Point to your package (`agent-prism start myapp.agents`)

The discovery system:
- Recursively scans your package for `*__prisim.py` files
- Imports and loads all exported agents
- Registers their dependencies and metadata
- Makes them available in the playground

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Your Codebase (myapp/agents/)                      │
│  ├── customer_support__prisim.py                    │
│  ├── email_assistant__prisim.py                     │
│  └── data_analyst__prisim.py                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Discovery & Loading
                   ▼
┌─────────────────────────────────────────────────────┐
│  Agent Prism Server (FastAPI)                       │
│  ├── REST API (/api/agents, /api/chat)             │
│  ├── Streaming Events (SSE)                         │
│  └── Static File Serving                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP/SSE
                   ▼
┌─────────────────────────────────────────────────────┐
│  Web Playground (React)                             │
│  ├── Agent Selector                                 │
│  ├── Chat Interface                                 │
│  ├── Tool Call Visualization                        │
│  └── Dependency Configuration                       │
└─────────────────────────────────────────────────────┘
```

### Real-Time Events

Agent Prism streams these events during agent execution:

- **`text_delta`** - Incremental text from the agent
- **`thinking_delta`** - Extended thinking process (Claude 4+)
- **`tool_call_executing`** - When a tool is invoked
- **`tool_result`** - Results from tool execution
- **`error`** - Error messages
- **`done`** - Completion status

---

## 🎭 Advanced Features

### Multi-Agent Systems

Create complex systems with multiple coordinating agents:

```python
# orchestrator__prisim.py
from pydantic_ai import Agent, RunContext

planner_agent = Agent(model="openai:gpt-4", system_prompt="Create execution plans")
executor_agent = Agent(model="openai:gpt-4", system_prompt="Execute plans")

orchestrator = Agent(model="openai:gpt-4")

@orchestrator.tool
async def create_plan(ctx: RunContext, goal: str) -> str:
    """Delegate to planner agent."""
    result = await planner_agent.run(goal)
    return result.output

@orchestrator.tool
async def execute_plan(ctx: RunContext, plan: str) -> str:
    """Delegate to executor agent."""
    result = await executor_agent.run(plan)
    return result.output

export_agent(orchestrator, dependencies=[{"name": "default", "dependency": None}])
```

### Custom Dependencies

Inject any typed dependencies your agents need:

```python
from pydantic import BaseModel
from datetime import datetime

class AgentContext(BaseModel):
    user_id: str
    session_id: str
    api_keys: dict[str, str]
    current_time: datetime
    feature_flags: dict[str, bool]

agent = Agent(deps_type=AgentContext, ...)

export_agent(
    agent=agent,
    dependencies=[
        {
            "name": "Production",
            "dependency": AgentContext(
                user_id="user_123",
                session_id="sess_456",
                api_keys={"stripe": "sk_live_..."},
                current_time=datetime.now(),
                feature_flags={"new_ui": True}
            )
        },
        {
            "name": "Development",
            "dependency": AgentContext(
                user_id="dev_user",
                session_id="dev_sess",
                api_keys={"stripe": "sk_test_..."},
                current_time=datetime.now(),
                feature_flags={"new_ui": False}
            )
        }
    ]
)
```

---

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-prism.git
cd agent-prism

# Install dependencies
poetry install

# Build the web UI
python build.py

# Run in development mode
agent-prism start sandbox.agents --port 8765 --dev
```

### Development Mode

Use `--dev` flag to proxy to Vite dev server for hot-reloading:

```bash
agent-prism start myapp.agents --dev --reload
```

This enables:
- Hot module replacement for React components
- Auto-reload for Python agent code changes
- Source maps for debugging

---

## 📚 CLI Reference

```bash
agent-prism start <package> [options]

Arguments:
  package          Python package containing agents (e.g., myapp.agents)

Options:
  --host TEXT      Server host (default: 0.0.0.0)
  --port INTEGER   Server port (default: 8765)
  --reload         Enable auto-reload for agent code changes
  --dev            Development mode (proxy to Vite dev server)
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (coming soon)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0).

This means:
- ✅ You can use, modify, and distribute this software
- ✅ You can use it for commercial purposes
- ⚠️ If you run a modified version as a network service, you must make your source code available
- ⚠️ All derivative works must also be licensed under AGPL-3.0

See [LICENSE](LICENSE) for the full license text.

---

## 🙏 Acknowledgments

- Built with [pydantic-ai](https://ai.pydantic.dev/) - the agent framework for Python
- Inspired by [Storybook](https://storybook.js.org/) - the UI component workshop
- UI powered by [React](https://react.dev/), [TailwindCSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/)

---

## 🔗 Links

- **Documentation**: Coming soon
- **Issue Tracker**: [GitHub Issues](https://github.com/yourusername/agent-prism/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/agent-prism/discussions)

---

<div align="center">

**Built with ❤️ for the AI agent community**

[⭐ Star on GitHub](https://github.com/yourusername/agent-prism) | [🐛 Report Bug](https://github.com/yourusername/agent-prism/issues) | [💡 Request Feature](https://github.com/yourusername/agent-prism/issues)

</div>
