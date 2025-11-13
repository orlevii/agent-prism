from dataclasses import asdict, replace
from datetime import datetime
from typing import Any, AsyncIterator, Callable, Literal

import dacite
from dacite import from_dict
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pydantic_ai import (
    AgentRunResultEvent,
    ApprovalRequired,
    DeferredToolRequests,
    FunctionToolCallEvent,
    FunctionToolResultEvent,
    FunctionToolset,
    PartDeltaEvent,
    PartStartEvent,
    RunContext,
    TextPartDelta,
    ThinkingPartDelta,
    Tool,
)
from pydantic_ai import DeferredToolResults as PydanticDeferredToolResults
from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    TextPart,
)
from pydantic_ai.tools import ToolFuncEither

from .agent_loader import agent_loader
from .types import (
    DeferredToolResults,
    DoneEvent,
    ErrorEvent,
    MessageHistoryEvent,
    StreamEventType,
    TextDeltaEvent,
    ThinkingDeltaEvent,
    ToolApprovalRequestEvent,
    ToolCallExecutingEvent,
    ToolResultEvent,
)

api_router = APIRouter(prefix="/api")


class SettingsInfo(BaseModel):
    name: str
    data: dict[str, Any]


class AgentInfo(BaseModel):
    name: str
    settings: list[SettingsInfo]


class GetAgentsResponse(BaseModel):
    agents: list[AgentInfo]


@api_router.get("/agents")
async def get_agents() -> GetAgentsResponse:
    agents = []
    for exported_agent in agent_loader._agents.values():
        settings_list = []
        for scenario in exported_agent.scenarios:
            settings_obj: Any = scenario.get("settings", {})
            if isinstance(settings_obj, dict):
                settings_data = settings_obj
            elif isinstance(settings_obj, BaseModel):
                settings_data = settings_obj.model_dump()
            else:
                raise RuntimeError(
                    f"Settings type is not supported: {settings_obj.__class__.__name__}"
                )
            settings_list.append(
                SettingsInfo(name=scenario["name"], data=settings_data)
            )
        agents.append(AgentInfo(name=exported_agent.agent_name, settings=settings_list))
    return GetAgentsResponse(agents=agents)


class ChatRequest(BaseModel):
    agent: str
    messages: list[dict[str, Any]]
    settings: dict[str, Any] = {}
    use_tools: Literal["auto", "request_approval"] = "auto"
    deferred_tool_results: DeferredToolResults | None = None


def build_message_history(
    conversation_history: list[dict[str, Any]],
) -> list[ModelMessage]:
    messages: list[ModelMessage] = []
    dacite_config = dacite.Config(
        type_hooks={
            datetime: lambda s: datetime.fromisoformat(s.replace("Z", "+00:00"))
        }
    )
    for msg in conversation_history:
        kind = msg.get("kind")
        if kind == "request":
            messages.append(
                from_dict(data_class=ModelRequest, data=msg, config=dacite_config)
            )
        elif kind == "response":
            messages.append(
                from_dict(data_class=ModelResponse, data=msg, config=dacite_config)
            )
        else:
            raise RuntimeError(f"Unkown kind={kind}")

    return messages


def _tool_for_approval(tool: Tool[Any]) -> Tool[Any]:
    new_tool = replace(tool)
    new_tool.function_schema = replace(new_tool.function_schema)
    new_tool.function = _wrap_for_approval(new_tool.function, new_tool.takes_ctx)
    new_tool.function_schema.function = new_tool.function
    new_tool.takes_ctx = True
    new_tool.function_schema.takes_ctx = True

    return new_tool


def _wrap_for_approval(fn: Callable[..., Any], takes_ctx: bool) -> ToolFuncEither:
    def decorator(ctx: RunContext[Any], **kwargs: Any) -> Any:
        if not ctx.tool_call_approved:
            raise ApprovalRequired
        if takes_ctx:
            return fn(ctx, **kwargs)
        return fn(**kwargs)

    return decorator


async def stream_agent_events(
    agent_name: str,
    user_prompt: str | None,
    message_history: list[ModelMessage],
    settings: dict[str, Any],
    use_tools: Literal["auto", "request_approval"],
    deferred_tool_results: DeferredToolResults | None = None,
) -> AsyncIterator[StreamEventType]:
    exported_agent = agent_loader.get(agent_name)
    agent = exported_agent.agent
    toolsets = agent.toolsets
    if use_tools == "request_approval":
        toolsets = []
        for ts in agent.toolsets:
            assert isinstance(ts, FunctionToolset)
            new_ts = FunctionToolset()
            for tool in ts.tools.values():
                new_tool = _tool_for_approval(tool)

                new_ts.add_tool(new_tool)
            toolsets.append(new_ts)

    # Convert deferred tool results if provided
    pydantic_deferred_results: PydanticDeferredToolResults | None = None
    if deferred_tool_results:
        pydantic_deferred_results = PydanticDeferredToolResults()
        for tool_id, approved in deferred_tool_results.approvals.items():
            if tool_id in deferred_tool_results.calls:
                # Mock: provide the mock value
                pydantic_deferred_results.approvals[tool_id] = (
                    deferred_tool_results.calls[tool_id]
                )
            else:
                # Approve/Reject: use boolean
                pydantic_deferred_results.approvals[tool_id] = approved

    # Initialize dependencies using the settings and init_dependencies_fn
    if exported_agent.scenarios:
        settings_type = type(exported_agent.scenarios[0].get("settings") or {})
        settings_obj = settings_type(**settings)
        deps = exported_agent.init_dependencies_fn(settings_obj)
    else:
        deps = agent.deps_type(**settings)

    with agent.override(tools=[], toolsets=toolsets):
        try:
            async for event in agent.run_stream_events(
                user_prompt,
                message_history=message_history,
                deps=deps,
                model=exported_agent.model,
                deferred_tool_results=pydantic_deferred_results,
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
                    yield MessageHistoryEvent(
                        message_history=[asdict(m) for m in event.result.all_messages()]
                    )
                    agent_output = event.result.output
                    if isinstance(agent_output, DeferredToolRequests):
                        # Yield approval request for each deferred tool
                        for tool_call in agent_output.approvals:
                            yield ToolApprovalRequestEvent(
                                tool_call_id=tool_call.tool_call_id,
                                tool_name=tool_call.tool_name,
                                arguments=tool_call.args_as_dict(),
                            )
                        yield DoneEvent(status="pending_approval")
                    else:
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
    message_history = build_message_history(req.messages)
    user_prompt: str | None = None
    last_message = message_history[-1]
    if (
        last_message.kind == "request"
        and last_message.parts[0].part_kind == "user-prompt"
    ):
        message_history.pop()
        user_prompt = str(last_message.parts[0].content)

    # Get the last message content as the current message

    async def stream() -> AsyncIterator[bytes]:
        async for event in stream_agent_events(
            agent_name=req.agent,
            user_prompt=user_prompt,
            message_history=message_history,
            settings=req.settings,
            use_tools=req.use_tools,
            deferred_tool_results=req.deferred_tool_results,
        ):
            yield f"{event.model_dump_json()}\n".encode()

    return StreamingResponse(content=stream(), media_type="application/x-ndjson")
