# Working with Scenarios

Scenarios let you test the same agent with different configurations and dependencies. This is essential for agents that need to work with different users, environments, or settings.

## Example: Personal Assistant Agent

Let's say you have a personal assistant agent that books meetings and leaves messages. The agent needs to know who it's assisting to personalize responses and access their preferences.

### Define Your Dependencies

First, create a model for the user information your agent needs:

```python
from pydantic import BaseModel


class UserInfo(BaseModel):
    name: str
    email: str
    timezone: str
    preferences: str
```

### Export with Multiple Scenarios

Now export your agent with different scenarios for different users:

```python
from agent_playbook import export

export(
    agent=assistant,
    agent_name="Personal Assistant",
    scenarios=[
        {
            "name": "Alice (CEO)",
            "description": "Executive assistant for Alice",
            "settings": UserInfo(
                name="Alice Chen",
                email="alice@company.com",
                timezone="America/New_York",
                preferences="Prefers morning meetings, keep responses brief",
            ),
        },
        {
            "name": "Bob (Engineer)",
            "description": "Assistant for Bob the engineer",
            "settings": UserInfo(
                name="Bob Smith",
                email="bob@company.com",
                timezone="America/Los_Angeles",
                preferences="No meetings before 10am, prefers afternoon focus time",
            ),
        },
        {
            "name": "Carol (Sales)",
            "description": "Sales assistant for Carol",
            "settings": UserInfo(
                name="Carol Johnson",
                email="carol@company.com",
                timezone="Europe/London",
                preferences="Works across timezones, prefers quick responses",
            ),
        },
    ],
)
```

Save this as `personal_assistant__scenarios.py` in your project.
