# Craftr

> **All-in-one SaaS platform for developers and recruiters** — job portal, AI-powered live interview system, in-browser code editor, resume builder & analyzer, and Excalidraw collaboration. Build, practice, evaluate, and hire — all in one seamless ecosystem.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [External Services & Integrations](#external-services--integrations)
- [Subscription & Credit System](#subscription--credit-system)
- [Contributing](#contributing)

---

## Overview

Craftr is a full-stack TypeScript monorepo SaaS application designed to serve both **developers** who want to practice and get hired, and **recruiters** who want to evaluate candidates efficiently. It brings together several powerful tools under one roof:

- Browse and apply to real jobs from a live job feed
- Track all your job applications with status and notes
- Take AI-generated mock interviews and receive detailed scored feedback
- Prepare for interviews with AI-curated question banks and deep explanations
- Analyze your resume against any job description using AI
- Collaborate using an embedded Excalidraw whiteboard

---

## Features

### Job Portal
- Browse a live job feed refreshed every hour via a scheduled background job
- Filter and search jobs by keyword, role, and skills
- View detailed job descriptions including salary range, employment type, required skills, and company metadata

### Application Tracker
- Create and manage job applications with fields for company, role, salary, location, source, and link
- Update application status through a defined workflow: `APPLIED → SHORTLISTED → INTERVIEW → REJECTED → OFFER`
- Attach notes to any application and edit or delete them independently

### AI Interview System
- Create custom interview configurations: role, domain, experience level, duration, and difficulty
- AI generates a unique set of theory-based interview questions calibrated to your setup
- Timed interview sessions with per-question answer submission
- Retry sessions with guaranteed non-repeated questions
- AI evaluates all answers on completion and returns: score (0–100), rating (Poor/Average/Good/Excellent), correct count, overall feedback, strengths, and weaknesses
- Full session history and per-session results

### AI Preparation Sessions
- Create a preparation session by specifying role, experience, and job description
- AI generates 10+ deep-dive questions covering the specified topics
- Each question includes a short interview-ready answer plus a detailed explanation (200+ words) with optional code examples and complexity analysis
- Generate additional unique questions on demand, with duplicate-avoidance logic
- Pin important questions and add personal notes

### Resume Analyzer
- Upload a PDF resume and provide a job description
- Resume is uploaded to Cloudinary for storage and text is extracted automatically
- AI analyzes the resume against the job description and returns:
  - Overall score and ATS compatibility score
  - Tone, content, structure, and skills sub-scores with feedback
  - Executive summary and actionable improvement suggestions
- View full feedback breakdowns on a dedicated feedback page
- Supports multiple resume uploads and analysis history

### Authentication & User Management
- Authentication powered by Clerk (supports sign up, login, session management)
- On first login, a user record and free subscription with 100 credits is automatically created
- Role-based access: `USER` and `RECRUITER`

### Subscription System
- Three plans: `FREE`, `PRO`, `PREMIUM`
- Credit-based usage model
- Each new user receives 100 free credits on registration

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server and REST API |
| TypeScript | Type-safe backend development |
| Prisma ORM | Database modeling and queries |
| PostgreSQL | Relational database |
| Clerk (`@clerk/express`) | Authentication and user sessions |
| OpenRouter API | AI model routing (GPT-4o-mini via OpenAI) |
| Google Generative AI (`@google/genai`) | Additional AI integrations |
| Cloudinary | PDF resume file storage |
| `pdf-parse` | Text extraction from uploaded PDFs |
| `piston-client` | In-browser code execution (sandboxed) |
| `ws` | WebSocket support |
| `multer` | Multipart file upload handling |
| `zod` | Request body validation |
| `node-cron` / `setInterval` | Scheduled job feed refresh |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite 8 | UI framework and build tool |
| TypeScript | Type-safe frontend development |
| React Router v7 | Client-side routing |
| Clerk (`@clerk/react`) | Frontend auth components and hooks |
| Tailwind CSS v4 | Utility-first styling |
| MUI (Material UI v7) | Component library |
| Framer Motion | Animations and transitions |
| Lenis | Smooth scroll experience |
| Axios | HTTP client for API calls |
| React Icons | Icon library |

---

## Architecture

```
Craftr/
├── backend/          # Express REST API + Prisma + AI services
└── frontend/         # React SPA (Vite + Tailwind + Clerk)
```

The application follows a clean **monorepo** structure with separate `package.json` files for each side. The backend exposes a REST API that the frontend consumes via Axios. Authentication is handled end-to-end by Clerk — the frontend uses Clerk's React SDK for session tokens, and the backend validates them using Clerk's Express middleware.

**Request lifecycle:**
1. User logs in via Clerk on the frontend
2. Frontend attaches Clerk session token to all API requests
3. `clerkMiddleware()` on the backend validates the token
4. `requireAuth()` guards protect individual routes
5. `attachUser` middleware resolves the Clerk ID to the internal Prisma `User` record and attaches it to `req.user`
6. Controllers delegate to service layer → Prisma database operations

---

## Database Schema

Managed via Prisma. Database: **PostgreSQL**.

### Models

#### `User`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `clerkId` | String | Unique, from Clerk auth |
| `role` | Enum (Role) | `USER` or `RECRUITER` |
| `createdAt` | DateTime | Auto |

Relations: `subscription`, `applications`, `interview`, `interviewSession`, `preperationSession`, `resume`

#### `Subscription`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | Unique FK to User |
| `credits` | Int | Default: 0 |
| `plan` | Enum (Plan) | `FREE`, `PRO`, `PREMIUM` |

#### `Application`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `userId` | String | FK to User |
| `company` | String | |
| `role` | String | |
| `link` | String | Application URL |
| `source` | String | Where you found the job |
| `status` | Enum (ApplicationStatus) | `APPLIED`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`, `OFFER` |
| `location` | String | |
| `salary` | String | |

Relations: `notes`

#### `Note`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `applicationId` | String | FK to Application (cascades on delete) |
| `content` | String | Note body |

#### `Interview`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `userId` | String | FK to User |
| `title` | String | |
| `domain` | String | e.g., Frontend, Backend |
| `role` | String | e.g., Software Engineer |
| `experience` | Int | Years of experience |
| `durationMinutes` | Int | 15, 30, 45, or 60 |
| `interviewType` | String | |
| `codingEnabled` | Boolean | Default: false |

Relations: `sessions`

#### `InterviewSession`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `userId` | String | FK to User |
| `interviewId` | String | FK to Interview |
| `attempt` | Int | Default: 1 |
| `status` | String | Session state |
| `difficulty` | String | |
| `endedAt` | DateTime? | Null until completed |

Relations: `questions`, `results`

#### `SessionQuestion`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `sessionId` | String | FK to InterviewSession |
| `type` | String | `THEORY` |
| `question` | String | |
| `answer` | String? | Model answer |
| `userAnswer` | String? | Candidate's response |
| `isCorrect` | Boolean? | Set on evaluation |
| `order` | Int | Display order |

#### `InterviewSessionResult`
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `sessionId` | String | Unique FK to InterviewSession |
| `score` | Int | 0–100 |
| `rating` | String | Poor / Average / Good / Excellent |
| `correctCount` | Int | |
| `totalCount` | Int | |
| `feedback` | String | AI-generated summary |
| `strengths` | String? | |
| `weaknesses` | String? | |
| `timeTaken` | Int? | Seconds |

#### `PreparationSession`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `userId` | String | FK to User |
| `role` | String | |
| `experience` | Int | |
| `description` | String | Job description or context |

Relations: `topics`, `questions`

#### `Topic`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `name` | String | Topic label |
| `sessionId` | String | FK to PreparationSession |

#### `PreparationQuestion`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `question` | String | |
| `answer` | String? | Short answer |
| `note` | String? | User's personal note |
| `isPinned` | Boolean | Default: false |
| `explaination` | String | JSON-stringified detailed explanation |
| `sessionId` | String | FK to PreparationSession |

#### `Resume`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `userId` | String | FK to User |
| `companyName` | String? | |
| `jobTitle` | String? | |
| `jobDescription` | String | Required for AI analysis |
| `resumeUrl` | String | Cloudinary URL |
| `extractedText` | String (Text) | Raw extracted content |
| `status` | String | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |

Relations: `feedback`

#### `Feedback`
| Field | Type | Notes |
|---|---|---|
| `id` | String (uuid) | Primary key |
| `resumeId` | String | Unique FK to Resume |
| `overallScore` | Int | 0–100 |
| `atsScore` | Int | ATS compatibility score |
| `tone` | Json | `{ score, feedback }` |
| `content` | Json | `{ score, feedback }` |
| `structure` | Json | `{ score, feedback }` |
| `skills` | Json | `{ score, missing[], feedback }` |
| `summary` | String? | AI executive summary |
| `suggestions` | Json? | Array of improvement tips |

---

## API Reference

Base URL: `http://localhost:5000`

All protected routes require a valid Clerk session token in the `Authorization` header.

---

### Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Returns "API running" |

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/sync-user` | Yes | Sync Clerk user to DB; creates User + Subscription on first login |

---

### Jobs — `/api/jobs`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/jobs` | No | Get full in-memory job list (refreshed every hour) |
| GET | `/api/jobs/search` | No | Search jobs by query params |
| GET | `/api/jobs/:id` | No | Get a single job by ID |

> Jobs are fetched from an external Jobs API, processed, and held in memory. The scheduler calls `fetchJobs()` on startup and every 60 minutes.

---

### Applications — `/api/applications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/applications` | Yes | Create a new job application |
| GET | `/api/applications` | Yes | Get all applications for the authenticated user |
| GET | `/api/applications/:id` | Yes | Get a single application by ID |
| PATCH | `/api/applications/:applicationId` | Yes | Update application status, salary, location, etc. |
| POST | `/api/applications/:applicationId/notes` | Yes | Add a note to an application |
| GET | `/api/applications/:applicationId/notes` | Yes | Get all notes for an application |
| PATCH | `/api/applications/:applicationId/notes/:noteId` | Yes | Edit a note |
| DELETE | `/api/applications/:applicationId/notes/:noteId` | Yes | Delete a note |

**Create Application Body:**
```json
{
  "company": "string",
  "role": "string",
  "link": "string",
  "source": "string",
  "location": "string",
  "salary": "string"
}
```

**Update Application Body (partial):**
```json
{
  "status": "APPLIED | SHORTLISTED | INTERVIEW | REJECTED | OFFER",
  "company": "string",
  "role": "string",
  "location": "string",
  "salary": "string"
}
```

---

### Interviews — `/api/interviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/interviews` | Yes | Create a new interview configuration |
| GET | `/api/interviews` | Yes | Get all interviews for the user |
| GET | `/api/interviews/:interviewId` | Yes | Get interview details by ID |
| DELETE | `/api/interviews/:interviewId` | Yes | Delete an interview and all sessions |

**Create Interview Body:**
```json
{
  "title": "string",
  "domain": "string",
  "role": "string",
  "experience": 2,
  "durationMinutes": 30,
  "interviewType": "string",
  "codingEnabled": false
}
```

---

### Interview Sessions — `/api/interviews/:interviewId/sessions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/sessions/start` | Yes | Start a new session — AI generates questions |
| POST | `/sessions/:sessionId/end` | Yes | End a session — AI evaluates all answers |
| POST | `/sessions/:sessionId/retry` | Yes | Retry with new non-repeated questions |
| GET | `/sessions` | Yes | Get all sessions for an interview |
| GET | `/sessions/:sessionId` | Yes | Get session details |
| DELETE | `/sessions/:sessionId` | Yes | Delete a session |
| POST | `/sessions/:sessionId/questions/:questionId/answer` | Yes | Submit an answer to a specific question |
| GET | `/sessions/:sessionId/questions` | Yes | Get all questions in a session |
| GET | `/sessions/:sessionId/result` | Yes | Get the scored result for a completed session |

**Submit Answer Body:**
```json
{
  "answer": "string"
}
```

**Start Session Body:**
```json
{
  "difficulty": "EASY | MEDIUM | HARD"
}
```

---

### Preparation — `/api/preparations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/preparations/sessions` | Yes | Create a preparation session + generate 10 questions |
| GET | `/api/preparations/sessions` | Yes | Get all preparation sessions for the user |
| GET | `/api/preparations/sessions/:sessionId` | Yes | Get a session with all questions and topics |
| DELETE | `/api/preparations/sessions/:sessionId` | Yes | Delete a session and all its questions |
| POST | `/api/preparations/sessions/:sessionId/questions` | Yes | Generate more unique questions for an existing session |

**Create Preparation Session Body:**
```json
{
  "role": "string",
  "experience": 2,
  "description": "string",
  "topics": ["React", "TypeScript", "System Design"]
}
```

---

### Resume Analyser — `/api/analyse`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/analyse/upload` | Yes | Upload resume PDF + job description metadata |
| POST | `/api/analyse/:id` | Yes | Trigger AI analysis on an uploaded resume |
| GET | `/api/analyse` | Yes | Get all resumes for the user |
| GET | `/api/analyse/:id` | Yes | Get a single resume with feedback |
| DELETE | `/api/analyse/:id` | Yes | Delete a resume record |

**Upload Resume (multipart/form-data):**
```
resume: File (PDF)
jobDescription: string
companyName: string (optional)
jobTitle: string (optional)
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/craftr

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...

# AI - OpenRouter (GPT-4o-mini)
OPENROUTER_API_KEY=sk-or-...

# Cloudinary (Resume Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# External Jobs API
JOBS_API=https://your-jobs-api-endpoint.com/jobs
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:5000
```

---

## Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PostgreSQL** v14 or higher (local or hosted)
- A **Clerk** account and application — [clerk.com](https://clerk.com)
- An **OpenRouter** account — [openrouter.ai](https://openrouter.ai)
- A **Cloudinary** account — [cloudinary.com](https://cloudinary.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/ShadowScript06/Craftr.git
cd Craftr
```

---

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create the `.env` file as described in the [Environment Variables](#environment-variables) section.

Run database migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma client:

```bash
npx prisma generate
```

---

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
```

Create the frontend `.env` file as described above.

---

## Running the Application

### Development Mode

**Start the backend** (from the `backend/` directory):

```bash
npm run dev
```

The backend starts at `http://localhost:5000`. The job scheduler starts automatically and populates the in-memory job list.

**Start the frontend** (from the `frontend/` directory):

```bash
npm run dev
```

The frontend starts at `http://localhost:5173` (Vite default).

---

### Production Build

**Build the backend:**

```bash
cd backend
npm run build
npm start
```

**Build the frontend:**

```bash
cd frontend
npm run build
```

The frontend outputs to `frontend/dist/`. The included `vercel.json` configures it for Vercel deployment with SPA routing support.

---

## Project Structure

```
Craftr/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Full database schema
│   │   └── migrations/                # Migration history
│   └── src/
│       ├── app.ts                     # Express app setup, middleware, route registration
│       ├── server.ts                  # HTTP server entrypoint, scheduler bootstrap
│       ├── prisma/
│       │   └── client.ts              # Prisma client singleton
│       ├── config/
│       │   ├── lib/
│       │   │   └── cloudinary.ts      # Cloudinary SDK config
│       │   └── Validations/           # Zod schemas for all request bodies
│       ├── middleware/
│       │   ├── attachUser.ts          # Resolves Clerk ID → Prisma User
│       │   ├── inputValidator.ts      # Zod validation middleware
│       │   └── upload.ts              # Multer memory storage config
│       ├── modules/
│       │   ├── ai/
│       │   │   ├── ai.service.ts      # Interview generation, evaluation, resume analysis
│       │   │   └── preparations.ai.service.ts  # Preparation question generation
│       │   ├── analyser/              # Resume upload, analysis, feedback
│       │   ├── application/           # Application CRUD + notes
│       │   ├── auth/                  # Clerk sync-user
│       │   ├── interview/             # Interview CRUD
│       │   ├── job/                   # In-memory job listing and search
│       │   ├── preparation/           # Preparation sessions and questions
│       │   └── session/               # Interview sessions, answers, results
│       ├── types/
│       │   ├── express.d.ts           # Express Request type extension
│       │   └── job.ts                 # Job data types
│       └── utils/
│           ├── data/job.ts            # fetchJobs() — external API integration
│           └── schedular/jobSchedular.ts  # Scheduled job refresh
│
└── frontend/
    ├── public/
    │   └── images/frames/             # Animation frame assets
    └── src/
        ├── App.tsx                    # Route definitions
        ├── main.tsx                   # App bootstrap + Clerk provider
        ├── components/
        │   ├── Navbar.tsx
        │   ├── ProtectedWrapper.tsx   # Auth guard HOC
        │   ├── ScrollAnimation.tsx
        │   ├── JobCard.tsx
        │   ├── applicationDetails/    # Notes, update modals, skeletons
        │   └── applicationTracker/   # App table rows, stat cards, create modal
        ├── pages/
        │   ├── LandingPage.tsx
        │   ├── LoginPage.tsx
        │   ├── SignupPage.tsx
        │   ├── DashBoard.tsx
        │   ├── JobsPage.tsx
        │   ├── JobDetail.tsx
        │   ├── ApplicationTracker.tsx
        │   ├── ApplicationDetail.tsx
        │   ├── CreateInterviewPage.tsx
        │   ├── InterviewDetail.tsx
        │   ├── Session.tsx
        │   ├── Preparations.tsx
        │   ├── PreparationSession.tsx
        │   ├── ResumeAnalyzerPage.tsx
        │   └── ResumeFeedbackPage.tsx
        └── types/                     # TypeScript interfaces for API responses
```

---

## External Services & Integrations

### Clerk — Authentication
Craftr uses [Clerk](https://clerk.com) for complete authentication. Clerk manages sign up, login, session tokens, and user identity. The backend uses `@clerk/express` to validate tokens and `getAuth(req)` to extract the user's `clerkId` from each request. A `POST /api/auth/sync-user` call on first login creates the corresponding database record.

### OpenRouter — AI (GPT-4o-mini)
All AI features route through [OpenRouter](https://openrouter.ai) using `openai/gpt-4o-mini`. This includes:
- Interview question generation (calibrated by role, domain, difficulty, duration, experience)
- Interview answer evaluation with scoring and feedback
- Retry question generation (guaranteed no repeats)
- Resume analysis against job descriptions

Prompts are carefully structured to enforce strict JSON-only output. All responses go through parsing and validation before being stored in the database.

### Google Generative AI
The `@google/genai` package is installed as an additional AI provider for future or supplementary AI tasks.

### Cloudinary — File Storage
[Cloudinary](https://cloudinary.com) is used to store uploaded resume PDFs. Files are streamed directly from Multer's in-memory buffer to Cloudinary using `streamifier`. The returned `secure_url` is stored in the database and used to display or re-process the resume.

### Piston — Code Execution
The `piston-client` package connects to the [Piston](https://github.com/engineer-man/piston) sandboxed code execution API, enabling in-browser code running for the coding part of the interview feature (currently in development/commented out).

### External Jobs API
Job listings are fetched from a configurable external API (`JOBS_API` env variable). The data is transformed into a normalized `Job` type and held in memory. The scheduler refreshes this data every hour so users always see current listings without hitting a database.

---

## Subscription & Credit System

Every new user is automatically enrolled in the `FREE` plan with **100 credits** upon first login.

| Plan | Credits | Features |
|---|---|---|
| FREE | 100 | Basic access to all features |
| PRO | TBD | Extended credits and limits |
| PREMIUM | TBD | Unlimited access |

The credit and plan system is modeled in the database and ready for billing integration (Stripe or similar).

---

## Frontend Routes

| Path | Component | Auth Required |
|---|---|---|
| `/` | LandingPage | No |
| `/login` | LoginPage | No |
| `/signup` | SignupPage | No |
| `/dashboard` | DashBoard | Yes |
| `/jobs` | JobsPage | Yes |
| `/jobs/:id` | JobDetail | Yes |
| `/applicationtracker` | ApplicationTracker | Yes |
| `/applicationtracker/:id` | ApplicationDetail | Yes |
| `/tests` | CreateInterviewPage | Yes |
| `/tests/:id` | InterviewDetail | Yes |
| `/tests/:id/session/:sessionId` | Session | Yes |
| `/preparations` | Preparations | Yes |
| `/preparations/:id` | PreparationSession | Yes |
| `/analyser` | ResumeAnalyzerPage | Yes |
| `/analyser/:id` | ResumeFeedbackPage | Yes |

All protected routes are wrapped in `ProtectedWrapper`, which checks Clerk's `useAuth()` state and redirects unauthenticated users to `/login`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please keep backend and frontend dependencies separate. Do not commit `.env` files.

---

## License

ISC License. See `backend/package.json` for details.

---

*Built by [ShadowScript06](https://github.com/ShadowScript06)*
