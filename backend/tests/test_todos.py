import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def auth_client(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "todo@example.com", "password": "secret123"})
    token = client.post("/api/v1/auth/login", json={"email": "todo@example.com", "password": "secret123"}).json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


def test_create_todo(auth_client: TestClient):
    r = auth_client.post("/api/v1/todos/", json={"title": "Buy milk"})
    assert r.status_code == 201
    assert r.json()["title"] == "Buy milk"
    assert r.json()["completed"] is False


def test_list_todos(auth_client: TestClient):
    auth_client.post("/api/v1/todos/", json={"title": "Task 1"})
    auth_client.post("/api/v1/todos/", json={"title": "Task 2"})
    r = auth_client.get("/api/v1/todos/")
    assert r.status_code == 200
    assert len(r.json()) >= 2


def test_update_todo(auth_client: TestClient):
    todo_id = auth_client.post("/api/v1/todos/", json={"title": "Old title"}).json()["id"]
    r = auth_client.patch(f"/api/v1/todos/{todo_id}", json={"title": "New title", "completed": True})
    assert r.status_code == 200
    assert r.json()["title"] == "New title"
    assert r.json()["completed"] is True


def test_delete_todo(auth_client: TestClient):
    todo_id = auth_client.post("/api/v1/todos/", json={"title": "To delete"}).json()["id"]
    r = auth_client.delete(f"/api/v1/todos/{todo_id}")
    assert r.status_code == 204
    r = auth_client.get(f"/api/v1/todos/{todo_id}")
    assert r.status_code == 404