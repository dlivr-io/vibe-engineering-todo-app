from typing import Optional
from sqlmodel import Field, SQLModel


class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="users.id")