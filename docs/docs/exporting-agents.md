# Exporting Agents

Agent Playbook auto-discovers agents through a simple convention: the `__scenarios.py` file.

## The `__scenarios.py` Convention

Any Python file ending with `__scenarios.py` is automatically discovered and imported by Agent Playbook. This file should call `export()` to register your agents.

### File Naming

```
my_package/
├── my_agent.py              # Your agent definition
├── my_agent__scenarios.py    # <- Must end with __scenarios.py
└── other_agent__scenarios.py # Multiple scenario files supported
```

## Basic Export

The simplest export looks like this:

```python
# my_agent__scenarios.py
from agent_playbook import export
from .my_agent import agent

export(agent)
```

This makes your agent available in the playground with a default name based on the agent's name.

## Export with Metadata

Provide useful metadata to display in the UI:

```python
from agent_playbook import export
from .my_agent import agent

export(
    agent,
    name="Customer Support Agent",
    description="Handles order inquiries and returns",
)
```

**Available options:**
- `name` — Display name in the agent dropdown
- `description` — Brief description shown in the UI

## What Gets Discovered?

Agent Playbook auto-discovers:
- ✅ All `__scenarios.py` files in your package
- ✅ Tool definitions from `@agent.tool` decorators
- ✅ Tool parameters and descriptions

Agent Playbook does NOT inspect:
- ❌ System prompts (not displayed in UI)
- ❌ Model configuration details

## Next Steps

- **Testing different configurations?** See [Scenarios](scenarios.md)
- **Using dependencies?** Learn about [Dependency Injection](scenarios.md#using-dependency-injection)
- **Running the playground?** See [Getting Started](getting-started.md)
