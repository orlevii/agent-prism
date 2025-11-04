import inspect
from typing import Any, Generic, TypedDict, TypeVar

from pydantic_ai import Agent

from .agent_loader import agent_loader

TDeps = TypeVar("TDeps")
TResp = TypeVar("TResp")


class Scenario(TypedDict, Generic[TDeps]):
    name: str
    dependency: TDeps


def export(
    agent: Agent[TDeps, TResp],
    scenarios: list[Scenario[TDeps]],
    agent_name: str | None = None,
) -> None:
    name = agent_name or agent.name or _get_fallback_agent_name()

    dependency_data: dict[str, dict[str, Any]] = {}
    for dep in scenarios:
        dep_obj = dep["dependency"]
        if hasattr(dep_obj, "model_dump"):
            dependency_data[dep["name"]] = dep_obj.model_dump()
        else:
            dependency_data[dep["name"]] = {}

    agent_loader.register_agent(
        agent_name=name, agent=agent, module_name="", dependency_data=dependency_data
    )


def _get_fallback_agent_name() -> str:
    for frame in inspect.stack():
        if frame.filename.lower().endswith("__scenarios.py"):
            caller_module = inspect.getmodule(frame[0])
            module_name = getattr(caller_module, "__name__", "unknown_module")
            _, _, moduel_name = module_name.rpartition(".")
            return moduel_name.removesuffix("__scenarios")
    return "Unkown Agent"
