from fastapi.testclient import TestClient

from tests.conftest import register_and_get_headers


def test_health_check_endpoint(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "DATABASE_URL" not in str(data)


def test_register_login_and_me_flow(client: TestClient) -> None:
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "Ramesh.Sharma@Example.com",
            "password": "Password123!",
            "full_name": "Ramesh Sharma",
            "age": 64,
            "blood_group": "O+",
            "phone": "+91 98111 22334",
            "emergency_contact": "Priya Sharma",
        },
    )
    assert reg.status_code == 201
    reg_body = reg.json()
    assert reg_body["token_type"] == "bearer"
    assert reg_body["user"]["email"] == "ramesh.sharma@example.com"
    assert reg_body["user"]["patient"]["age"] == 64

    # Duplicate email rejected
    dup = client.post(
        "/api/v1/auth/register",
        json={
            "email": "ramesh.sharma@example.com",
            "password": "Password123!",
            "full_name": "Duplicate User",
        },
    )
    assert dup.status_code == 409

    # Wrong password rejected
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh.sharma@example.com", "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401

    # Valid login
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh.sharma@example.com", "password": "Password123!"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Unauthenticated /me rejected
    assert client.get("/api/v1/auth/me").status_code == 401

    # Authenticated /me succeeds
    me = client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["full_name"] == "Ramesh Sharma"

    # Profile update succeeds
    patched = client.patch(
        "/api/v1/auth/me",
        headers=headers,
        json={"age": 65, "preferred_language": "hi"},
    )
    assert patched.status_code == 200
    assert patched.json()["preferred_language"] == "hi"
    assert patched.json()["patient"]["age"] == 65


def test_unauthorized_protected_endpoints(client: TestClient) -> None:
    for method, path in [
        ("GET", "/api/v1/dashboard/overview"),
        ("GET", "/api/v1/care-plans"),
        ("GET", "/api/v1/medications"),
        ("GET", "/api/v1/reminders"),
        ("GET", "/api/v1/appointments"),
        ("GET", "/api/v1/reports"),
    ]:
        resp = client.request(method, path)
        assert resp.status_code == 401
