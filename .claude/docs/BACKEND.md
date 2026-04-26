# Backend

**Stack:** FastAPI 0.115 · Python 3.12 · SQLModel 0.0.22 · PostgreSQL 17 · Alembic · python-jose JWT

---

## API Base

`/api/v1`

| Group | Prefix | File |
|-------|--------|------|
| Auth | `/auth` | `app/api/v1/endpoints/auth.py` |
| Users | `/users` | `app/api/v1/endpoints/users.py` |
| Todos | `/todos` | `app/api/v1/endpoints/todos.py` |

Key endpoints:
- `POST /auth/register` — create user
- `POST /auth/login` — returns JWT
- `GET /todos` — list user's todos
- `POST /todos` — create todo
- `PATCH /todos/{id}` — update todo
- `DELETE /todos/{id}` — delete todo

---

## App Layout

```
backend/app/
├── main.py                    # FastAPI instance, router registration, CORS
├── core/
│   ├── config.py              # Pydantic Settings (reads .env)
│   ├── database.py            # Engine, session, get_session dep
│   └── security.py            # JWT create/verify, password hash/verify
├── models/                    # SQLModel table definitions
│   ├── user.py
│   └── todo.py
├── schemas/                   # Pydantic request/response shapes
│   ├── user.py
│   └── todo.py
├── services/                  # Business logic (no DB details leaking to routes)
│   ├── auth.py
│   └── todo.py
└── api/v1/endpoints/          # Thin route handlers → call services
```

---

## Database

**ORM:** SQLModel (SQLAlchemy + Pydantic hybrid).

**Migrations:** Alembic.
```bash
make migrate                          # apply pending migrations
make migrate-make name=add_something  # generate new migration
```

Migration files: `backend/alembic/versions/`.

**Connection string** (`.env`):
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/tododb
```

---

## Auth

- Passwords: bcrypt via passlib
- Tokens: HS256 JWT via python-jose
- Secret: `SECRET_KEY` in `.env`
- Protected routes: use `get_current_user` FastAPI dependency

---

## Dev Server

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Or via Docker: `make docker-up` → backend on port 8000.

API docs: `http://localhost:8000/docs`