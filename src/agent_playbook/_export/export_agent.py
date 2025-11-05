import inspect
from typing import Any, Callable, cast, overload

from pydantic_ai import Agent

from agent_playbook.agent_loader import agent_loader

from .export_types import (
    ExportedAgent,
    GenericExportedAgent,
    Scenario,
    TDeps,
    TResp,
    TSettings,
)


def _identity(settings: Any) -> Any:
    return settings


@overload
def export(
    *,
    agent: Agent[TSettings, TResp],
    scenarios: list[Scenario[TSettings]],
    agent_name: str | None = None,
) -> None:
    pass


@overload
def export(
    *,
    agent: Agent[TDeps, TResp],
    scenarios: list[Scenario[TSettings]],
    agent_name: str | None = None,
    init_dependencies_fn: Callable[[TSettings], TDeps],
) -> None:
    pass


def export(
    *,
    agent: Agent[TDeps, TResp],
    scenarios: list[Scenario[TSettings]],
    agent_name: str | None = None,
    init_dependencies_fn: Callable[[TSettings], TDeps] = _identity,
) -> None:
    name = agent_name or agent.name or _get_fallback_agent_name()

    exported_agent = ExportedAgent(
        agent=agent,
        scenarios=scenarios,
        agent_name=name,
        init_dependencies_fn=init_dependencies_fn,
    )

    agent_loader.register_agent(
        exported_agent=cast("GenericExportedAgent", exported_agent)
    )


def _get_fallback_agent_name() -> str:
    for frame in inspect.stack():
        if frame.filename.lower().endswith("__scenarios.py"):
            caller_module = inspect.getmodule(frame[0])
            module_name = getattr(caller_module, "__name__", "unknown_module")
            _, _, module_part = module_name.rpartition(".")
            return module_part.removesuffix("__scenarios")
    return "Unknown Agent"
