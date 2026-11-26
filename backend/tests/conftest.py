import os
from pathlib import Path
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Set isolated test defaults before importing app config/session
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-chars-long")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")

from app.core.config import get_settings  # noqa: E402
from app.db.base import Base  # noqa: E402
import app.models  # noqa: F401, E402
from app.db.session import get_db  # noqa: E402
import app.db.session as db_session_module  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def test_db(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("UPLOAD_DIR", str(upload_dir))
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-at-least-32-chars-long")
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-key")
    get_settings.cache_clear()

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    # Point health-check engine to the isolated test engine as well
    original_engine = db_session_module.engine
    db_session_module.engine = engine

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        yield TestingSessionLocal
    finally:
        app.dependency_overrides.clear()
        db_session_module.engine = original_engine
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        get_settings.cache_clear()


@pytest.fixture()
def client(test_db) -> TestClient:
    with TestClient(app) as c:
        yield c


def register_and_get_headers(
    client: TestClient,
    email: str = "patient@example.com",
    password: str = "StrongPass123!",
    full_name: str = "Aashish Yadav",
) -> dict[str, str]:
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "preferred_language": "bilingual",
        },
    )
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
