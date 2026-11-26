# CHIKITSAK System Architecture

## High-Level Data Flow

```text
Patient / Caregiver
   │
   ▼
React + TypeScript + Vite Frontend (frontend/)
   │  • In-memory JWT Bearer auth
   │  • Vite proxy / VITE_API_BASE_URL
   ▼
FastAPI Backend (backend/app/main.py — /api/v1)
   │  • Auth & Patient Profile (/auth/*)
   │  • Document Ingestion (/reports/upload)
   │
   ├──► Document Extraction (document_service.py)
   │      • PyMuPDF text extraction
   │      • Tesseract OCR + Pillow fallback for scanned PDFs/images
   │
   ├──► Gemini AI Simplification (ai_service.py)
   │      • Official google-genai SDK
   │      • Structured JSON output (GeminiCarePlanPayload)
   │
   ├──► Deterministic Medical Validation (validation_service.py)
   │      • Cross-checks drug names, numeric dosages & follow-up dates
   │      • Flags discrepancies & unclear fields
   │
   ▼
MySQL 8 Database (chikitsak via SQLAlchemy 2.x + Alembic)
   │  • users, patients, discharge_reports, care_plans,
   │    medications, reminders, appointments
   ▼
Patient-Friendly Care Plan, Medicine Schedule, Reminders & Audio Guide
```

## Frontend Architecture (`frontend/`)
- **Entry & State (`frontend/src/App.tsx`)**: Coordinates screen navigation, authenticated session state, demo preview mode vs. live MySQL data synchronization, and optimistic updates backed by FastAPI persistence.
- **API Client (`frontend/src/services/api/`)**:
  - `apiClient.ts`: Centralized Fetch wrapper storing JWT Bearer tokens strictly in JS memory.
  - `carePlanService.ts`: Typed endpoints (`authApi`, `dashboardApi`, `reportsApi`, `carePlansApi`, `medicationsApi`, `remindersApi`, `appointmentsApi`) and response mappers.
- **UI Components (`frontend/src/components/`)**: Sidebar, TopBar, MobileShell, AuthModal, and modular screens for Dashboard, Upload, Processing, Care Plans, Medicine Schedule, Warning Signs, Appointments, Reminders, Voice Assistant, Settings/About, and Printable Care Sheet.

## Backend Architecture (`backend/`)
- **`app/core/`**: Settings (`config.py`), centralized error handlers (`exceptions.py`), bcrypt hashing and JWT signing (`security.py`).
- **`app/db/`**: SQLAlchemy 2.x engine/session management (`session.py`) and declarative base (`base.py`).
- **`app/models/` & `app/schemas/`**: Strict separation between ORM persistence models and Pydantic validation schemas.
- **`app/services/`**: Business logic isolated from FastAPI route handlers (`auth_service.py`, `document_service.py`, `ai_service.py`, `validation_service.py`, `care_plan_service.py`).
- **`app/api/v1/`**: Versioned REST endpoints guarded by `get_current_user` dependency injection (`deps.py`).
