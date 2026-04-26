import csv
import io

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def auth_client(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "export@example.com", "password": "secret123"})
    token = client.post("/api/v1/auth/login", json={"email": "export@example.com", "password": "secret123"}).json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


# ---------------------------------------------------------------------------
# GET /todos/export/csv — happy path
# ---------------------------------------------------------------------------

def test_export_csv_returns_200(auth_client: TestClient):
    r = auth_client.get("/api/v1/todos/export/csv")
    assert r.status_code == 200


def test_export_csv_content_type(auth_client: TestClient):
    r = auth_client.get("/api/v1/todos/export/csv")
    assert "text/csv" in r.headers["content-type"]


def test_export_csv_content_disposition(auth_client: TestClient):
    r = auth_client.get("/api/v1/todos/export/csv")
    disposition = r.headers.get("content-disposition", "")
    assert "attachment" in disposition
    assert 'filename="todos.csv"' in disposition


def test_export_csv_header_row(auth_client: TestClient):
    r = auth_client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    assert reader.fieldnames == ["id", "title", "description", "completed"]


# ---------------------------------------------------------------------------
# Empty list — only header row, no data rows
# ---------------------------------------------------------------------------

def test_export_csv_empty_todos_returns_header_only(auth_client: TestClient):
    r = auth_client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    assert rows == [], "Expected no data rows when user has no todos"


# ---------------------------------------------------------------------------
# Todos with all fields populated
# ---------------------------------------------------------------------------

def test_export_csv_todo_with_description(auth_client: TestClient):
    auth_client.post("/api/v1/todos/", json={"title": "Buy milk", "description": "Whole milk"})
    r = auth_client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    assert len(rows) == 1
    assert rows[0]["title"] == "Buy milk"
    assert rows[0]["description"] == "Whole milk"
    assert rows[0]["completed"] == "false"


def test_export_csv_completed_todo(auth_client: TestClient):
    todo_id = auth_client.post("/api/v1/todos/", json={"title": "Done task"}).json()["id"]
    auth_client.patch(f"/api/v1/todos/{todo_id}", json={"completed": True})
    r = auth_client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    assert len(rows) == 1
    assert rows[0]["completed"] == "true"


def test_export_csv_description_none_becomes_empty_string(auth_client: TestClient):
    """Todos created without a description should have an empty string in the CSV."""
    auth_client.post("/api/v1/todos/", json={"title": "No desc"})
    r = auth_client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    assert len(rows) == 1
    assert rows[0]["description"] == ""


def test_export_csv_multiple_todos_correct_data(auth_client: TestClient):
    auth_client.post("/api/v1/todos/", json={"title": "Task A", "description": "Alpha"})
    auth_client.post("/api/v1/todos/", json={"title": "Task B"})
    r = auth_client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    assert len(rows) == 2
    titles = {row["title"] for row in rows}
    assert titles == {"Task A", "Task B"}
    descriptions = {row["title"]: row["description"] for row in rows}
    assert descriptions["Task A"] == "Alpha"
    assert descriptions["Task B"] == ""


def test_export_csv_id_field_is_numeric(auth_client: TestClient):
    auth_client.post("/api/v1/todos/", json={"title": "Numeric id test"})
    r = auth_client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    assert len(rows) == 1
    assert rows[0]["id"].isdigit(), "id column should contain a numeric string"


# ---------------------------------------------------------------------------
# Auth boundary
# ---------------------------------------------------------------------------

def test_export_csv_unauthenticated_returns_403(client: TestClient):
    """HTTPBearer raises 403 Forbidden when no Authorization header is present."""
    r = client.get("/api/v1/todos/export/csv")
    assert r.status_code == 403


def test_export_csv_invalid_token_returns_401(client: TestClient):
    """A malformed bearer token results in 401 Unauthorized from get_current_user."""
    r = client.get("/api/v1/todos/export/csv", headers={"Authorization": "Bearer not-a-valid-token"})
    assert r.status_code == 401


def test_export_csv_does_not_include_other_users_todos(client: TestClient):
    """Two users each create a todo; each export should only see their own."""
    # User A
    client.post("/api/v1/auth/register", json={"email": "usera@example.com", "password": "secret123"})
    token_a = client.post("/api/v1/auth/login", json={"email": "usera@example.com", "password": "secret123"}).json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token_a}"})
    client.post("/api/v1/todos/", json={"title": "User A todo"})

    # User B
    client.post("/api/v1/auth/register", json={"email": "userb@example.com", "password": "secret123"})
    token_b = client.post("/api/v1/auth/login", json={"email": "userb@example.com", "password": "secret123"}).json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token_b}"})
    client.post("/api/v1/todos/", json={"title": "User B todo"})

    # Export as user B — should only see user B's todo
    r = client.get("/api/v1/todos/export/csv")
    reader = csv.DictReader(io.StringIO(r.text))
    rows = list(reader)
    assert len(rows) == 1
    assert rows[0]["title"] == "User B todo"
