from typing import AsyncIterator
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

api_router = APIRouter(prefix="/api")


class GetAgentsResponse(BaseModel):
    agents: list[str]


@api_router.get("/agents")
async def get_agents() -> GetAgentsResponse:
    return GetAgentsResponse(agents=[])


@api_router.post("/api/chat")
async def chat(req: Request) -> StreamingResponse:
    async def stream() -> AsyncIterator[bytes]:
        yield b""

    return StreamingResponse(content=stream())
