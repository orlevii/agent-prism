from dataclasses import dataclass
from typing import Any, Callable, Generic, TypeAlias, TypedDict, TypeVar

from pydantic import BaseModel
from pydantic_ai import Agent
from pydantic_ai.models import Model
from typing_extensions import NotRequired

StrDict: TypeAlias = dict[str, Any]
BaseSettingsType: TypeAlias = BaseModel | StrDict

TDeps = TypeVar("TDeps")
TResp = TypeVar("TResp")
TSettings = TypeVar("TSettings", bound=BaseSettingsType)


class Scenario(TypedDict, Generic[TSettings]):
    name: str
    settings: NotRequired[TSettings]


@dataclass
class ExportedAgent(Generic[TDeps, TResp, TSettings]):
    agent: Agent[TDeps, TResp]
    scenarios: list[Scenario[TSettings]]
    agent_name: str
    model: Model | None
    init_dependencies_fn: Callable[[TSettings], TDeps]


GenericExportedAgent: TypeAlias = ExportedAgent[Any, Any, BaseSettingsType]
