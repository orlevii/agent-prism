from fastapi import APIRouter
from pydantic import BaseModel

api_router = APIRouter(prefix="/api")


class GetAgentsResponse(BaseModel):
    agents: list[str]


@api_router.get("/agents")
async def get_agents() -> GetAgentsResponse:
    return GetAgentsResponse(agents=[])
