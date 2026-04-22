from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.models.user import User
from app.schemas.todo import TodoCreate, TodoUpdate, TodoRead
from app.services.auth import get_current_user
from app.services.todo import get_todos, create_todo, get_todo, update_todo, delete_todo

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("/", response_model=list[TodoRead])
def list_todos(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return get_todos(current_user.id, session)


@router.post("/", response_model=TodoRead, status_code=201)
def create(data: TodoCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return create_todo(data, current_user.id, session)


@router.get("/{todo_id}", response_model=TodoRead)
def read(todo_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return get_todo(todo_id, current_user.id, session)


@router.patch("/{todo_id}", response_model=TodoRead)
def update(todo_id: int, data: TodoUpdate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return update_todo(todo_id, data, current_user.id, session)


@router.delete("/{todo_id}", status_code=204)
def delete(todo_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    delete_todo(todo_id, current_user.id, session)