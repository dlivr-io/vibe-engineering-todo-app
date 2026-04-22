FROM python:3.12-slim

WORKDIR /app

ENV PATH="/app/.venv/bin:$PATH"

CMD ["sh", "-c", "python -m venv .venv && pip install --no-cache-dir -r requirements.txt && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]