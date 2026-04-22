.PHONY: help \
        env \
        docker-build docker-up docker-down docker-logs docker-restart docker-clean \
        test test-backend test-frontend \
        lint lint-backend lint-frontend \
        migrate migrate-make

help:
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "  Docker"
	@echo "    docker-build       Build all images"
	@echo "    docker-up          Start all services (detached)"
	@echo "    docker-down        Stop all services"
	@echo "    docker-logs        Tail logs for all services"
	@echo "    docker-restart     Restart all services"
	@echo "    docker-clean       Remove containers, volumes, and images"
	@echo ""
	@echo "  Test"
	@echo "    test               Run all tests inside containers"
	@echo "    test-backend       Run pytest inside the backend container"
	@echo "    test-frontend      Run Jest inside the frontend container"
	@echo ""
	@echo "  Lint"
	@echo "    lint               Lint all inside containers"
	@echo "    lint-backend       Ruff check inside the backend container"
	@echo "    lint-frontend      Next.js lint inside the frontend container"
	@echo ""
	@echo "  Database"
	@echo "    migrate            Apply Alembic migrations (inside backend container)"
	@echo "    migrate-make m=    Generate migration  (e.g. make migrate-make m=add_tags)"
	@echo "  Setup"
	@echo "    env                Copy .env.example to .env"
	@echo ""
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────
env:
	@if [ -f .env ]; then echo ".env already exists, skipping."; else cp .env.example .env && echo "Created .env from .env.example"; fi

# ── Docker ────────────────────────────────────────────────────────────────────
docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart:
	docker compose restart

docker-clean:
	docker compose down -v --rmi local

# ── Test ──────────────────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	docker compose run --rm backend pytest -v

test-frontend:
	docker compose run --rm frontend pnpm test

# ── Lint ──────────────────────────────────────────────────────────────────────
lint: lint-backend lint-frontend

lint-backend:
	docker compose run --rm backend ruff check app tests

lint-frontend:
	docker compose run --rm frontend pnpm lint

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	docker compose exec backend alembic upgrade head

migrate-make:
	@[ -n "$(m)" ] || (echo "Usage: make migrate-make m=<message>" && exit 1)
	docker compose exec backend alembic revision --autogenerate -m "$(m)"