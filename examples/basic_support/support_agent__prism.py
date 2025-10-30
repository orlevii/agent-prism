from agent_prism.export import export_agent

from .support_agent import SupportDeps, support_agent

# Export the agent with dependency configurations
# Each configuration appears as a separate option in the Agent Prism UI
export_agent(
    agent=support_agent,
    dependencies=[
        {
            "name": "ACME Corporation",
            "dependency": SupportDeps(
                company_name="ACME Corporation", support_email="support@acme.com"
            ),
        },
    ],
)
