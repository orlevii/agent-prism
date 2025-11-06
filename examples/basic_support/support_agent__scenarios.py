from agent_playbook import export

from .support_agent import SupportDeps, support_agent

# Export the agent with settings configurations
# Each configuration appears as a separate option in the Agent Playbook UI
export(
    agent=support_agent,
    scenarios=[
        {
            "name": "ACME Corporation",
            "settings": SupportDeps(
                company_name="ACME Corporation", support_email="support@acme.com"
            ),
        },
    ],
)
