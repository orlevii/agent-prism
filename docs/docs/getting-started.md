# Getting Started

Get up and running with Agent Playbook in just a few minutes.

## Installation

Install Agent Playbook using pip:

```bash
pip install agent-playbook
```

**Requirements:**
- Python 3.10 or later
- An existing pydantic-ai agent (or create one following [pydantic-ai docs](https://ai.pydantic.dev/))

## Your First Agent in Playbook

Let's say you already have a pydantic-ai agent defined. Here's how to make it interactive with Agent Playbook.

### 1. Create a Package Structure

Organize your code as a Python package:

```
my_project/
├── my_agents/
│   ├── __init__.py
│   ├── support_agent.py      # Your agent definition
│   └── support_agent__scenarios.py  # Scenarios file
└── main.py
```

### 2. Define Your Agent

Create your pydantic-ai agent normally (in `support_agent.py`):

```python
from pydantic_ai import Agent

agent = Agent(
    model="openai:gpt-4",
    system_prompt="You are a helpful support agent.",
)

@agent.tool
def check_order_status(order_id: str) -> str:
    """Check the status of an order."""
    return f"Order {order_id} is being processed"
```

### 3. Export Your Agent

Create a `__scenarios.py` file in the same package:

```python
from agent_playbook import export
from .support_agent import agent

export(
    agent,
    name="Support Agent",
    description="Helps customers with their orders",
)
```

### 4. Run the Playground

From your project root:

```bash
agent-playbook my_agents
```

This command will:
- Auto-discover your agent via the `__scenarios.py` file
- Start a web server on `http://localhost:8000`
- Open the interactive playground

### 5. Test Your Agent

Open http://localhost:8000 in your browser and:
1. Select your agent from the dropdown
2. Type a message (e.g., "What's the status of order 123?")
3. Watch your agent respond with thinking, tool calls, and results

## What's Next?

- **Multiple configurations?** Learn about [Scenarios](scenarios.md)
- **Complex setup?** See how to use [Dependency Injection](scenarios.md#using-dependency-injection)
- **Explore the UI?** Read the [Playground Guide](playground-guide.md)
- **Need more options?** Check the [CLI Reference](cli-reference.md)

## Troubleshooting

**"No agents found"**
- Ensure your file ends with `__scenarios.py`
- Make sure you're calling `export()` in that file
- Verify the package path is correct in the command

**Port already in use**
- Use `--port 8001` (or any other port) to specify a different port

**Changes not reloading**
- Use `agent-playbook my_agents --reload` for hot reload during development
