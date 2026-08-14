# GOVGUIDE AI 🇿🇦

**Your intelligent guide to understanding government services.**

> Ask. Understand. Know what to do next.

GovGuide AI is an AI-powered public-service information assistant for South Africa. It answers
questions about government procedures, required documents, application steps, fees and processing
times in plain language — and links the official source behind every answer.

Built as a 1-month AI Bootcamp team project.

---

## Problem statement

Government information in South Africa is scattered across many departmental websites, written in
dense legal or administrative language, and often out of date. People make wasted trips to offices
because they arrive with the wrong documents or misunderstand eligibility rules.

## Objectives

- Explain government procedures in plain, simple language.
- Always show the official source and the date the information was last verified.
- Never invent fees, requirements, addresses or deadlines.
- Let anyone try the assistant with no sign-up, then keep their history if they create an account.

## Target users

First-time applicants, students, job seekers, small business owners, caregivers applying for
grants, and anyone helping a family member navigate a government process.

---

## Features (IMPLEMENTED)

### Landing page
Branded hero with the official GovGuide logo, the public-service problem, how the assistant works,
AI capabilities, trust and responsible-AI messaging, accessibility notes, featured services and a
call to action into **Ask GovGuide**.

### Guest chat — `/chat`
No account required. Suggested starter questions, conversational context, thinking state, error
handling, copy answer, thumbs up/down feedback, and a "Save this conversation" path that carries the
transcript into a new account on sign-up.

### Service explorer — `/services`, `/services/$slug`
Browsable, searchable directory of the verified services with category filters. Each detail page
lists documents, steps, fees, processing time, the responsible authority, the official URL and the
last-verified date.

### Authentication — `/auth`, `/reset-password`
Email + password sign-up, sign-in, sign-out, password reset, and persistent sessions. The
`/_authenticated/*` route subtree is gated and redirects unauthenticated visitors to `/auth`.

### Conversation management — `/dashboard`, `/c/$conversationId`, `/archived`
Create conversations, send messages, receive AI answers with sources, auto-generated titles,
sidebar history, search across conversations, rename, archive, restore and delete.

### Profile and settings — `/settings`
Edit display name; appearance switch for Light / Dark / System (System follows the OS/browser
preference); danger zone to delete all conversations behind an explicit confirmation; sign out.

### Usage — `/usage`
AI response count plus input, output and total tokens, aggregated from the token metadata the AI
provider returns on each response. No values are estimated or fabricated.

### About — `/about`
Accuracy rules, source-tracing methodology and accessibility commitments.

## Planned / future
See [docs/FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md) — multilingual answers (isiZulu, isiXhosa,
Afrikaans, Sesotho), voice input, document checklists as downloadable PDFs, office locator, semantic
(vector) retrieval, and an admin console for maintaining verified content.

---

## AI assistant logic

Retrieval-grounded generation: the user's question is matched against the verified service knowledge
base (keyword + synonym mapping, e.g. "identity" → `smart-id`), the matching verified records are
injected into the system prompt as the only permitted factual context, and the model answers from
that context. Matched records are returned to the UI as source citations.

The system prompt follows a fixed, versioned structure:

```text
ROLE → CONTEXT → TASK → CONSTRAINTS → BEHAVIOUR → OUTPUT FORMAT
```

Details: [docs/AI_LOGIC.md](docs/AI_LOGIC.md), [docs/PROMPT_ENGINEERING.md](docs/PROMPT_ENGINEERING.md).

## Responsible AI

GovGuide AI is an **informational assistant, not an official government authority**. It does not
invent fees, office addresses, requirements, eligibility rules, deadlines, procedures or policies.
When something cannot be verified it says so and points the user to the official source. A
disclaimer is shown on the landing page, in the chat composer and under every answer.

---

## UI/UX

