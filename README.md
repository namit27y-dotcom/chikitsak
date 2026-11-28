<div align="center">
  <img src="frontend/public/assets/logo.svg" alt="CHIKITSAK Logo" width="72" height="72" />
  <h1>CHIKITSAK — चिकित्सक</h1>
  <p><strong>Understand. Follow. Recover.</strong></p>
  <p>
    AI-powered patient discharge and post-hospital care management platform that converts complex hospital discharge summaries into clear, validated, bilingual care plans for Indian patients and families.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-153D32?style=flat-square" alt="Frontend React 19 TypeScript Vite" />
    <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-0E3025?style=flat-square" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Backend-FastAPI%20%2B%20SQLAlchemy%202.x-153D32?style=flat-square" alt="FastAPI SQLAlchemy" />
    <img src="https://img.shields.io/badge/Database-MySQL%208%20%2B%20Alembic-153D32?style=flat-square" alt="MySQL 8 Alembic" />
    <img src="https://img.shields.io/badge/AI-Google%20Gemini%20(google--genai)-153D32?style=flat-square" alt="Google Gemini AI" />
    <img src="https://img.shields.io/badge/OCR-PyMuPDF%20%2B%20Tesseract-153D32?style=flat-square" alt="PyMuPDF Tesseract OCR" />
  </p>
