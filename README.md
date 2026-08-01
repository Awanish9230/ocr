# AutoParse - AI Financial Document Parser & Report Generator

AutoParse is an enterprise-level, production-ready AI Financial Document Parser built entirely using 100% FREE tools, APIs, and hosting. It handles Authentication, OCR, AI Classification, Parsing, Validation, Manual Review, Dashboards, Reports, and Audit Logging.

## 🚀 Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, Shadcn UI, Zustand, TanStack Query, Recharts.
- **Backend:** Python 3.13+, FastAPI, SQLAlchemy, Alembic, Uvicorn.
- **Database:** PostgreSQL (Supabase / Neon) via pg8000.
- **Storage:** Cloudinary (Free Tier).
- **AI & OCR:** Gemini API (Primary Parser), Groq API (Fast Fallback), Tesseract.js / pdf.js.

## 📂 Folder Structure

The project uses a decoupled frontend/backend architecture:

- `app/` - Next.js App Router (Frontend pages)
- `components/` - Global reusable UI components (Shadcn)
- `backend/` - Python FastAPI Backend
  - `core/` - JWT security, config, database engines
  - `api/` - FastAPI Routers (auth, documents, etc.)
  - `models/` - SQLAlchemy Database Models
  - `schemas/` - Pydantic Validation Schemas
  - `services/` - Business Logic (AI Parsing, Uploads)
  - `alembic/` - Database Migrations

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql+pg8000://user:pass@host:5432/postgres

# JWT
JWT_SECRET=super_secret_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_at_least_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Providers
GEMINI_API_KEYS=key1,key2,key3
GROQ_API_KEYS=key1,key2

# Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development
```

## 🏃‍♂️ Running Locally

Since the architecture is decoupled, you must run both servers simultaneously in two separate terminals.

### 1. Start the FastAPI Backend
Open a new terminal in the project root (`ocr` directory, DO NOT `cd backend`):
```powershell
.\.venv\Scripts\Activate.ps1
uvicorn backend.main:app --reload --port 8000
```
*The backend API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).*

### 2. Start the Next.js Frontend
Open another terminal in the project root:
```powershell
npm run dev
```
*The frontend will be available at [http://localhost:3000](http://localhost:3000).*

## 🧠 AI Key Rotation & Fallback

The system implements robust API management. 
If Gemini exhausts its quota or hits a rate limit, the system automatically rotates to the next available API key. If all Gemini keys fail, the pipeline automatically falls back to Groq for extraction.
