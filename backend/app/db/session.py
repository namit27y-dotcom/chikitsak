from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def _create_engine():
    settings = get_settings()
    url = settings.DATABASE_URL
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        return create_engine(url, connect_args=connect_args, future=True)

    return create_engine(
        url,
        pool_pre_ping=True,
        pool_recycle=1800,
        future=True,
    )


engine = _create_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connectivity() -> tuple[bool, str]:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "connected"
    except Exception:
        return False, "unavailable"
