import os
from typing import Annotated

import uvicorn
from clantic import BaseCommand
from clantic.types import Argument, Flag, Option, OptionSettings
from pydantic import BaseModel


class StartCommandParams(BaseModel):
    package: Argument[str]

    host: Option[str] = "127.0.0.1"
    port: Option[int] = 8765
    root_path: Option[str] = ""
    workers: Annotated[int, OptionSettings(aliases=["-w"])] = 1
    reload: Flag = False

    dev: Annotated[int, OptionSettings(hidden=True, is_flag=True, default=False)] = (
        False
    )

    def to_env_vars(self) -> dict[str, str]:
        env = {}
        for k, v in self:
            if v:
                key = f"AGENT_PLAYBOOK_{k}".upper()
                env[key] = str(v)
        return env

    @classmethod
    def from_env_vars(cls) -> "StartCommandParams":
        fields = {}
        for field_name in cls.model_fields:
            key = f"AGENT_PLAYBOOK_{field_name}".upper()
            if key in os.environ:
                fields[field_name] = os.getenv(key)

        return cls(**fields)


class StartCommand(BaseCommand[StartCommandParams]):
    NAME = "start"

    def run(self) -> None:
        self._prep_env()
        uvicorn.run(
            "agent_playbook.server:app",
            host=self.params.host,
            port=self.params.port,
            root_path=self.params.root_path,
            reload=self.params.reload,
        )

    def _prep_env(self) -> None:
        os.environ.update(self.params.to_env_vars())


cli = StartCommand.to_command()

if __name__ == "__main__":
    cli()
