# AutoParse - AI Financial Document Parser & Report Generator

AutoParse is an enterprise-level, production-ready AI Financial Document Parser built entirely using 100% FREE tools, APIs, and hosting. It handles Authentication, OCR, AI Classification, Parsing, Validation, Manual Review, Dashboards, Reports, and Audit Logging.

## 🚀 Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, Shadcn UI, Zustand, TanStack Query, Recharts.
- **Backend:** Next.js API Routes (Serverless Functions), TypeScript.
- **Database:** MongoDB Atlas (Free Tier) via Mongoose.
- **Storage:** Cloudinary (Free Tier).
- **AI & OCR:** Gemini API (Primary Parser), Groq API (Fast Fallback), Tesseract.js / pdf.js.
- **Deployment:** Vercel (Frontend & Serverless Backend).

## 📂 Folder Structure

The project uses a monolithic Next.js architecture with strict logical separation:

- `app/` - Next.js App Router (Frontend pages & API routes)
- `components/` - Global reusable UI components (Shadcn)
- `modules/` - Feature-specific frontend modules (auth, dashboard, review)
- `src/` - Backend Logic
  - `ai/` - Gemini/Groq integration, parsing pipelines, API key rotation
  - `config/` - Environment variables (Zod validated)
  - `database/` - MongoDB connection utility
  - `middlewares/` - Auth & Role verification
  - `models/` - Mongoose Schemas (User, Document, AuditLog, etc.)
  - `ocr/` - Tesseract & pdf.js integration
  - `storage/` - Cloudinary integration
  - `utils/` - JWT generation/verification
  - `validators/` - Business logic document validation

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/autoparse
JWT_SECRET=super_secret_jwt_key_at_least_32_chars
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_at_least_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEYS=key1,key2,key3
GROQ_API_KEYS=key1,key2
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

## 🛠️ Deployment Guide (Vercel)

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com) and create a New Project.
3. Import your GitHub repository.
4. Under **Environment Variables**, paste all the variables from your `.env`.
5. Click **Deploy**.
6. (Optional) In Vercel Settings -> Functions, ensure the region is close to your MongoDB Atlas region. Max duration on free tier is 10s.

## 🔐 API Documentation (Overview)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate & receive cookies | No |
| POST | `/api/auth/refresh` | Rotate access token | Yes |
| POST | `/api/auth/logout` | Revoke tokens | Yes |
| POST | `/api/documents/upload` | Upload & parse document (Sync) | Yes |
| GET | `/api/documents` | List documents (filters: status, type) | Yes |
| PUT | `/api/documents/:id/review`| Approve/Reject a parsed document | Yes (Analyst/Admin) |
| GET | `/api/dashboard` | Aggregated statistics & chart data | Yes |
| GET | `/api/reports/export` | Download CSV of documents | Yes |
| GET | `/api/audit` | Fetch system audit logs | Yes (Admin) |

## 🧠 AI Key Rotation & Fallback

The system implements robust API management in `src/ai/keyRotation.ts`. 
If Gemini exhausts its quota or hits a rate limit, the system automatically rotates to the next available API key. If all Gemini keys fail, the pipeline in `src/ai/parser.ts` automatically falls back to Groq for extraction.
