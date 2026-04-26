# Testing

---

## Run Tests

```bash
make test              # all tests
make test-backend      # pytest only
make test-frontend     # jest only
```

Manual:
```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && pnpm test
pnpm test:watch        # watch mode
```

---

## Backend Tests

**Tool:** pytest + pytest-asyncio + httpx (async test client)

**Config:** `backend/pytest.ini`

**Fixtures:** `backend/tests/conftest.py`
- In-memory SQLite DB per test session
- FastAPI `TestClient` with dependency overrides
- Pre-created test user + auth token

**Files:**
```
backend/tests/
├── conftest.py        # DB fixture, client, auth helpers
├── test_auth.py       # register, login, token validation
└── test_todos.py      # CRUD, ownership, 404s
```

---

## Frontend Tests

**Tool:** Jest 29 + React Testing Library 16 + jsdom

**Config:** `frontend/jest.config.ts`

**Setup:** `frontend/jest.setup.ts` (RTL matchers)

**Path alias:** `@/*` → `src/*` mapped in jest.config.ts moduleNameMapper.

**Files:**
```
frontend/src/__tests__/
├── api.test.ts            # Axios client: interceptors, auth headers
├── TodoItem.test.tsx      # Render, toggle, delete interactions
└── AddTodoForm.test.tsx   # Form submit, validation
```

---

## Writing Tests

**Backend rules:**
- Use `TestClient` from conftest — never real DB
- One `test_` file per endpoint group
- Assert status codes + response shape

**Frontend rules:**
- Use `@testing-library/user-event` for interactions, not `fireEvent`
- Mock `src/lib/api.ts` with `jest.mock`
- Test behavior, not implementation details