# GovGuide AI — Project Documentation

## 1. Overview
GovGuide AI is an AI-powered assistant that explains South African government services in plain
language and cites the official source for every answer. Built during a 1-month AI Bootcamp by a
four-person team.

Tagline: *Your intelligent guide to understanding government services.*
Principle: *Ask. Understand. Know what to do next.*

## 2. Scope (IMPLEMENTED)
- Public landing page with branding, product explanation, trust and responsible-AI messaging.
- Guest chat at `/chat` — no account required, with conversational context and source citations.
- Service explorer with search, category filters and per-service detail pages.
- Email/password authentication, session persistence, password reset.
- Authenticated workspace: conversation create/continue/search/rename/archive/restore/delete.
- Profile display name, appearance (light/dark/system), delete-all-conversations danger zone.
- Usage page reporting AI response count and provider-reported token totals.
- Answer feedback (helpful / not helpful).

## 3. Out of scope (PLANNED)
Multilingual answers, voice input, office locator, PDF checklists, vector/semantic retrieval,
automated test suite, admin content console. See FUTURE_ROADMAP.md.

## 4. Repository map
```text
public/                 static assets, favicon
src/
  assets/               logo and imagery
  components/           UI components (BrandLogo, SiteHeader, SiteFooter, Reveal, chat/, app/)
  hooks/                use-auth, use-mobile
  integrations/supabase/ generated Supabase clients, auth middleware, types
  lib/                  server functions (*.functions.ts), server-only logic (*.server.ts), utils
  routes/               file-based routes, including _authenticated/ gated subtree
  styles.css            design tokens, mesh gradients, motion utilities
supabase/migrations/    SQL schema, RLS policies, seed data
docs/                   this documentation set
screenshots/            product screenshots
```

Note: this project uses TanStack Start file-based routing, so pages live in `src/routes/` rather
than `src/pages/`, and backend logic lives in typed server functions rather than edge functions.

## 5. Key modules
| File | Purpose |
| --- | --- |
| `src/lib/govguide-prompt.server.ts` | Versioned system prompt (ROLE → CONTEXT → TASK → CONSTRAINTS → BEHAVIOUR → OUTPUT) |
| `src/lib/govguide-retrieval.server.ts` | Keyword + synonym retrieval over verified service records |
| `src/lib/govguide-gateway.server.ts` | AI Gateway call, token usage extraction, title generation |
| `src/lib/govguide-chat.server.ts` | Orchestrates retrieval → prompt → gateway → sources |
| `src/lib/govguide.functions.ts` | Public guest chat server function |
| `src/lib/account.functions.ts` | Authenticated profile, conversation, usage and chat server functions |
| `src/components/chat/AnswerBody.tsx` | Safe structured rendering of assistant markdown |
| `src/components/app/WorkspaceShell.tsx` | Authenticated layout with searchable conversation sidebar |

## 6. Running the project
See README.md — Installation, Environment variables, Deployment.
