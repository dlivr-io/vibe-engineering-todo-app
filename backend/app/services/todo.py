import csv
import io

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


def get_todos(user_id: int, session: Session) -> list[Todo]:
    return list(session.exec(select(Todo).where(Todo.user_id == user_id)).all())


def create_todo(data: TodoCreate, user_id: int, session: Session) -> Todo:
    todo = Todo(**data.model_dump(), user_id=user_id)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


def get_todo(todo_id: int, user_id: int, session: Session) -> Todo:
    todo = session.get(Todo, todo_id)
    if not todo or todo.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return todo


def update_todo(todo_id: int, data: TodoUpdate, user_id: int, session: Session) -> Todo:
    todo = get_todo(todo_id, user_id, session)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(todo, key, val)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo


def delete_todo(todo_id: int, user_id: int, session: Session) -> None:
    todo = get_todo(todo_id, user_id, session)
    session.delete(todo)
    session.commit()


def export_todos_csv(user_id: int, session: Session) -> str:
    todos = get_todos(user_id, session)
    buffer = io.StringIO()
    writer = csv.DictWriter(
        buffer, fieldnames=["id", "title", "description", "completed"]
    )
    writer.writeheader()
    for todo in todos:
        writer.writerow(
            {
                "id": todo.id,
                "title": todo.title,
                "description": todo.description if todo.description is not None else "",
                "completed": "true" if todo.completed else "false",
            }
        )
    return buffer.getvalue()
