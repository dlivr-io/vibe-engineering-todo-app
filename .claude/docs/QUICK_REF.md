# Quick Reference

---

## DO

- Run `make docker-up` before developing — DB must be running
- Use `make migrate` after pulling schema changes
- Use `@/` import alias in all frontend files (`@/lib/api`, `@/components/todos/...`)
- Add new endpoints under `backend/app/api/v1/endpoints/` + register in router
- Put business logic in `services/`, keep route handlers thin
- Use Pydantic schemas for all request/response shapes — never expose raw models
- Protect routes with `get_current_user` dependency
- Run `make lint` before committing

---

## DON'T

- Don't commit `.env` — use `.env.example` as template
- Don't put business logic directly in route handlers
- Don't bypass Alembic — never `CREATE TABLE` manually
- Don't expose SQLModel table models directly as API responses
- Don't use `npm` or `yarn` — project uses **pnpm**
- Don't skip migrations when changing DB schema
- Don't store secrets in code — use `.env` + pydantic-settings

---

## Common Lookups

### Start / Stop

```bash
make docker-up         # start all (db + backend + frontend)
make docker-down       # stop all
make docker-logs       # tail logs
make docker-restart    # restart all
make docker-clean      # nuke containers + volumes
```

### Database

```bash
make migrate                          # apply migrations
make migrate-make name=<migration>    # create new migration
```

### Tests

```bash
make test              # all
make test-backend      # pytest
make test-frontend     # jest
```

### Lint

```bash
make lint              # all
make lint-backend      # ruff
make lint-frontend     # eslint
```

### Backend Dev (no Docker)

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

### Frontend Dev (no Docker)

```bash
cd frontend
pnpm dev
# App: http://localhost:3000
```

### First-Time Setup

```bash
make env               # copy .env.example → .env
make docker-build      # build images
make docker-up         # start services
```

---

## Key Files

| What | Where |
|------|-------|
| Env vars | `.env` |
| Docker services | `docker-compose.yml` |
| All dev commands | `Makefile` |
| API base URL | `.env` → `NEXT_PUBLIC_API_URL` |
| JWT secret | `.env` → `SECRET_KEY` |
| DB connection | `.env` → `DATABASE_URL` |
| Axios client | `frontend/src/lib/api.ts` |
| FastAPI entry | `backend/app/main.py` |
| App config | `backend/app/core/config.py` |
| DB session dep | `backend/app/core/database.py` |
| Auth dep | `backend/app/core/security.py` |
| Migrations dir | `backend/alembic/versions/` |