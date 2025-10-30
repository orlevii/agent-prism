from typing import Any, Literal

from pydantic import BaseModel
from pydantic_ai import CallDeferred, RunContext, ToolsetTool, WrapperToolset


class TextDeltaEvent(BaseModel):
    type: Literal["text_delta"] = "text_delta"
    delta: str


class ThinkingDeltaEvent(BaseModel):
    type: Literal["thinking_delta"] = "thinking_delta"
    delta: str


class ToolCallExecutingEvent(BaseModel):
    type: Literal["tool_call_executing"] = "tool_call_executing"
    tool_call_id: str
    tool_name: str
    arguments: dict[str, Any]


class ToolResultEvent(BaseModel):
    type: Literal["tool_result"] = "tool_result"
    tool_call_id: str
    result: Any


class ErrorEvent(BaseModel):
    type: Literal["error"] = "error"
    error: str


class DoneEvent(BaseModel):
    type: Literal["done"] = "done"
    status: Literal["complete", "pending_approval"]


StreamEventType = (
    TextDeltaEvent
    | ThinkingDeltaEvent
    | ToolCallExecutingEvent
    | ToolResultEvent
    | ErrorEvent
    | DoneEvent
)


class ApprovalToolset(WrapperToolset):
    async def call_tool(
        self,
        name: str,
        tool_args: dict[str, Any],
        ctx: RunContext[Any],
        tool: ToolsetTool,
    ) -> Any:
        raise CallDeferred
