# Job Application Copilot

A web app that turns your CV into a structured profile and searches job
listings from four sources at once. You stay in control: the app never
applies on your behalf.

> Status: work in progress.

![Landing](docs/screenshots/landing.png)

## Features

- **Profile extraction**: upload a CV (PDF, DOCX, or TXT) and get a
  structured profile, built with Gemini structured output in a LangGraph
  pipeline.
- **Auth and saved profiles**: email/password sign-in with Supabase Auth.
  Each profile is stored per user behind row-level security.
- **Job search**: queries RemoteOK, Himalayas, Adzuna, and Gemini grounded
  search in parallel, then merges and deduplicates the results.

## Screenshots

| Landing | Job search |
|---|---|
| ![Landing](docs/screenshots/landing.png) | ![Jobs](docs/screenshots/jobs.png) |

![Login](docs/screenshots/login.png)

## Tech stack

Next.js 16 (App Router, TypeScript, Tailwind v4) · FastAPI · LangGraph ·
Gemini API · Supabase (Auth and Postgres)

## Running locally

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set GEMINI_API_KEY, Supabase, Adzuna keys
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_SUPABASE_URL and ANON_KEY
npm install && npm run dev
```

Supabase: run `backend/supabase/*.sql` in the SQL Editor. Turn off
"Confirm email" if you want sign-up to log users in right away.

## Roadmap

Job validation · match scoring · tailored CV and cover letter ·
application tracker.
