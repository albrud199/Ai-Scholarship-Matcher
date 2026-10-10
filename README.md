# 🎓 ScholarMatch AI

[![CI](https://github.com/albrud199/Ai-Scholarship-Matcher/actions/workflows/ci.yml/badge.svg)](https://github.com/albrud199/Ai-Scholarship-Matcher/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ecf8e)

AI-powered scholarship discovery and application platform for international students.
Hybrid intelligence: a **deterministic, explainable matching engine** computes every score in code —
**Gemini** is used server-side only, to stream a grounded copilot, parse resumes into structured
profiles, and narrate match results. The AI can never silently change a number.

## Features

| Area | What it does |
|---|---|
| **Deterministic match engine** | Weighted, versioned scoring (academics 30%, experience 20%, research 15%, language 10%, fit 15%, readiness 10%) with hard-requirement gates, GPA normalization across 4.0/5.0/10.0/percentage scales, and per-factor evidence strings |
| **Grounded AI Copilot** | Streaming chat (`/api/chat`) grounded in retrieved context from the student's scholarships, profile, and applications — with inline citations and a deterministic RAG fallback when AI is unavailable |
| **AI resume parsing** | `POST /api/parse-resume` extracts structured profile fields (GPA, test scores, experience, publications) from raw CV text with strict no-invention prompts |
| **AI match explanation** | `POST /api/match-insight` narrates the engine's factor breakdown into strengths, gaps, and concrete action items |
| **Application tracker** | Full CRUD over RLS-protected Postgres tables: statuses, deadlines with urgency highlighting, notes |
| **Supabase backend** | Auth (OAuth + email), profile auto-creation trigger, Row Level Security on every table, private document storage bucket |
| **Quality gates** | TypeScript strict, ESLint, Vitest unit tests on matching/readiness/profile logic, GitHub Actions CI |

## Architecture

```text
┌─────────────┐   /api/chat (SSE stream)   ┌──────────────────┐
│  Browser     │ ─────────────────────────▶ │  Next.js server   │
│  (React 18)  │   /api/parse-resume        │  - Gemini calls   │
│              │   /api/match-insight       │  - key stays here │
└──────┬──────┘                            └──────────────────┘
       │ supabase-js (anon key only)
       ▼
┌──────────────────┐     RLS policies: users see only their own rows
│  Supabase        │
│  - auth.users    │──▶ profiles (trigger auto-creates)
│  - scholarships  │    (public catalog, read-only to users)
│  - applications  │──▶ documents, references (cascade)
│  - storage       │    private `documents` bucket
└──────────────────┘

Matching NEVER calls an LLM. src/lib/matching.ts is pure, tested code.
```

## Getting started

```bash
cd scholar-match-ai
npm install
cp .env.example .env.local   # fill in your Supabase + Gemini values
npm run dev
```

### Environment

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | safe to expose |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same | safe to expose (anon key) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) | **server-only** — never `NEXT_PUBLIC_` |

### Database setup

Run these in the Supabase SQL Editor, in order:

1. [`supabase/schema.sql`](scholar-match-ai/supabase/schema.sql) — profiles, auth trigger, RLS, storage bucket
2. [`supabase/02-schema.sql`](scholar-match-ai/supabase/02-schema.sql) — scholarship catalog (seeded with 10 real programs), applications tracker, documents, references

In **Authentication → URL Configuration** add your deployed URL and `https://YOUR-DOMAIN/auth/callback` to Redirect URLs.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` / `typecheck` | ESLint / strict TypeScript |
| `npm test` | Vitest unit tests (matching, readiness, profile) |

## Security model

- Gemini API key lives **only** in server environment; all AI traffic goes through this app's API routes.
- The publishable Supabase key is safe client-side because **every table is protected by Row Level Security** — a leaked anon key grants access to nothing but the public catalog.
- Matching scores are computed by deterministic code and are auditable; AI outputs are advisory narration only.

## Deployment

Deploy the `scholar-match-ai` folder to Vercel (Root Directory: `scholar-match-ai`), then set the three environment variables above in Project Settings.