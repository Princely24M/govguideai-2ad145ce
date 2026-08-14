# System Architecture

## Runtime topology
```text
┌──────────────────────────────────────────────┐
│ Browser — React 19 + TanStack Router         │
│  routes, TanStack Query cache, ThemeProvider │
└───────────────┬──────────────────────────────┘
                │ typed RPC (createServerFn) + Supabase JS (RLS)
                ▼
┌──────────────────────────────────────────────┐
│ Server (edge worker) — TanStack Start SSR    │
│  server functions, auth middleware           │
└──────┬───────────────────────────┬───────────┘
       │                           │
       ▼                           ▼
┌──────────────┐            ┌──────────────────┐
│ Supabase     │            │ AI Gateway       │
│ Postgres+RLS │            │ chat completion  │
│ Auth         │            │ + token usage    │
└──────────────┘            └──────────────────┘
```

## Layers
1. **Presentation** — file-based routes in `src/routes`, shared shell in `__root.tsx`, gated subtree
   `src/routes/_authenticated/` whose `route.tsx` redirects unauthenticated users to `/auth`.
2. **Client state** — `AuthProvider` (Supabase `onAuthStateChange`), `ThemeProvider`
   (localStorage + `prefers-color-scheme`), TanStack Query for server data.
3. **Server functions** — `createServerFn` modules. Public ones (guest chat) take no session;
   authenticated ones use the Supabase auth middleware and act as the calling user, so RLS applies.
4. **Data** — Postgres with RLS. Verified content tables are publicly readable; user-owned tables
   are scoped to `auth.uid()`.
5. **AI** — a single server-side gateway module. The AI key never reaches the browser.

## Request flow: guest question
```text
/chat → askGovGuide (server fn) → retrieval over verified services
      → build system prompt → AI Gateway → { answer, sources } → UI
```

## Request flow: authenticated question
```text
/c/$id → askInConversation → verify session → load prior messages (RLS)
       → retrieval + prompt → AI Gateway → persist user+assistant messages
       → store token usage → auto-title if first exchange → return answer + sources
```

## Boundary rules
- `*.server.ts` modules are server-only and never imported by components directly.
- Secrets are read inside handlers via `process.env`; browser config uses `import.meta.env.VITE_*`.
- SSR-unsafe browser APIs are read in effects, not during render.