Premium public-service aesthetic — glassmorphism and frosted surfaces, gradient mesh backgrounds,
ambient glow, layered depth, floating cards, soft shadows, generous whitespace and calm purposeful
motion. All colour is expressed as semantic OKLCH design tokens in `src/styles.css` with a full dark
theme. Decorative motion is reduced under `prefers-reduced-motion`. Fully responsive across desktop,
tablet and mobile. See [docs/UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md).

## Technology stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR, file-based routing) |
| Build | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + OKLCH design tokens |
| UI primitives | Radix UI / shadcn-style components, lucide-react, sonner |
| Data fetching | TanStack Query + route loaders |
| Backend logic | TanStack `createServerFn` server functions |
| Database & auth | Supabase (PostgreSQL, Auth, Row Level Security) |
| AI | Lovable AI Gateway (Gemini-class model) |
| Hosting | Lovable (edge/worker runtime) |

## Architecture

```text
Browser (React 19 / TanStack Router)
        │  typed RPC (createServerFn)
        ▼
Server functions  ──►  Supabase (Postgres + RLS, Auth)
        │
        └──────────►  AI Gateway (chat completion + token usage)
```

See [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md).

## Database

`government_services`, `knowledge_sources`, `faq_entries`, `chat_feedback`, `profiles`,
`conversations`, `messages`. Row Level Security is enabled on every table; user-owned rows are
scoped to `auth.uid()`. See [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md).

## Security

Authorization is enforced in Postgres via RLS, not in the frontend. No secret keys live in the
repository — only the Supabase project URL and the publishable (anon) key, which are client-safe by
design. Model and service-role credentials are backend secrets injected at runtime.
See [docs/SECURITY.md](docs/SECURITY.md).

## Testing

Manual test matrix covering landing, guest chat, auth, conversations, settings, danger zone, usage
and responsive breakpoints: [docs/TESTING.md](docs/TESTING.md). Automated tests are **planned**.

---

## Installation

```sh
git clone https://github.com/Thenjiwembi/GovGuide-AI.git
cd GovGuide-AI
npm install
npm run dev        # http://localhost:8080
```

Scripts defined in `package.json`: `dev`, `build`, `build:dev`, `preview`, `lint`, `format`.

## Environment variables

Client-safe (publishable) values, required to run locally:

```sh
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_PROJECT_ID=<project-ref>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Server-side secrets (never committed, set in the hosting environment):

```sh
LOVABLE_API_KEY=        # AI Gateway access
```

## Deployment

The app is deployed from Lovable to the edge runtime. `npm run build` produces the production
bundle; Supabase migrations in `supabase/migrations/` are applied to the linked project.

Live demo: https://govguideai.lovable.app

## Screenshots

Place captures in [`screenshots/`](screenshots) (`landing-page.png`, `guest-chat.png`, `sign-in.png`,
`dashboard.png`, `chat-history.png`, `search.png`, `archive.png`, `settings.png`, `usage.png`,
`mobile.png`).

---

## Team

Roles are leads, not exclusive ownership — every feature was a collaboration.

| Member | Role | Responsibilities |
| --- | --- | --- |
| **Princely** | Product / AI / UX Lead | Product direction, AI behaviour, prompt engineering, UX architecture, documentation, presentation |
| **Thenjiwe** | Frontend / UI Developer | React, responsive UI, landing page, chat interface, design system |
| **Sinawo** | Backend / Database Developer | Supabase, authentication, database, RLS, backend logic, data security |
| **Chichi** | AI Integration / QA Developer | AI API integration, response handling, usage tracking, testing, error handling, QA |

## Documentation

- [Project documentation](docs/PROJECT_DOCUMENTATION.md)
- [System architecture](docs/SYSTEM_ARCHITECTURE.md)
- [AI logic](docs/AI_LOGIC.md)
- [Prompt engineering](docs/PROMPT_ENGINEERING.md)
- [Database design](docs/DATABASE_DESIGN.md)
- [User flows](docs/USER_FLOWS.md)
- [UI/UX design](docs/UI_UX_DESIGN.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [Future roadmap](docs/FUTURE_ROADMAP.md)
