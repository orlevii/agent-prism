import importlib
import logging
import os
import pkgutil
import sys
import types
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from pydantic_ai import Agent

logger = logging.getLogger(__name__)


@contextmanager
def _temp_sys_path_addition(path: str) -> Iterator[None]:
    sys.path.insert(0, path)
    try:
        yield
    finally:
        sys.path.remove(path)


class _AgentLoader:
    def __init__(self) -> None:
        self._agents: dict[str, Agent[Any, Any]] = {}
        self._dependencies: dict[str, list[str]] = {}
        self._dependency_data: dict[str, dict[str, dict[str, Any]]] = {}

    def _import_package_with_fallback(self, package: str) -> types.ModuleType:
        try:
            return importlib.import_module(package)
        except ImportError as e:
            cwd = Path.cwd()
            package_path = cwd / package.replace(".", os.sep)

            if package_path.exists() and package_path.is_dir():
                logger.info(
                    f"Package '{package}' not found in sys.path, "
                    f"adding current directory to sys.path: {cwd}"
                )
                with _temp_sys_path_addition(str(cwd)):
                    try:
                        return importlib.import_module(package)
                    except ImportError as import_error:
                        logger.error(
                            f"Failed to import package '{package}' even after adding CWD: {import_error}"
                        )
                        raise
            else:
                logger.error(f"Failed to import package '{package}': {e}")
                raise

    def _discover_modules(
        self, pkg: types.ModuleType, package: str
    ) -> list[types.ModuleType]:
        modules: list[types.ModuleType] = []
        for module_info in pkgutil.walk_packages(pkg.__path__, prefix=f"{package}."):
            module_name = module_info.name
            # Only import modules with __prism suffix
            if not module_name.endswith("__prism"):
                continue
            try:
                module = importlib.import_module(module_name)
                modules.append(module)
            except Exception as e:
                logger.warning(f"Failed to import module '{module_name}': {e}")
        return modules

    def register_agent(
        self,
        agent_name: str,
        agent: Agent[Any, Any],
        module_name: str,
        dependencies: list[str] | None = None,
        dependency_data: dict[str, dict[str, Any]] | None = None,
    ) -> None:
        if agent_name in self._agents:
            logger.warning(
                f"Duplicate agent name '{agent_name}' found in module '{module_name}'. "
                f"Overwriting previous agent."
            )
        self._agents[agent_name] = agent

        if dependency_data:
            self._dependency_data[agent_name] = dependency_data
            self._dependencies[agent_name] = list(dependency_data.keys())
        else:
            self._dependencies[agent_name] = dependencies or []
            self._dependency_data[agent_name] = {}

        logger.info(f"Loaded agent '{agent_name}' from {module_name}")

    def load(self, package: str) -> None:
        pkg = self._import_package_with_fallback(package)

        if not hasattr(pkg, "__path__"):
            logger.warning(f"'{package}' is not a package, skipping")
            return

        self._discover_modules(pkg, package)

    def get_agent_by_name(self, agent_name: str) -> Agent[Any, Any]:
        return self._agents[agent_name]

    def get_agent_dependencies(self, agent_name: str) -> list[str]:
        return self._dependencies.get(agent_name, [])

    def get_agent_dependency_data(self, agent_name: str) -> dict[str, dict[str, Any]]:
        return self._dependency_data.get(agent_name, {})


agent_loader = _AgentLoader()
