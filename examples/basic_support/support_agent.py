"""Basic Customer Support Agent Example

This example demonstrates a minimal customer support agent with:
- Simple tool definitions
- Dependency injection for configuration
- Context-aware system prompts
"""

import os
from uuid import uuid4

from pydantic import BaseModel
from pydantic_ai import Agent, DeferredToolRequests, RunContext

# So the code doesn't fail
os.environ.setdefault("OPENAI_API_KEY", "sk-abc")


class SupportDeps(BaseModel):
    """Dependencies for the support agent.

    This allows you to configure the agent's behavior and context
    without changing the agent code itself.
    """

    company_name: str
    support_email: str


# Create the agent with OpenAI's GPT-4 model
support_agent = Agent(
    model="openai:gpt-5-mini",
    deps_type=SupportDeps,
    output_type=str | DeferredToolRequests
)


@support_agent.system_prompt
async def support_system_prompt(ctx: RunContext[SupportDeps]) -> str:
    return f"""You are a helpful and friendly customer support agent for {ctx.deps.company_name}.

Your role is to:
- Answer customer questions professionally
- Help check order statuses
- Create support tickets when needed
- Provide helpful information about our services

Always maintain a positive and helpful tone. If you need to escalate an issue,
use the create_ticket tool and provide the customer with the support email: {ctx.deps.support_email}
"""


@support_agent.tool
async def check_order_status(ctx: RunContext[SupportDeps], order_id: str) -> str:
    """Check the status of a customer order.

    Args:
        ctx: The context containing dependencies
        order_id: The unique order identifier

    Returns:
        Current status of the order
    """
    # In a real implementation, this would query a database or API
    return f"Order {order_id} is currently being processed and will ship within 2-3 business days. You'll receive a tracking number at your registered email once it ships."


@support_agent.tool
async def create_ticket(
    ctx: RunContext[SupportDeps], issue_description: str, priority: str = "normal"
) -> str:
    """Create a support ticket for an issue that needs escalation.

    Args:
        ctx: The context containing dependencies
        issue_description: Description of the customer's issue
        priority: Priority level (low, normal, high)

    Returns:
        Confirmation message with ticket details
    """
    # In a real implementation, this would create a ticket in your system
    ticket_id = uuid4().hex
    return f"""Support ticket created successfully!

Ticket ID: {ticket_id}
Priority: {priority}
Status: Open

Our support team will review your issue and respond to {ctx.deps.support_email} within 24 hours.
Thank you for your patience!"""
