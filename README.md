# Soma-Agent

An AI learning platform for Ugandan secondary schools. Soma-Agent brings the NCDC O-Level syllabus, a subject-aware AI study partner and honest progress reporting into one calm workspace for students, teachers, guardians and school leaders.

**Live demo:** https://soma-agent.vercel.app

The app runs immediately with no configuration. A complete demo dataset and an offline curriculum tutor are bundled, so every screen and every AI flow works without Supabase or Gemini keys.

## Product tour

**Students** get a personal overview, a live syllabus mastery map, a searchable e-library and a 24/7 study partner. Practice checks are generated for any topic, marked instantly and explained one question at a time.

**Teachers** publish lesson notes to every class, watch mastery in real time, spot learners below the 50% line and draft specific, editable guidance with AI before sending it.

**Guardians** link a child once with their Soma code to see subject mastery, attendance, study rhythm, upcoming assessments and a plain-language weekly report.

**Academic offices** approve enrollments, open classrooms and assign subjects to teaching staff.

**Administrators** monitor adoption, people, the shared resource registry, AI availability and platform configuration across the network.

## AI that always answers

The tutor route tries Gemini first and falls back through a set of supported models. If no key is configured, or every provider call fails, the offline curriculum engine answers instead — detecting the topic, explaining it at O-Level depth, and returning follow-up suggestions. Quizzes follow the same pattern with a curated question bank, so a demo never stalls on a network error.

## Demo access

Open the app and choose any role on the sign-in screen. Every demo account uses the password below.

| Role | Email | Password |
| --- | --- | --- |
| Student | `amina@gayaza.ac.ug` | `soma2026` |
| Teacher | `teacher@gayaza.ac.ug` | `soma2026` |
| Guardian | `parent@gayaza.ac.ug` | `soma2026` |
| Academic office | `academic@gayaza.ac.ug` | `soma2026` |
| Administrator | `admin@gayaza.ac.ug` | `soma2026` |

To explore the guardian experience, link the demo child with the Soma code `SOMA-4821`.

## Tech stack

- Next.js 15 with the App Router and React 19
- TypeScript
- Tailwind CSS with a custom design system
- Recharts for progress analytics
- Supabase for optional live data and authentication
- Google Gemini for optional model-generated tutoring

## Getting started

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. No environment file is needed for the demo.

## Environment variables

Copy the example file when you want to connect live services:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL. Omit to use the demo dataset. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key. |
| `GEMINI_API_KEY` | No | Enables Gemini-generated tutoring and quizzes. |
| `NEXT_PUBLIC_APP_URL` | No | Canonical app URL used for links and metadata. |

Services detect missing keys and fall back to demo data automatically. A failed query also falls back rather than breaking a screen.

## Database

The optional PostgreSQL schema lives in [`supabase_logic.sql`](./supabase_logic.sql). Run it in the Supabase SQL editor before supplying Supabase credentials. The demo dataset remains the source of truth until both Supabase variables are present.

## Project structure

```text
app/                  App Router pages, metadata and AI routes
  api/ai/chat/        Tutor endpoint with model fallbacks
  api/ai/quiz/        Mastery-check endpoint with offline bank
components/           Role dashboards, login and shared UI primitives
  ui/                 Shell, Modal, Markdown, ChatPanel, QuizModal and more
lib/ai/               Gemini client, offline tutor engine and quiz bank
lib/demo/             Seeded accounts, resources, progress and analytics
lib/services/         Demo-aware data and session services
lib/supabase/         Optional Supabase client and generated types
```

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm start       # serve the production build
npm run lint    # lint the project
```

## Deployment

Any Node host works. On Vercel, import the repository, keep the default Next.js settings, then add environment variables only if you want live Supabase or Gemini. Without them the deployment runs in demo mode and remains fully explorable.

## Design notes

The interface uses a deep institutional navy, Ugandan crested-crane gold and leaf green. Typography is set in Inter and Plus Jakarta Sans. Layouts are built mobile-first with a persistent desktop sidebar, a thumb-friendly bottom bar on small screens, and full keyboard and focus support for dialogs.

---

Built for Ugandan classrooms. Gayaza High School is the reference school used throughout the demo dataset.
