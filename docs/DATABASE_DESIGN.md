# Database Design

PostgreSQL on Supabase. Migrations live in `supabase/migrations/`.

## Verified-content tables
| Table | Purpose |
| --- | --- |
| `government_services` | One row per covered service: slug, name, category, authority, summary, required documents, steps, fees, processing time, last-verified date |
| `knowledge_sources` | Official URLs and verification dates backing each service |
| `faq_entries` | Curated question/answer pairs per service |
| `chat_feedback` | Helpful / not-helpful ratings on assistant answers |

## User-owned tables
| Table | Key columns |
| --- | --- |
| `profiles` | `id` (= `auth.users.id`), `display_name`, timestamps |
| `conversations` | `id`, `user_id`, `title`, `status` (`active` / `archived`), timestamps |
| `messages` | `id`, `conversation_id`, `user_id`, `role`, `content`, `sources`, token counts, `created_at` |

Usage is derived from the token columns on `messages` rather than a duplicated counter table, so the
usage page can never drift from what the provider actually reported.

## Relationships
```text
auth.users 1──1 profiles
auth.users 1──* conversations 1──* messages
government_services 1──* knowledge_sources
government_services 1──* faq_entries
```

## Authorization
Row Level Security is enabled on every public table.
- Verified-content tables: read-only policies for `anon` and `authenticated`; no client writes.
- `profiles`: select/update where `id = auth.uid()`.
- `conversations`: all operations where `user_id = auth.uid()`.
- `messages`: all operations where `user_id = auth.uid()` (and the parent conversation belongs to the
  same user).
- `chat_feedback`: insert-only from clients; no client reads.

Explicit `GRANT`s accompany each table for the roles its policies allow, plus `service_role` for
backend maintenance.

## Triggers
`handle_new_user` inserts a `profiles` row on sign-up. Public execute permission on the function is
revoked so it can only run as the trigger owner.

## Notes
The `vector` extension is installed in a dedicated `extensions` schema in preparation for semantic
retrieval (PLANNED); retrieval is currently keyword-based.
