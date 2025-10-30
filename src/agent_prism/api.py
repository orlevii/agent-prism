from dataclasses import replace
from typing import Any, AsyncIterator, Callable, Literal

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pydantic_ai import (
    AgentRunResultEvent,
    ApprovalRequired,
    FunctionToolCallEvent,
    FunctionToolResultEvent,
    FunctionToolset,
    PartDeltaEvent,
    PartStartEvent,
    RunContext,
    TextPartDelta,
    ThinkingPartDelta,
)
from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    TextPart,
    ToolCallPart,
    ToolReturnPart,
    UserPromptPart,
)
from pydantic_ai.tools import ToolFuncEither

from .agents import agent_loader
from .types import (
    DoneEvent,
    ErrorEvent,
    StreamEventType,
    TextDeltaEvent,
    ThinkingDeltaEvent,
    ToolCallExecutingEvent,
    ToolResultEvent,
)

api_router = APIRouter(prefix="/api")


class DependencyInfo(BaseModel):
    name: str
    data: dict[str, Any]


class AgentInfo(BaseModel):
    name: str
    dependencies: list[DependencyInfo]


class GetAgentsResponse(BaseModel):
    agents: list[AgentInfo]


@api_router.get("/agents")
async def get_agents() -> GetAgentsResponse:
    agents = []
    for agent_name in agent_loader._agents:
        dependency_data = agent_loader.get_agent_dependency_data(agent_name)
        dependencies = [
            DependencyInfo(name=dep_name, data=dep_data)
            for dep_name, dep_data in dependency_data.items()
        ]
        agents.append(AgentInfo(name=agent_name, dependencies=dependencies))
    return GetAgentsResponse(agents=agents)


class ChatRequest(BaseModel):
    agent: str
    messages: list[dict[str, Any]]
    dependencies: dict[str, Any] = {}
    use_tools: Literal["auto", "request_approval"] = "auto"


def build_message_history(
    conversation_history: list[dict[str, Any]],
) -> list[ModelMessage]:
    messages: list[ModelMessage] = []

    for msg in conversation_history:
        role = msg.get("role")
        content = msg.get("content", "")

        if role == "user":
            messages.append(ModelRequest(parts=[UserPromptPart(content=content)]))
        elif role == "assistant":
            parts: list[TextPart | ToolCallPart] = []
            if content:
                parts.append(TextPart(content=content))

            tool_calls = msg.get("tool_calls", [])
            for tc in tool_calls:
                tool_call_id = tc.get("tool_call_id", "")
                tool_name = tc.get("tool_name", "")
                args = tc.get("arguments", {})
                parts.append(
                    ToolCallPart(
                        tool_name=tool_name, args=args, tool_call_id=tool_call_id
                    )
                )

            if parts:
                messages.append(ModelResponse(parts=parts))
        elif role == "tool":
            tool_call_id = msg.get("tool_call_id", "")
            result = msg.get("result")
            messages.append(
                ModelRequest(
                    parts=[ToolReturnPart(tool_name=tool_call_id, content=result)]
                )
            )

    return messages


def _wrap_for_approval(fn: Callable[..., Any]) -> ToolFuncEither[Any]:
    def decorator(ctx: RunContext[Any], **kwargs: Any) -> Any:
        if not ctx.tool_call_approved:
            raise ApprovalRequired
        return fn(ctx, **kwargs)

    return decorator


async def stream_agent_events(
    agent_name: str,
    message: str,
    message_history: list[ModelMessage],
    dependencies: dict[str, Any],
    use_tools: Literal["auto", "request_approval"],
) -> AsyncIterator[StreamEventType]:
    agent = agent_loader.get_agent_by_name(agent_name)
    toolsets = agent.toolsets
    if use_tools == "request_approval":
        toolsets = []
        for ts in toolsets:
            assert isinstance(ts, FunctionToolset)
            new_ts = FunctionToolset()
            for tool in ts.tools.values():
                new_tool = replace(tool)
                new_tool.function = _wrap_for_approval(tool.function)
                new_ts.add_tool(new_tool)
            toolsets.append(new_ts)

    with agent.override(toolsets=toolsets):
        try:
            async for event in agent.run_stream_events(
                message,
                message_history=message_history,
                deps=agent.deps_type(**dependencies),
            ):
                if isinstance(event, PartStartEvent):
                    if isinstance(event.part, TextPart):
                        yield TextDeltaEvent(delta=event.part.content)
                elif isinstance(event, PartDeltaEvent):
                    if isinstance(event.delta, TextPartDelta):
                        yield TextDeltaEvent(delta=event.delta.content_delta)
                    elif isinstance(event.delta, ThinkingPartDelta):
                        yield ThinkingDeltaEvent(delta=str(event.delta.content_delta))
                elif isinstance(event, FunctionToolCallEvent):
                    yield ToolCallExecutingEvent(
                        tool_call_id=event.part.tool_call_id,
                        tool_name=event.part.tool_name,
                        arguments=event.part.args_as_dict(),
                    )
                elif isinstance(event, FunctionToolResultEvent):
                    yield ToolResultEvent(
                        tool_call_id=event.tool_call_id,
                        result=event.result.content,
                    )
                elif isinstance(event, AgentRunResultEvent):
                    yield DoneEvent(status="complete")
        except Exception as e:
            yield ErrorEvent(error=str(e))
            yield DoneEvent(status="complete")


@api_router.post("/chat")
async def chat(req: ChatRequest) -> StreamingResponse:
    # Extract the last user message and build conversation history
    if not req.messages:
        raise ValueError("No messages provided")

    # Get all messages except the last one as conversation history
    conversation_history = req.messages[:-1] if len(req.messages) > 1 else []
    message_history = build_message_history(conversation_history)

    # Get the last message content as the current message
    last_message = req.messages[-1]
    current_message = last_message.get("content", "")

    async def stream() -> AsyncIterator[bytes]:
        if req.use_tools == "request_approval":
            # TODO: monkey patch ALL agent tools so they all raise ApprovalRequired
            pass

        async for event in stream_agent_events(
            agent_name=req.agent,
            message=current_message,
            message_history=message_history,
            dependencies=req.dependencies,
            use_tools=req.use_tools,
        ):
            yield f"{event.model_dump_json()}\n".encode()

    return StreamingResponse(content=stream(), media_type="application/x-ndjson")
