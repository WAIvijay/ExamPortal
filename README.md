# Exam Portal and OMR Evaluation System

A full-stack web project for student exam management and OMR-based answer sheet evaluation.
The project contains:

- A Django REST backend for student/exam data and OMR scan APIs
- A React frontend for data entry, dashboard, and result workflows
- HTML OMR sheet templates inside `omr_sheets/`

## Features

- Student record management
- OMR answer upload and scanning flow
- Result calculation and storage
- Basic analytics/charts in frontend
- JWT-based authentication support in backend

## Tech Stack

- **Frontend:** React (Create React App)
- **Backend:** Django + Django REST Framework
- **Database:** SQLite (development)
- **OMR/Imaging:** OpenCV, Pillow, NumPy, pytesseract

## Project Structure

```text
Cart/
|- backend/
|  |- exam_portal/
|- frontend/
|- omr_sheets/
|- .gitignore
|- README.md
```

## Prerequisites

Install these before setup:

- Python 3.10+ (recommended)
- Node.js 18+ and npm
- Git
- Tesseract OCR (required for pytesseract-based OCR features)

## Local Setup

### 1) Clone Repository

```bash
git clone https://github.com/WAIvijay/ExamPortal.git
cd ExamPortal
```

### 2) Backend Setup (Django)

```bash
cd backend/exam_portal
python -m venv venv
```

Activate virtual environment:

- **Windows (PowerShell):**

```powershell
venv\Scripts\Activate.ps1
```

- **Windows (CMD):**

```cmd
venv\Scripts\activate.bat
```

Install dependencies and run server:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs on: `http://127.0.0.1:8000`

### 3) Frontend Setup (React)

Open a new terminal from project root:

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

## Project Workflow

1. Admin creates exam/student records from the frontend dashboard.
2. Student OMR sheets are collected using the provided templates.
3. OMR sheets are uploaded to the backend scanning endpoint.
4. Backend processes image data and extracts marked answers.
5. Results are calculated and stored in the database.
6. Frontend displays reports/analytics for review and export.

### Developer Workflow

1. Pull latest changes from `main`.
2. Run backend and frontend locally.
3. Implement feature/fix in small commits.
4. Test API and UI changes.
5. Push changes to GitHub.

## API Notes

Frontend currently calls backend at `http://127.0.0.1:8000`.
If backend host/port changes, update API URLs in `frontend/src/App.js`.

## OMR Sheets

Sample OMR templates are available in:

- `omr_sheets/omr_boo_versionA.html`
- `omr_sheets/omr_sheet_boo.html`

## Common Commands

### Backend

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### Frontend

```bash
npm test
npm run build
```

## Troubleshooting

- If OCR is not working, verify Tesseract installation and PATH.
- If CORS issue appears, check backend CORS settings.
- If frontend cannot fetch API, ensure Django server is running on port `8000`.

## License

This project is for academic/learning use. Add your preferred license if needed.

