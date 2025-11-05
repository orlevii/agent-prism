# Working with Scenarios

Scenarios let you test the same agent with different configurations and dependencies.

## What are Scenarios?

A scenario is a specific configuration of an agent with its dependencies. This is useful for:
- Testing with different API keys or endpoints
- Switching between development and production configs
- Testing with different customers or teams
- A/B testing different system prompts or configurations

## Single Scenario (Default)

If you export an agent without scenarios, it gets a default scenario:

```python
from agent_playbook import export
from .my_agent import agent

export(
    agent=agent,
    agent_name="My Agent",
    scenarios=[
        {
            "name": "Default",
            "settings": None,
        }
    ],
)
```

In the playground, you'll see:
- Agent selector: "My Agent"
- Scenario selector: "Default"

## Multiple Scenarios

Export the same agent with different configurations:

```python
from pydantic import BaseModel
from agent_playbook import export
from .my_agent import agent


class SupportConfig(BaseModel):
    api_key: str
    api_url: str


export(
    agent=agent,
    agent_name="Support Agent",
    scenarios=[
        {
            "name": "Development",
            "description": "Uses test API endpoints",
            "settings": SupportConfig(
                api_key="test-key-123",
                api_url="https://api-dev.example.com",
            ),
        },
        {
            "name": "Production",
            "description": "Uses production API endpoints",
            "settings": SupportConfig(
                api_key="prod-key-xyz",
                api_url="https://api.example.com",
            ),
        },
    ],
)
```

Now in the playground, you can switch between "Development" and "Production" to test with different configs.

## Using Dependency Injection

Scenarios work best with pydantic-ai's dependency injection system. Define a dependency class:

```python
from pydantic import BaseModel


class SupportDeps(BaseModel):
    company_name: str
    support_email: str
    api_key: str
```

Use the dependencies in your agent:

```python
from pydantic_ai import Agent

agent = Agent(
    model="openai:gpt-4",
    system_prompt="You are a support agent.",
    deps_type=SupportDeps,
)


@agent.tool
def create_ticket(issue: str) -> str:
    """Create a support ticket."""
    # You can access deps.api_key, deps.company_name, etc.
    return f"Ticket created for {deps.company_name}"
```

Then export with scenarios:

```python
from agent_playbook import export
from .support_agent import agent, SupportDeps

export(
    agent=agent,
    agent_name="Support Agent",
    scenarios=[
        {
            "name": "ACME Corp",
            "settings": SupportDeps(
                company_name="ACME Corporation",
                support_email="support@acme.com",
                api_key="acme-key-123",
            ),
        },
        {
            "name": "TechStart Inc",
            "settings": SupportDeps(
                company_name="TechStart Inc",
                support_email="help@techstart.io",
                api_key="techstart-key-456",
            ),
        },
    ],
)
```

### Accessing Dependencies in the Agent

When running in the playground, dependencies are injected into tool functions:

```python
@agent.tool
def check_status(order_id: str, deps: SupportDeps) -> str:
    """Check order status using company-specific API."""
    # deps.api_key, deps.company_name are available
    print(f"Checking for {deps.company_name}...")
    return "Order is ready"
```

## Complex Dependency Setup

For dependencies that need initialization logic (loading files, connecting to databases, etc.), use `init_dependencies_fn`:

```python
from agent_playbook import export


def create_deps(settings: dict) -> SupportDeps:
    """Initialize dependencies with custom logic."""
    # Load API credentials from config
    api_key = settings.get("api_key")

    # Could do validation, file loading, connections, etc.

    return SupportDeps(
        company_name=settings["company_name"],
        support_email=settings["support_email"],
        api_key=api_key,
    )


export(
    agent=agent,
    agent_name="Support Agent",
    scenarios=[
        {
            "name": "ACME Corp",
            "settings": {
                "company_name": "ACME Corporation",
                "support_email": "support@acme.com",
                "api_key": "acme-key-123",
            },
        },
    ],
    init_dependencies_fn=create_deps,
)
```

## Common Patterns

### Pattern: Customer-Specific Configurations

```python
from pydantic import BaseModel


class CustomerConfig(BaseModel):
    company_name: str
    api_key: str


customers = [
    {"company_name": "ACME Corp", "api_key": "key1"},
    {"company_name": "TechStart", "api_key": "key2"},
    {"company_name": "DataCorp", "api_key": "key3"},
]

scenarios = [
    {
        "name": customer["company_name"],
        "settings": CustomerConfig(**customer),
    }
    for customer in customers
]

export(agent=agent, agent_name="Support Agent", scenarios=scenarios)
```

### Pattern: Environment Configurations

```python
import os
from pydantic import BaseModel


class EnvConfig(BaseModel):
    api_url: str
    api_key: str


scenarios = [
    {
        "name": "Local",
        "description": "Development on localhost",
        "settings": EnvConfig(
            api_url="http://localhost:3000",
            api_key="dev-key",
        ),
    },
    {
        "name": "Staging",
        "description": "Staging environment",
        "settings": EnvConfig(
            api_url="https://staging-api.example.com",
            api_key=os.getenv("STAGING_API_KEY", ""),
        ),
    },
    {
        "name": "Production",
        "description": "Production environment",
        "settings": EnvConfig(
            api_url="https://api.example.com",
            api_key=os.getenv("PROD_API_KEY", ""),
        ),
    },
]

export(agent=agent, agent_name="My Agent", scenarios=scenarios)
```

## Next Steps

- **Using the playground?** See [Playground Guide](playground-guide.md)
- **Advanced patterns?** Check [Common Patterns](patterns.md)
