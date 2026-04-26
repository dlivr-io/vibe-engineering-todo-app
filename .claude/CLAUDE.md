# CLAUDE.md

## Project

Full-stack Todo app. FastAPI backend + Next.js frontend. PostgreSQL DB. Docker Compose for local dev.

**Docs:** [INDEX.md](docs/INDEX.md) | [FRONTEND.md](docs/FRONTEND.md) | [BACKEND.md](docs/BACKEND.md) | [TESTING.md](docs/TESTING.md) | [QUICK_REF.md](docs/QUICK_REF.md) | [Troubleshooting](docs/troubleshooting/TESTING.md)

---

## Structure

```
.
├── .claude/
│   ├── CLAUDE.md              # This file
│   └── docs/
│       ├── INDEX.md
│       ├── FRONTEND.md
│       ├── BACKEND.md
│       ├── TESTING.md
│       └── QUICK_REF.md
├── .env                       # DB + API secrets (never commit)
├── .env.example
├── docker-compose.yml         # db + backend + frontend services
├── Makefile                   # All dev commands
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/versions/      # DB migrations
│   ├── app/
│   │   ├── main.py
│   │   ├── core/              # config, database, security
│   │   ├── models/            # SQLModel ORM models
│   │   ├── schemas/           # Pydantic I/O schemas
│   │   ├── services/          # Business logic
│   │   └── api/v1/endpoints/  # Route handlers
│   └── tests/
└── frontend/
    ├── Dockerfile
    ├── package.json           # pnpm 10.9.0
    ├── tsconfig.json          # @/* → ./src/*
    ├── next.config.ts
    ├── jest.config.ts
    └── src/
        ├── app/               # Next.js App Router
        │   ├── auth/login/
        │   ├── auth/register/
        │   └── todos/
        ├── components/todos/
        ├── hooks/             # useTodos, useAuth
        ├── lib/api.ts         # Axios client
        ├── types/
        └── __tests__/
```

---

## Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | Next.js + React | 15.3.1 + 19.1.0 |
| Frontend lang | TypeScript | 5.8.3 |
| Frontend style | Tailwind CSS | 4.1.4 |
| Frontend pkg | pnpm | 10.9.0 |
| Frontend tests | Jest + RTL | 29.7.0 + 16.3.0 |
| Backend | FastAPI + Uvicorn | 0.115.12 + 0.34.0 |
| Backend lang | Python | 3.12 |
| ORM | SQLModel | 0.0.22 |
| DB | PostgreSQL | 17 Alpine |
| Migrations | Alembic | 1.14.1 |
| Auth | python-jose + bcrypt | JWT |
| Linting | ruff | 0.11.6 |
| Containers | Docker Compose | — |

---

## Key Commands

```bash
make docker-up        # Start all services
make docker-down      # Stop all services
make test             # Run all tests
make migrate          # Run DB migrations
make lint             # Lint all code
```

See [QUICK_REF.md](docs/QUICK_REF.md) for full reference.

---

## Agent Flow

**Every query MUST follow this sequence — no exceptions.**

```
User Query
    │
    ▼
1. architect agent
   - Analyzes requirements
   - Reads existing code
   - Produces Backend Plan + Frontend Plan (bullet points)
    │
    ▼
2. frontend agent ◄──────────────────────► backend agent
   (parallel)                               (parallel)
   - Implements UI changes                  - Implements API/DB changes
   - Follows architect's Frontend Plan      - Follows architect's Backend Plan
    │                                              │
    └──────────────────┬───────────────────────────┘
                       ▼
3. reviewer agent
   - Reviews all changed files (frontend + backend)
   - Outputs bullet-point summary: [BLOCKING] / [non-blocking]
   - APPROVED → proceed to step 4
   - REJECTED → frontend/backend agents fix issues → reviewer re-reviews
                (loop continues until APPROVED)
                       │
                       ▼
4. tester agent
   - Reads all implemented changes
   - Writes new tests + updates broken existing tests
   - Runs full test suite (backend + frontend)
   - Fixes failures until 100% pass
   - Reports final results
```

### Agent definitions

| Agent | File | Tools |
|-------|------|-------|
| architect | `.claude/agents/architect.md` | WebSearch, Read, Bash |
| frontend | `.claude/agents/frontend.md` | Read, Write, Bash |
| backend | `.claude/agents/backend.md` | Read, Write, Bash |
| reviewer | `.claude/agents/reviewer.md` | Read, Bash |
| tester | `.claude/agents/tester.md` | Read, Write, Bash |