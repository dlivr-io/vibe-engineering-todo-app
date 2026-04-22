from fastapi.testclient import TestClient


def test_register(client: TestClient):
    r = client.post("/api/v1/auth/register", json={"email": "test@example.com", "password": "secret123"})
    assert r.status_code == 201
    assert r.json()["email"] == "test@example.com"


def test_register_duplicate(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "dup@example.com", "password": "secret123"})
    r = client.post("/api/v1/auth/register", json={"email": "dup@example.com", "password": "secret123"})
    assert r.status_code == 400


def test_login(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "login@example.com", "password": "secret123"})
    r = client.post("/api/v1/auth/login", json={"email": "login@example.com", "password": "secret123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_invalid(client: TestClient):
    r = client.post("/api/v1/auth/login", json={"email": "nobody@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_me(client: TestClient):
    client.post("/api/v1/auth/register", json={"email": "me@example.com", "password": "secret123"})
    token = client.post("/api/v1/auth/login", json={"email": "me@example.com", "password": "secret123"}).json()["access_token"]
    r = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "me@example.com"