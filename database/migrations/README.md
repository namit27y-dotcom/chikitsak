# Database Migrations

CHIKITSAK uses **Alembic** with **SQLAlchemy 2.x** inside `backend/alembic/` to manage all MySQL 8 schema migrations.

- Migration configuration: `backend/alembic.ini`
- Environment runner: `backend/alembic/env.py`
- Initial schema revision: `backend/alembic/versions/0001_initial_schema.py`

## Running Migrations

From `backend/` (with virtual environment activated and `backend/.env` configured):

```powershell
alembic upgrade head
```

Or from repository root:

```powershell
backend\.venv\Scripts\alembic.exe -c backend/alembic.ini upgrade head
```
