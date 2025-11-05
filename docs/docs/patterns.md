# Common Patterns

Real-world patterns for using Agent Playbook effectively.

## Pattern 1: Multi-Tenant Testing

Test the same agent with different customer configurations:

```python
from agent_playbook import export

customers = [
    {"id": 1, "name": "ACME Corp", "api_key": "key1", "plan": "pro"},
    {"id": 2, "name": "TechStart", "api_key": "key2", "plan": "basic"},
    {"id": 3, "name": "DataCorp", "api_key": "key3", "plan": "pro"},
]

scenarios = [
    {
        "name": f"{c['name']} ({c['plan'].upper()})",
        "description": f"Customer ID: {c['id']}",
        "dependencies": c,
    }
    for c in customers
]

export(
    agent,
    name="Support Agent",
    scenarios=scenarios,
)
```

**Benefits:**
- Test agent behavior for different customer tiers
- Quickly switch between customers
- Debug customer-specific issues

## Pattern 2: Environment Progression

Test across dev → staging → production:

```python
import os

environments = {
    "Local": {
        "api_url": "http://localhost:3000",
        "api_key": "dev-key-123",
        "log_level": "debug",
    },
    "Staging": {
        "api_url": "https://staging.example.com",
        "api_key": os.getenv("STAGING_KEY", ""),
        "log_level": "info",
    },
    "Production": {
        "api_url": "https://api.example.com",
        "api_key": os.getenv("PROD_KEY", ""),
        "log_level": "warn",
    },
}

scenarios = [
    {
        "name": env_name,
        "description": f"Testing against {env_name}",
        "dependencies": config,
    }
    for env_name, config in environments.items()
]

export(agent, name="My Agent", scenarios=scenarios)
```

**Benefits:**
- Test without restarting
- Compare behavior across environments
- Catch environment-specific issues early

## Pattern 3: Tool Mocking for Development

Develop and test without external dependencies:

```python
# In your tool definition
@agent.tool
def check_payment_status(transaction_id: str, deps: MyDeps) -> str:
    """Check payment status."""
    if deps.mock_mode:
        # Return mock data when in development
        return "Payment successful (mocked)"

    # Real API call
    return deps.payment_service.check_status(transaction_id)
```

Export with mock scenarios:

```python
scenarios = [
    {
        "name": "Mock Mode",
        "dependencies": {
            "mock_mode": True,
            "payment_service": None,
        }
    },
    {
        "name": "Real API",
        "dependencies": {
            "mock_mode": False,
            "payment_service": ProductionPaymentService(),
        }
    },
]

export(agent, name="Payment Agent", scenarios=scenarios)
```

**Benefits:**
- Fast iteration without API calls
- Test edge cases easily
- Reduce API costs during development

## Pattern 4: Feature Flags

A/B test different agent behaviors:

```python
scenarios = [
    {
        "name": "Control (v1)",
        "description": "Original behavior",
        "dependencies": {
            "new_recommendation_engine": False,
            "extended_context": False,
        }
    },
    {
        "name": "Test (v2)",
        "description": "New recommendation engine",
        "dependencies": {
            "new_recommendation_engine": True,
            "extended_context": True,
        }
    },
]

@agent.tool
def get_recommendations(query: str, deps: MyDeps) -> str:
    if deps.new_recommendation_engine:
        return get_new_recommendations(query)
    else:
        return get_old_recommendations(query)

export(agent, name="Recommender Agent", scenarios=scenarios)
```

**Benefits:**
- Compare different implementations side-by-side
- Test new features before production
- Easy rollback (just switch scenarios)

## Pattern 5: Parameterized Scenarios

Generate scenarios dynamically based on configuration files:

```python
import yaml

# Load from config file
with open("agent_scenarios.yaml") as f:
    config = yaml.safe_load(f)

scenarios = [
    {
        "name": s["name"],
        "description": s.get("description"),
        "dependencies": s["config"],
    }
    for s in config["scenarios"]
]

export(agent, name=config["agent_name"], scenarios=scenarios)
```

`agent_scenarios.yaml`:
```yaml
agent_name: "Support Agent"
scenarios:
  - name: "ACME Corp"
    config:
      company_name: "ACME"
      api_key: "key1"
      support_email: "support@acme.com"

  - name: "TechStart"
    config:
      company_name: "TechStart"
      api_key: "key2"
      support_email: "help@techstart.io"
```

**Benefits:**
- Manage scenarios in version-controlled config files
- Non-technical users can adjust scenarios
- Separate code from configuration

## Pattern 6: Conditional Tool Registration

Register different tools for different scenarios:

```python
# Note: Tools must be registered at agent creation time,
# but you can condition behavior within tools

from pydantic_ai import Agent

agent = Agent(
    model="openai:gpt-4",
    deps_type=MyDeps,
)

@agent.tool
def external_api_call(query: str, deps: MyDeps) -> str:
    """Call external API based on scenario."""
    if not deps.enable_external_api:
        return "External API disabled in this scenario"

    # Call the API
    return call_external_api(query)

scenarios = [
    {"name": "Sandbox", "dependencies": {"enable_external_api": False}},
    {"name": "Live", "dependencies": {"enable_external_api": True}},
]
```

**Benefits:**
- Single agent definition
- Behavior changes per scenario
- Safe testing without side effects

## Pattern 7: Testing Different Models

Test agent with different LLM providers:

```python
# Note: Agent model is fixed at creation, so you need separate agents

from pydantic_ai import Agent

# Fast model
fast_agent = Agent(model="openai:gpt-4o-mini")

# Quality model
quality_agent = Agent(model="openai:gpt-4")

# Cost-effective model
budget_agent = Agent(model="anthropic:claude-3-5-haiku-20241022")

export(fast_agent, name="Fast Response", scenarios=[{"name": "Default"}])
export(quality_agent, name="Quality Response", scenarios=[{"name": "Default"}])
export(budget_agent, name="Budget Response", scenarios=[{"name": "Default"}])
```

Then in the playground, you can select different agents to compare responses.

**Benefits:**
- Compare quality vs. speed vs. cost
- Choose best model for your use case
- Test model updates easily

## Debugging Tips

### 1. Use Message Editing

Edit past messages to explore different conversation branches:
- Click edit on any message
- Change the content
- Agent continues from that point
- Great for testing recovery scenarios

### 2. Check Tool Arguments

Expand tool calls to see exactly what parameters were sent:
- Verify your tool parameters match expectations
- Debug parameter formatting issues
- Understand agent decision-making

### 3. Review Thinking

Click "Show Thinking" to see agent's reasoning:
- Understand why agent chose a tool
- Spot reasoning errors
- Verify system prompt is being used

### 4. Use Mock Results

For tools that fail, mock a result to continue testing:
- Click "Mock" on a tool call
- Enter what you expect the result should be
- Agent continues with your mocked data

## Next Steps

- **Need CLI options?** See [CLI Reference](cli-reference.md)
- **Learning scenarios?** Check [Working with Scenarios](scenarios.md)
- **Want more UI features?** See [Playground Guide](playground-guide.md)
