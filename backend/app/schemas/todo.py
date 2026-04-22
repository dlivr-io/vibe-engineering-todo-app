from typing import Optional
from pydantic import BaseModel


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TodoRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    completed: bool
    user_id: int

    model_config = {"from_attributes": True}