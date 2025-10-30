from typing import Any, Generic, TypedDict, TypeVar

from pydantic_ai import Agent

from .agents import agent_loader

TDeps = TypeVar("TDeps")
TResp = TypeVar("TResp")


class DependenciesDict(TypedDict, Generic[TDeps]):
    name: str
    dependency: TDeps


def export_agent(
    agent: Agent[TDeps, TResp],
    dependencies: list[DependenciesDict[TDeps]],
    agent_name: str | None = None,
) -> None:
    name = agent_name or agent.name or "unknown_agent"

    dependency_data: dict[str, dict[str, Any]] = {}
    for dep in dependencies:
        dep_obj = dep["dependency"]
        if hasattr(dep_obj, "model_dump"):
            dependency_data[dep["name"]] = dep_obj.model_dump()
        else:
            dependency_data[dep["name"]] = {}

    agent_loader.register_agent(
        agent_name=name, agent=agent, module_name="", dependency_data=dependency_data
    )
