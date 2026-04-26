# Frontend

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5.8 · Tailwind 4 · pnpm 10.9

---

## Routes

| Path | File | Purpose |
|------|------|---------|
| `/` | `src/app/page.tsx` | Home / redirect |
| `/auth/login` | `src/app/auth/login/page.tsx` | Login form |
| `/auth/register` | `src/app/auth/register/page.tsx` | Register form |
| `/todos` | `src/app/todos/page.tsx` | Todo list (protected) |

---

## Components

```
src/components/todos/
├── TodoItem.tsx       # Single todo row — toggle, delete
└── AddTodoForm.tsx    # Input + submit for new todo
```

---

## Hooks

```
src/hooks/
├── useAuth.ts         # Login, register, logout, user state
└── useTodos.ts        # Fetch, create, toggle, delete todos
```

---

## API Client

`src/lib/api.ts` — Axios instance.

- Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api/v1`)
- Attaches JWT from localStorage on every request via request interceptor
- 401 response → clears token, redirects to `/auth/login`

---

## Types

`src/types/index.ts` — shared interfaces: `User`, `Todo`, `AuthResponse`.

---

## Path Alias

`@/*` resolves to `src/*` (tsconfig.json + jest.config.ts).

---

## Dev Server

```bash
cd frontend
pnpm dev          # http://localhost:3000
pnpm build
pnpm start
pnpm lint
```

Or via Docker: `make docker-up` → frontend on port 3000.