</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features & Implementation Status](#key-features--implementation-status)
- [Visual Identity & Screenshots](#visual-identity--screenshots)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Getting Started (Local Setup)](#getting-started-local-setup)
- [Environment Variables](#environment-variables)
- [API Reference (`/api/v1`)](#api-reference-apiv1)
- [Database Schema (`chikitsak`)](#database-schema-chikitsak)
- [AI & Medical Safety Pipeline](#ai--medical-safety-pipeline)
- [Testing & Verification](#testing--verification)
- [Security & Privacy Architecture](#security--privacy-architecture)
- [Deployment Configuration](#deployment-configuration)
- [Roadmap](#roadmap)
- [Medical Disclaimer](#medical-disclaimer)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Project Overview

**CHIKITSAK (चिकित्सक)** is a full-stack patient discharge comprehension and home-recovery companion built for Indian patients, elderly caregivers, and families. After hospital discharge, families often receive dense clinical PDFs or handwritten/printed prescriptions filled with medical abbreviations, Latin dosing shorthand, and fragmented follow-up instructions.

CHIKITSAK bridges the gap between hospital discharge and safe home recovery by extracting text from uploaded PDFs or photographs, converting instructions into Class-8 reading-level English or Hindi via Google Gemini structured JSON output, validating dosages and follow-up dates deterministically against the extracted source text, and organizing everything into an accessible dashboard with daily medicine tracking, voice narration, reminders, and printable family fridge sheets.

---

## Problem Statement

1. **Clinical Jargon Barrier**: Discharge summaries are written for clinicians rather than patients and caregivers.
2. **Language & Literacy Gaps**: Critical recovery steps, dietary precautions, and red-flag symptoms are rarely delivered in simple English or everyday Hindi (`Devanagari`).
3. **Medication Errors at Home**: Patients juggling multiple tablets across morning, afternoon, and night slots frequently miss doses or misread strengths (`mg`, `mcg`, `mL`).
4. **Unstructured Scans & Photos**: Families commonly carry smartphone photos or scanned PDFs rather than structured digital records.

---

## Solution

CHIKITSAK provides an end-to-end pipeline and patient-first interface:

- **Private Document Ingestion**: Accepts PDFs and JPG/PNG photographs up to 10 MB, validates file signatures (magic bytes) and extensions, and stores originals in private UUID-named directories outside public web roots.
- **Hybrid Extraction + OCR**: Extracts native text with **PyMuPDF** (`pymupdf`) and automatically falls back to **Tesseract OCR + Pillow** for scanned PDFs and prescription photographs.
- **Safety-First AI Simplification**: Uses the official `google-genai` SDK with strict Pydantic schema enforcement (`GeminiCarePlanPayload`) and explicit anti-hallucination system instructions.
- **Deterministic Source Verification**: Cross-checks every extracted medicine, numeric dosage, and follow-up date against the raw extracted text and marks each plan as `Verified Against Source`, `Needs Review`, or `Incomplete Source Information`.
- **Patient Recovery Workspace**: Presents simplified care plans, bilingual English/Hindi guidance, daily dose checklists, reminders, follow-up appointments, browser voice narration (`en-IN` / `hi-IN`), and printable/PDF summary sheets.

---

## Key Features & Implementation Status

| Feature Area | Status | Details |
| :--- | :--- | :--- |
| **Clinical Ivory & Forest Green Dashboard UI** | **Implemented** | Responsive desktop sidebar + mobile shell (`#153D32`, `#0E3025`, `#F7F4EA`, `#DCE9DC`), hero banner (`frontend/public/assets/chikitsak-hero.png`), adherence ring, and quick actions. |
| **JWT Authentication & Patient Profiles** | **Implemented** | Register, login, profile update (`GET/PATCH /api/v1/auth/me`), bcrypt password hashing, HS256 JWT tokens stored strictly in frontend JS memory. |
| **Discharge Report Upload & Hybrid OCR** | **Implemented** | `POST /api/v1/reports/upload` validates extension, size, and magic bytes; extracts via PyMuPDF and falls back to Tesseract OCR. |
| **Gemini Structured Care Plan Generation** | **Implemented** | Server-side `google-genai` JSON-schema generation in English or Hindi (`backend/app/services/ai_service.py`). Requires a valid `GEMINI_API_KEY` at runtime. |
| **Deterministic Medical Validation** | **Implemented** | `backend/app/services/validation_service.py` verifies medicine names, numeric dosages, and follow-up dates against extracted source text. |
| **MySQL 8 Persistence & User Isolation** | **Implemented** | 7 normalized tables via SQLAlchemy 2.x + Alembic; all queries scoped strictly by `user_id == current_user.id`. |
| **Medicine Schedule, Reminders & Appointments CRUD** | **Implemented** | Interactive dose completion toggling, reminders CRUD, and follow-up appointment tracking backed by `/api/v1/*` endpoints. |
| **Voice Assistant (Web Speech API)** | **Implemented** | Client-side speech synthesis (`frontend/src/utils/speechHelper.ts`) supporting `en-IN` and `hi-IN` playback for care instructions. |
| **Printable Care Plan & PDF Export** | **Implemented** | Print-formatted family care sheet and PDF export via browser print workflow (`frontend/src/utils/pdfExport.ts`). |
| **Sample Demo Mode & Transparency Controls** | **Implemented** | Unauthenticated exploration loads clearly labeled demo records (`Demo Data` badge with `Clear Demo Data` / `Load Demo Data` controls). |
| **Live Production Cloud Deployment** | **In Progress** | `vercel.json` and `backend/render.yaml` deployment configs are in place; live public URLs are not yet provisioned. |
| **SMS / WhatsApp / Push Reminder Delivery** | **Planned** | Automated background reminder notifications outside the browser session. |
| **AI Prompt Evaluation Benchmark Suite** | **Planned** | Automated regression harness under `ai/evaluation/` for clinical prompt accuracy checks. |

---

## Visual Identity & Screenshots

CHIKITSAK follows a calm, clinical Indian healthcare aesthetic using **Playfair Display** for headings, **Inter** for UI body text, and **Noto Sans Devanagari** for Hindi (`चिकित्सक`) copy.

- **Hero Banner Asset**: `frontend/public/assets/chikitsak-hero.png` (served at `/assets/chikitsak-hero.png`)
- **Brand Mark**: `frontend/public/assets/logo.svg`

> **Screenshot Capture Pending**: Static UI runtime screenshots for Dashboard, Upload Report, Care Plan View, Medicine Schedule, Voice Assistant, and Mobile View have not yet been captured into `docs/screenshots/`. Once the app is running locally (`http://localhost:3000`), add captured `.png` files and link them here.

| Screen | Planned Asset Path | Status |
| :--- | :--- | :--- |
| Desktop Dashboard | `docs/screenshots/dashboard-desktop.png` | Pending capture |
| Upload & AI Processing | `docs/screenshots/upload-processing.png` | Pending capture |
| Bilingual Care Plan & Validation | `docs/screenshots/care-plan-bilingual.png` | Pending capture |
| Medicine Schedule & Reminders | `docs/screenshots/medicine-schedule.png` | Pending capture |

---

## Technology Stack

### Frontend (`/frontend`)
- **React 19** & **TypeScript**
- **Vite 8** (dev server on port `3000`, proxies `/api/v1` and `/health` to `127.0.0.1:8000`)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide React** icons & **Motion** animations
- **Browser Web Speech API** (`en-IN` / `hi-IN` voice guide)

### Backend (`/backend`)
- **Python 3.11+** & **FastAPI**
- **Uvicorn** ASGI server
- **Pydantic v2** & **pydantic-settings**
- **SQLAlchemy 2.x**, **PyMySQL**, **Alembic**
- **PyJWT** + **bcrypt** (`HS256` authentication)
- **PyMuPDF (`pymupdf`)**, **Pillow**, **pytesseract** (PDF + image OCR extraction)
- **Google GenAI SDK (`google-genai`)** with `gemini-2.5-flash` default

### Database (`/database` & `/backend/alembic`)
- **MySQL 8** (or compatible **MariaDB** in local containers) — schema `chikitsak`

---

## System Architecture

```mermaid
flowchart LR
    Patient["Patient / Caregiver<br/>React 19 + Vite (:3000)"] -->|HTTPS / Bearer JWT| API["FastAPI Gateway<br/>(/api/v1)"]

    subgraph Backend["Backend Services (/backend/app)"]
        Auth["Auth & Isolation<br/>bcrypt + HS256 JWT"]
        Ingest["Upload Security<br/>Ext + Size + Magic Bytes"]
        Extract["Text Extraction<br/>PyMuPDF -> Tesseract OCR"]
        AI["Gemini AI Service<br/>google-genai JSON Schema"]
        Validate["Deterministic Validator<br/>Dosage & Date Cross-Check"]
    end

    API --> Auth
    API --> Ingest
    Ingest --> Storage[("Private UUID Storage<br/>storage/uploads")]
    Ingest --> Extract
    Extract --> AI
    AI -->|Structured Care Plan JSON| Validate
    Validate --> DB[("MySQL 8 / MariaDB<br/>chikitsak (7 Tables)")]
    API <--> DB
```

---

## Repository Structure

```text
CHIKITSAK/
├── README.md
├── package.json                       # Root workspace scripts delegating to frontend/
├── vercel.json                        # Vercel frontend deployment config (frontend/dist)
├── .gitignore
│
├── frontend/                          # Independent React + Vite + TypeScript SPA
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   ├── public/
│   │   └── assets/
│   │       ├── chikitsak-hero.png     # Hero banner image (/assets/chikitsak-hero.png)
│   │       ├── logo.svg               # Brand emblem
│   │       └── icons/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       │   ├── AuthModal.tsx
│       │   ├── BrandLogo.tsx
│       │   ├── MobileShell.tsx
│       │   ├── Sidebar.tsx
│       │   ├── TopBar.tsx
│       │   └── screens/               # Dashboard, Upload, Processing, CarePlan, Medicines, Warnings, Appointments, Reminders, Voice, Print, Settings/About
│       ├── data/mockCareData.ts       # Sample demo records (labeled Demo Data)
│       ├── services/api/
│       │   ├── apiClient.ts           # In-memory JWT token + fetch wrapper
│       │   └── carePlanService.ts     # Typed API bindings & response mappers
│       ├── types/chikitsak.ts
│       └── utils/
│           ├── pdfExport.ts
│           └── speechHelper.ts
│
├── backend/                           # Independent FastAPI + SQLAlchemy + Alembic API
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── render.yaml                    # Render backend deployment config
│   ├── .env.example
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 0001_initial_schema.py
│   ├── app/
│   │   ├── main.py                    # FastAPI factory, CORS, /health
│   │   ├── api/
│   │   │   ├── deps.py                # Auth & DB dependencies
│   │   │   └── v1/                    # auth, dashboard, reports, care_plans, medications, reminders, appointments
│   │   ├── core/                      # config.py, security.py, exceptions.py
│   │   ├── db/                        # base.py, session.py
│   │   ├── models/                    # 7 SQLAlchemy ORM models
│   │   ├── schemas/                   # Pydantic request/response & Gemini JSON schemas
│   │   └── services/                  # auth_service, document_service, ai_service, validation_service, care_plan_service
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_health_and_auth.py
│   │   ├── test_isolation_and_crud.py
│   │   └── test_documents_ai_and_validation.py
│   └── uploads/
│
├── ai/                                # AI prompt specifications & evaluation workspace
│   ├── README.md
│   ├── prompts/
│   │   ├── discharge_simplification.md
│   │   ├── hindi_translation.md
│   │   └── medical_validation.md
│   └── evaluation/
│
├── database/                          # Reference SQL schema & migration notes
│   ├── migrations/README.md
│   ├── schema/chikitsak_schema.sql
│   └── seeds/
│
├── docs/                              # Architecture, API, schema, security & setup docs
│   ├── PROJECT_OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── SETUP_GUIDE.md
│   └── SECURITY.md
│
└── scripts/                           # Windows PowerShell automation scripts
    ├── setup.ps1
    └── start.ps1
```

---

## Getting Started (Local Setup)

### Prerequisites

- **Node.js 20+** and **npm**
- **Python 3.11+**
- **MySQL 8** (or MariaDB) running on `127.0.0.1:3306`
- **Tesseract OCR** installed on the host machine (for scanned PDFs and prescription images)
- **Google Gemini API Key** (`GEMINI_API_KEY`) for AI care plan generation

### 1. Create the MySQL Database

Run the following SQL in MySQL 8:

```sql
CREATE DATABASE IF NOT EXISTS chikitsak
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'chikitsak_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON chikitsak.* TO 'chikitsak_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2A. Quick Setup on Windows (PowerShell)

```powershell
# 1. Install frontend packages, create backend/.venv, install requirements, and copy .env templates
.\scripts\setup.ps1

# 2. Edit backend\.env with your MySQL credentials, JWT_SECRET_KEY, and GEMINI_API_KEY
#    (If Tesseract is not on PATH, also set TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe)

# 3. Apply Alembic migrations
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
cd ..

# 4. Launch both FastAPI (:8000) and Vite (:3000)
.\scripts\start.ps1
```

### 2B. Manual Setup on Linux / macOS (Bash)

#### Backend (`http://localhost:8000`)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Update DATABASE_URL, JWT_SECRET_KEY, and GEMINI_API_KEY in backend/.env
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify backend health:

```bash
curl http://localhost:8000/health
```

#### Frontend (`http://localhost:3000`)

```bash
cd frontend
npm install
cp .env.example .env
# Confirm VITE_API_BASE_URL="http://localhost:8000/api/v1" (or use Vite proxy /api/v1)
npm run dev
```

You can also run frontend scripts from the repository root (`npm run dev`, `npm run build`, `npm run lint`), which delegate to `frontend/`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default / Example | Required | Description |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | `CHIKITSAK API` | No | FastAPI OpenAPI title. |
| `APP_ENV` | `development` | No | Runtime environment label. |
| `API_V1_PREFIX` | `/api/v1` | No | Versioned API route prefix. |
| `DATABASE_URL` | `mysql+pymysql://chikitsak_user:CHANGE_ME@localhost:3306/chikitsak` | **Yes** | SQLAlchemy MySQL 8 connection string. |
| `JWT_SECRET_KEY` | Strong random string | **Yes** | Signing key for HS256 JWT tokens (ephemeral key generated in memory if unset in dev). |
| `JWT_ALGORITHM` | `HS256` | No | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | No | Bearer token lifetime in minutes. |
| `GEMINI_API_KEY` | `""` | **Yes (for AI)** | Server-side Google Gemini API key. Never expose to the frontend. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | No | Gemini model used for structured discharge summarization. |
| `UPLOAD_DIR` | `storage/uploads` | No | Private directory (relative to `backend/` or absolute) for uploaded reports. |
| `MAX_UPLOAD_SIZE_MB` | `10` | No | Maximum accepted report upload size in MB. |
| `TESSERACT_CMD` | `""` | Optional | Explicit path to `tesseract` executable (needed on Windows if not in `PATH`). |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173` | Yes | Comma-separated list of allowed frontend origins. |

### Frontend (`frontend/.env`)

| Variable | Default / Example | Required | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Optional | FastAPI base URL. Defaults to `/api/v1` (handled by Vite dev proxy) when omitted. |

---

## API Reference (`/api/v1`)

Interactive OpenAPI documentation is available at `http://localhost:8000/docs` when the backend is running.

| Category | Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Public | Returns service & database connectivity status (`200` or `503`). |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register a user + patient profile and return JWT bearer token. |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate email & password and return JWT bearer token. |
| **Auth** | `GET` | `/api/v1/auth/me` | Bearer | Get authenticated user and linked patient profile. |
| **Auth** | `PATCH` | `/api/v1/auth/me` | Bearer | Update patient details and preferred language. |
| **Dashboard** | `GET` | `/api/v1/dashboard/overview` | Bearer | Aggregated care plans, daily doses, reminders, appointments, and stats. |
| **Reports** | `POST` | `/api/v1/reports/upload` | Bearer | Upload PDF/JPG/PNG -> extract text/OCR -> Gemini AI -> validate -> persist care plan. |
| **Reports** | `GET` | `/api/v1/reports` | Bearer | List user's uploaded discharge reports. |
| **Reports** | `GET` | `/api/v1/reports/{report_id}` | Bearer | Get metadata & extracted text for a single report. |
| **Reports** | `GET` | `/api/v1/reports/{report_id}/status` | Bearer | Check processing and validation status of an uploaded report. |
| **Care Plans** | `GET` | `/api/v1/care-plans` | Bearer | List user's generated care plans. |
| **Care Plans** | `GET` | `/api/v1/care-plans/{care_plan_id}` | Bearer | Retrieve full care plan, medications, warning signs, and validation notes. |
| **Care Plans** | `DELETE` | `/api/v1/care-plans/{care_plan_id}` | Bearer | Delete a care plan owned by the user. |
| **Medications** | `GET` | `/api/v1/medications` | Bearer | List medications (supports optional `?care_plan_id=`). |
| **Medications** | `POST` | `/api/v1/medications` | Bearer | Add a medication instruction to an existing care plan. |
| **Medications** | `GET` | `/api/v1/medications/{medication_id}` | Bearer | Retrieve a single medication record. |
| **Medications** | `PATCH` | `/api/v1/medications/{medication_id}` | Bearer | Toggle `taken_today` dose completion or update instructions. |
| **Reminders** | `GET` | `/api/v1/reminders` | Bearer | List user's reminders. |
| **Reminders** | `POST` | `/api/v1/reminders` | Bearer | Create a medicine or follow-up reminder. |
| **Reminders** | `PATCH` | `/api/v1/reminders/{reminder_id}` | Bearer | Update, pause, or mark a reminder complete. |
| **Reminders** | `DELETE` | `/api/v1/reminders/{reminder_id}` | Bearer | Delete a reminder. |
| **Appointments** | `GET` | `/api/v1/appointments` | Bearer | List user's follow-up appointments. |
| **Appointments** | `POST` | `/api/v1/appointments` | Bearer | Create a doctor follow-up appointment. |
| **Appointments** | `PATCH` | `/api/v1/appointments/{appointment_id}` | Bearer | Update appointment details or status (`Upcoming`, `Kept`, `Cancelled`). |
| **Appointments** | `DELETE` | `/api/v1/appointments/{appointment_id}` | Bearer | Delete an appointment. |

---

## Database Schema (`chikitsak`)

Managed via SQLAlchemy 2.x models (`backend/app/models/`) and Alembic (`backend/alembic/versions/0001_initial_schema.py`), with reference DDL in `database/schema/chikitsak_schema.sql`.

| Table | Purpose | Key Constraints & Relations |
| :--- | :--- | :--- |
| `users` | Registered account credentials & language preference | `id` PK, `email` UNIQUE & indexed, `hashed_password` (bcrypt) |
| `patients` | Patient demographic & emergency contact record | `user_id` FK -> `users.id` (`ON DELETE CASCADE`) |
| `discharge_reports` | Uploaded PDF/image metadata, SHA-256 hash, extraction status & text | `user_id` FK -> `users.id`, `patient_id` FK -> `patients.id` |
| `care_plans` | Simplified care plan JSON sections, warning signs & validation status | `user_id` FK, `patient_id` FK, `discharge_report_id` FK **UNIQUE** (`uq_care_plans_discharge_report_id`) |
| `medications` | Per-medicine dosage, schedule slot, verification flag & `taken_today` | `user_id` FK, `care_plan_id` FK -> `care_plans.id` (`ON DELETE CASCADE`) |
| `reminders` | Medicine and checkup reminders | `user_id` FK, `care_plan_id` FK -> `care_plans.id` (`ON DELETE SET NULL`) |
| `appointments` | Doctor follow-up visits and attendance status | `user_id` FK, `care_plan_id` FK -> `care_plans.id` (`ON DELETE SET NULL`) |

---

## AI & Medical Safety Pipeline

1. **Upload Validation (`document_service.py`)**: Checks allowed extensions (`.pdf`, `.jpg`, `.jpeg`, `.png`), size limit (`<= 10 MB`), and file magic bytes before writing with a UUID filename.
2. **Text Extraction (`document_service.py`)**: Extracts text from native PDFs via **PyMuPDF** (`pymupdf`); if text is empty/insufficient or the input is an image, falls back to **Tesseract OCR**. Blank/unreadable documents return `422`.
3. **Structured AI Summarization (`ai_service.py`)**: Calls Gemini (`gemini-2.5-flash` by default) using `response_mime_type="application/json"` and `response_schema=GeminiCarePlanPayload` at `temperature=0.1`. Prompts prohibit inventing medicines, dosages, durations, or dates.
4. **Deterministic Validation (`validation_service.py`)**: Normalizes and verifies every returned medication name, numeric dosage (`500 mg`, `10 mg`, etc.), and follow-up date against the extracted source text, flagging mismatches (`Needs Review`) or missing details (`Incomplete Source Information`).

---

## Testing & Verification

### Backend Automated Tests (`pytest`)

Run the test suite (uses an isolated temporary SQLite database and mocked Gemini responses for deterministic CI execution):

```bash
cd backend
pytest -v tests
```

Observed results (`backend/.venv/bin/pytest -v backend/tests`):
- `test_health_and_auth.py`: 3 passed (health endpoint, register/login/me flow, unauthorized guards)
- `test_isolation_and_crud.py`: 1 passed (reminders & appointments CRUD + strict cross-user isolation)
- `test_documents_ai_and_validation.py`: 6 passed (bad file rejection, PDF pipeline, Hindi care plan & AI error handling, OCR + blank image rejection, deterministic validation rules, duplicate care plan uniqueness)
- **Total**: **10 passed**

### Frontend TypeScript Check & Production Build

```bash
# Type-check
npm --prefix frontend run lint

# Production bundle (outputs to frontend/dist/)
npm --prefix frontend run build
```

---

## Security & Privacy Architecture

- **Password & Token Security**: Passwords hashed with `bcrypt`; API sessions protected by `HS256` JWT Bearer tokens. Frontend stores tokens strictly in JavaScript memory (`frontend/src/services/api/apiClient.ts`) rather than `localStorage`.
- **Server-Side Secrets**: `GEMINI_API_KEY`, `DATABASE_URL`, and `JWT_SECRET_KEY` live exclusively in `backend/.env` (gitignored) and are never bundled into frontend assets.
- **Strict Tenant Isolation**: Every query on reports, care plans, medications, reminders, and appointments filters explicitly by `user_id == current_user.id`.
- **Upload Hardening**: Uploaded medical documents are verified by magic bytes, assigned random UUID filenames, and kept out of `frontend/public/`.
- **Safe Error Handling**: Centralized exception handlers (`backend/app/core/exceptions.py`) prevent stack traces or database credentials from leaking in API responses.

---

## Deployment Configuration

- **Frontend (Vercel)** — `/vercel.json` is configured with `cd frontend && npm install && npm run build` and output directory `frontend/dist`. Set `VITE_API_BASE_URL` to your deployed FastAPI `/api/v1` endpoint.
- **Backend (Render)** — `/backend/render.yaml` is configured with `rootDir: backend`, `alembic upgrade head` pre-deploy command, `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, and `/health` check. Set `DATABASE_URL`, `GEMINI_API_KEY`, and `CORS_ORIGINS` in Render environment settings.
- **Live Hosting Status**: Configuration files are ready; live production URLs are not yet deployed.

---

## Roadmap

- Configure hosted MySQL 8 instance and deploy backend (Render) + frontend (Vercel)
- Add automated prompt/validation evaluation test cases in `ai/evaluation/`
- Capture verified UI screenshots across desktop and mobile views in `docs/screenshots/`
- Add optional SMS/WhatsApp medication reminder delivery service
- Expand regional Indian language translations beyond English and Hindi

---

## Medical Disclaimer

**CHIKITSAK is an informational patient comprehension aid, not a medical device or substitute for professional medical advice.**
Always follow the original hospital discharge summary and prescription provided by your treating physician. Do not start, stop, or alter any medication dosage without consulting a qualified healthcare provider. In case of medical emergencies or severe warning symptoms, seek immediate emergency medical care.

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feat/your-feature`).
2. Keep frontend (`frontend/`) and backend (`backend/`) cleanly separated and independently runnable.
3. Run `npm --prefix frontend run lint`, `npm --prefix frontend run build`, and `backend/.venv/bin/pytest -v backend/tests` before opening a pull request.
4. Never commit `.env` files, credentials, or real patient medical documents.

---

## License

A `LICENSE` file has not yet been selected or added to this repository. Until an explicit open-source or proprietary license is chosen by the project maintainers, all rights remain reserved.

---

## Acknowledgements

- **Google Gemini API (`google-genai`)** for structured bilingual discharge simplification
- **FastAPI**, **SQLAlchemy**, and **Alembic** for modular Python backend and database migrations
- **PyMuPDF** and **Tesseract OCR** for document and prescription text extraction
- **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons** for the patient-friendly interface
