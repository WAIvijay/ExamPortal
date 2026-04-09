# Exam Portal — OMR evaluation & student dashboard

Django REST API + React UI for student records, OMR scanning (OpenCV + Google Gemini), and result charts.

## What you need installed

| Tool | Notes |
|------|--------|
| **Python 3.10+** | For Django backend |
| **Node.js 18+** (npm) | For React frontend |
| **GEMINI_API_KEY** | Required for **AI Scan** (`/api/scan-omr/`) and bulk PDF processing that uses Gemini for student fields |
| **Poppler (Windows)** | Only if you use **Bulk PDF** upload — [Poppler for Windows](https://github.com/oschwartz10612/poppler-windows/releases), then set `POPPLER_PATH` in `.env` to the `bin` folder |

OMR bubble detection uses **OpenCV** (included via `requirements.txt`). There is **no Tesseract** dependency in this codebase.

## Project layout

```text
backend/exam_portal/   Django project (manage.py, api/, .env)
frontend/              React app (CRA)
omr_sheets/            Printable HTML OMR templates
scripts/               PowerShell helpers (Windows)
```

## Quick start (Windows)

**Terminal 1 — backend**

```powershell
cd path\to\ExamPortal
.\scripts\start-backend.ps1
```

First time: copy env template and add your API key:

```powershell
cd backend\exam_portal
copy .env.example .env
# Edit .env — set GEMINI_API_KEY=...
```

**Terminal 2 — frontend**

```powershell
cd path\to\ExamPortal
.\scripts\start-frontend.ps1
```

Optional — copy `frontend/.env.example` to `frontend/.env.local` if the API is not on `http://127.0.0.1:8000`:

```powershell
cd frontend
copy .env.example .env.local
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://127.0.0.1:8000/api/  
- **Django admin:** http://127.0.0.1:8000/admin/

## Manual setup (any OS)

### Backend

```bash
cd backend/exam_portal
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit GEMINI_API_KEY
python manage.py migrate
python manage.py runserver
```

Optional sample data + Django users:

```bash
python manage.py setup_project
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Production build:

```bash
npm run build
```

## Environment variables

### Backend (`backend/exam_portal/.env`)

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | **Required** for scan endpoints that call Gemini |
| `POPPLER_PATH` | Poppler `bin` folder on Windows for PDF → image (bulk upload) |
| `DJANGO_SECRET_KEY` | Optional; defaults to dev key in `settings.py` |
| `DJANGO_DEBUG` | Optional; `True` / `False` |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | API origin, default `http://127.0.0.1:8000` |

## API (short)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/students/` | List students |
| POST | `/api/add/` | Add student |
| POST | `/api/scan-omr/` | Single OMR image (base64) |
| POST | `/api/scan-bulk/` | Multi-page PDF (base64) |

## OMR templates

Printable sheets: `omr_sheets/omr_sheet_boo.html`, `omr_sheets/omr_boo_versionA.html`.  
Backend bubble positions were calibrated from `omr_sheet_boo.html` (see `api/views.py`).

## Troubleshooting

- **`Gemini API key not configured`** — create `backend/exam_portal/.env` with `GEMINI_API_KEY`.
- **`PDF conversion failed`** — install Poppler on Windows and set `POPPLER_PATH`, or use single-image scan instead of bulk PDF.
- **Frontend cannot reach API** — check Django is on port 8000 and `REACT_APP_API_URL` matches.
- **CORS** — backend uses `CORS_ALLOW_ALL_ORIGINS = True` for local dev.

## License

Use for academic/learning; add your own license if you ship this publicly.
