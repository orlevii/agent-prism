import os
from typing import Annotated

import uvicorn
from pydantic import BaseModel
from swiftcli import BaseCommand
from swiftcli.types import Argument, Flag, Option, OptionSettings


class StartCommandParams(BaseModel):
    package: Argument[str]

    host: Option[str] = "0.0.0.0"
    port: Option[int] = 8765
    root_path: Option[str] = ""
    workers: Annotated[int, OptionSettings(aliases=["-w"])] = 1
    reload: Flag = False

    dev: Annotated[int, OptionSettings(hidden=True, is_flag=True, default=False)] = (
        False
    )


class StartCommand(BaseCommand[StartCommandParams]):
    NAME = "start"

    def run(self) -> None:
        self._prep_env()
        uvicorn.run(
            "agent_prism.server:app",
            host=self.params.host,
            port=self.params.port,
            root_path=self.params.root_path,
            reload=self.params.reload,
        )

    def _prep_env(self) -> None:
        for k, v in self.params:
            if v:
                key = f"AGENT_PRISM_{k}".upper()
                os.environ[key] = str(v)


cli = StartCommand.to_command()

if __name__ == "__main__":
    cli()
