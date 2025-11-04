import inspect
from typing import Callable, TypeVar

from pydantic import BaseModel
from pydantic_ai import Agent

from agent_playbook.export_types import ExportedAgent, Scenario

from .agent_loader import agent_loader

TDeps = TypeVar("TDeps")
TResp = TypeVar("TResp")
TSettings = TypeVar("TSettings", bound=BaseModel)


def export(
    *,
    agent: Agent[TDeps, TResp],
    scenarios: list[Scenario[TSettings]],
    agent_name: str | None = None,
    init_dependencies_fn: Callable[[TSettings], TDeps],
) -> None:
    name = agent_name or agent.name or _get_fallback_agent_name()

    exported_agent = ExportedAgent(
        agent=agent,
        scenarios=scenarios,
        agent_name=name,
        init_dependencies_fn=init_dependencies_fn,
    )

    agent_loader.register_agent(exported_agent=exported_agent)


def _get_fallback_agent_name() -> str:
    for frame in inspect.stack():
        if frame.filename.lower().endswith("__scenarios.py"):
            caller_module = inspect.getmodule(frame[0])
            module_name = getattr(caller_module, "__name__", "unknown_module")
            _, _, module_part = module_name.rpartition(".")
            return module_part.removesuffix("__scenarios")
    return "Unknown Agent"
