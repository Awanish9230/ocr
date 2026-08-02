# AutoParse - AI Financial Document Parser & Report Generator

## Project Overview

AutoParse is an enterprise-level, production-ready AI Financial Document Parser built entirely using 100% FREE tools, APIs, and hosting. It handles Authentication, OCR, AI Classification, Parsing, Validation, Manual Review, Dashboards, Reports, and Audit Logging. The system is designed to automate the extraction of structured data from financial documents, providing a reliable and robust pipeline with AI fallback mechanisms.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, Shadcn UI, Zustand, TanStack Query, Recharts.
- **Backend:** Python 3.13+, FastAPI, SQLAlchemy, Alembic, Uvicorn.
- **Database:** PostgreSQL (Supabase / Neon) via pg8000.
- **Storage:** Cloudinary (Free Tier).
- **AI & OCR:** Gemini API (Primary Parser), Groq API (Fast Fallback), Tesseract.js / pdf.js.

## Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd ocr
   ```

2. **Backend Setup:**
   - Create a virtual environment:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - Install dependencies (assuming a requirements.txt or pip install):
     ```powershell
     pip install -r backend/requirements.txt
     ```
   - Run database migrations:
     ```powershell
     alembic upgrade head
     ```
   - Run a script to seed the admin user (if applicable):
     ```powershell
     python create_admin.py
     ```

3. **Frontend Setup:**
   - Install Node.js dependencies:
     ```powershell
     npm install
     ```

## Environment Variables

Create a `.env` file in the root directory and populate it with the following keys:

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

## Folder Structure

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
- `lib/` - Shared frontend utilities and helpers
- `store/` - Zustand stores for global state
- `hooks/` - Custom React hooks

## API Documentation

The backend exposes an interactive OpenAPI (Swagger) documentation.

1. Ensure the FastAPI backend is running.
2. Navigate to [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.
3. You can test all endpoints, view request/response schemas, and authenticate directly from the UI.

## Deployment Guide

The decoupled architecture allows you to deploy the frontend and backend independently.

- **Database:** Set up a free PostgreSQL database on **Supabase** or **Neon**.
- **Backend:** Deploy the FastAPI backend on **Render**, **Railway**, or **Fly.io** using a standard Python ASGI setup (Uvicorn). Set the environment variables in the dashboard.
- **Frontend:** Deploy the Next.js frontend on **Vercel** or **Netlify**. Ensure the `NEXT_PUBLIC_API_URL` points to your deployed backend URL.
- **Storage:** Create a free account on **Cloudinary** and configure the storage keys.

## Assumptions

- Uploaded financial documents are relatively legible and not completely distorted.
- The free tiers of the utilized APIs (Gemini, Groq, Cloudinary) provide sufficient rate limits and storage for the expected scale.
- Database access is handled via `pg8000` driver to ensure compatibility across various PostgreSQL hosting providers without needing native C extensions in serverless environments.

## Known Limitations

- **Rate Limiting:** Free tier AI APIs may hit rate limits during heavy concurrent processing, triggering the fallback mechanism or delays.
- **File Size Limits:** Cloudinary's free tier has upload size restrictions for individual files.
- **OCR Accuracy:** Heavily handwritten or degraded documents might have reduced extraction accuracy compared to digitally generated PDFs.

## Future Improvements

- **Export Functionality:** Add the ability to export parsed reports to CSV, Excel, and PDF formats.
- **Role-Based Access Control (RBAC):** Implement granular permissions for multiple user roles (Viewer, Editor, Admin).
- **Webhooks:** Support webhooks to notify external systems when a document finishes processing.
- **Enhanced Local OCR:** Integrate more advanced open-source OCR models for improved offline extraction.
- **Batch Processing:** Provide a dedicated UI for uploading and processing hundreds of documents simultaneously.
