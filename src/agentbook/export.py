from typing import Generic, TypedDict, TypeVar

from pydantic_ai import Agent

from .agents import agent_loader

TDeps = TypeVar("TDeps")
TResp = TypeVar("TResp")


class DependenciesDict(TypedDict, Generic[TDeps]):
    name: str
    dependency: TDeps


def export_agent(
    agent: Agent[TDeps, TResp],
    dependenies: list[DependenciesDict[TDeps]],
    agent_name: str | None = None,
) -> None:
    name = agent_name or agent.name or "unkown_agent"
    agent_loader.register_agent(agent_name=name, agent=agent, module_name="")
