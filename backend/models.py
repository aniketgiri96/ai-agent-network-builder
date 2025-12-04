from pydantic import BaseModel

class Agent(BaseModel):
    id: str
    name: str
    role: str
    goals: list[str]
    model: str
