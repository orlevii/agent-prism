import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from agent_prism.agents import agent_loader
from agent_prism.api import api_router

static_dir = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    package = os.getenv("AGENT_PRISM_PACKAGE")
    assert package
    agent_loader.load(package)
    yield


app = FastAPI(title="Agent Prism", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if not os.getenv("AGENT_PRISM_DEV"):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    DEV_SERVER_URL = "http://localhost:5173"

    @app.api_route(
        "/{path:path}",
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    )
    async def proxy_to_dev_server(request: Request, path: str) -> Response:
        async with httpx.AsyncClient() as client:
            url = f"{DEV_SERVER_URL}/{path}"
            headers = dict(request.headers)
            headers.pop("host", None)

            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=await request.body(),
                params=request.query_params,
                follow_redirects=True,
            )

            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
            )
