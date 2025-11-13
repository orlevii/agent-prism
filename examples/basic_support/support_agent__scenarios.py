from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider

from agent_playbook import export

from .support_agent import SupportDeps, support_agent

ollama_qwen3 = OpenAIChatModel(
    model_name="qwen3:30b",
    provider=OllamaProvider(base_url="http://localhost:11434/v1"),
)

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

export(
    agent=support_agent,
    agent_name="support_agent_ollama",
    model=ollama_qwen3,
    scenarios=[
        {
            "name": "ACME Local",
            "settings": SupportDeps(
                company_name="ACME Local",
                support_email="support@acmelocal.com",
            ),
        },
    ],
)
