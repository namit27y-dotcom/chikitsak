# CHIKITSAK Security & Privacy Architecture

## 1. Authentication & Session Handling
- **Password Hashing**: Passwords are salted and hashed with `bcrypt` (`backend/app/core/security.py`). Plaintext passwords are never stored or logged.
- **JWT Tokens**: Access tokens use `HS256` with configurable expiry (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Frontend Token Storage**: JWT Bearer tokens are held strictly in JavaScript memory (`frontend/src/services/api/apiClient.ts`) and never persisted in `localStorage` or `sessionStorage`.

## 2. User-Level Data Isolation
- Every query against `patients`, `discharge_reports`, `care_plans`, `medications`, `reminders`, and `appointments` scopes explicitly by `user_id == current_user.id`.
- Attempting to access, modify, or delete another user's record returns `404` without leaking record existence.

## 3. API Key & Credential Protection
- `GEMINI_API_KEY`, `DATABASE_URL`, and `JWT_SECRET_KEY` exist solely on the backend via `backend/.env` and are never exposed in frontend `VITE_*` variables or API responses.
- `.gitignore` excludes all `.env*` files (except `.env.example`), `.venv/`, and upload storage directories.

## 4. File Upload Validation & Storage
- Enforces extension allowlist (`.pdf`, `.jpg`, `.jpeg`, `.png`) and max upload limit (`MAX_UPLOAD_SIZE_MB`, default `10 MB`).
- Validates magic bytes (`%PDF` header for PDFs; `Pillow` `Image.verify()` for JPEG/PNG).
- Stores uploaded files outside public web roots under per-user folders with randomized UUID filenames (`uuid.uuid4().hex`) and path-traversal checks (`is_relative_to`).

## 5. Patient Data Privacy Notice
- Only synthetic or anonymized sample discharge summaries should be used during local development, testing, and demonstrations.
- Health check responses (`/health`) report connectivity status only and never expose database credentials or internal paths.
