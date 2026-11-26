# CHIKITSAK Local Setup Guide

## Prerequisites
- **Node.js** 20+ and **npm**
- **Python** 3.11+ (3.12+ recommended)
- **MySQL 8** (or MariaDB) running on `localhost:3306`
- **Tesseract OCR** installed on the host OS (`tesseract-ocr` on Linux, Homebrew `tesseract` on macOS, UB Mannheim Tesseract installer on Windows)
- **Google Gemini API Key** (for live AI care plan generation)

---

## Quick Setup on Windows (PowerShell)

1. Run the setup helper:
   ```powershell
   .\scripts\setup.ps1
   ```
2. Create the MySQL database and user:
   ```sql
   CREATE DATABASE IF NOT EXISTS chikitsak CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'chikitsak_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
   GRANT ALL PRIVILEGES ON chikitsak.* TO 'chikitsak_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Edit `backend\.env` and set `DATABASE_URL`, `JWT_SECRET_KEY`, and `GEMINI_API_KEY` (plus `TESSERACT_CMD` on Windows if `tesseract.exe` is not on `PATH`).
4. Run Alembic database migrations:
   ```powershell
   cd backend
   .\.venv\Scripts\Activate.ps1
   alembic upgrade head
   cd ..
   ```
5. Start both servers:
   ```powershell
   .\scripts\start.ps1
   ```
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000` (Docs at `http://localhost:8000/docs`)

---

## Manual Setup (Linux / macOS)

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit backend/.env with DATABASE_URL, JWT_SECRET_KEY, GEMINI_API_KEY
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Confirm VITE_API_BASE_URL="http://localhost:8000/api/v1"
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Purpose | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy MySQL connection string | `mysql+pymysql://chikitsak_user:PASS@127.0.0.1:3306/chikitsak` |
| `JWT_SECRET_KEY` | Secret key for HS256 JWT signing | Random 32+ char secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiration window in minutes | `60` |
| `GEMINI_API_KEY` | Server-side Google Gemini API key | `AIza...` |
| `GEMINI_MODEL` | Gemini model ID | `gemini-2.5-flash` |
| `UPLOAD_DIR` | Private local upload directory | `storage/uploads` |
| `MAX_UPLOAD_SIZE_MB` | Maximum report upload size | `10` |
| `TESSERACT_CMD` | Optional path to `tesseract` binary | `C:\Program Files\Tesseract-OCR\tesseract.exe` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:3000,http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Purpose | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend REST API v1 base URL | `http://localhost:8000/api/v1` |
