# User Flows

## 1. Guest asks a question

Landing page → **Ask GovGuide** → `/chat` → pick a starter or type a question → thinking state →
answer with source cards → follow-up questions keep context. Transcript is kept in localStorage.

## 2. Guest converts to an account

`/chat` → **Save this conversation** → `/auth` → sign up → the stashed transcript is imported into a
new conversation → redirected into the authenticated workspace.

## 3. Sign up / sign in / reset

`/auth` handles both sign-up and sign-in. Forgot password sends a reset email that lands on
`/reset-password` where a new password is set. Sessions persist across reloads.

## 4. New authenticated conversation

`/dashboard` → **New conversation** → `/c/$conversationId` → send message → answer persisted with
sources and token counts → title auto-generated from the first question.

## 5. Find an earlier conversation

Workspace sidebar → search box → matching conversations by title and message content → open →
full history restored → continue asking.

## 6. Archive / restore / delete

Conversation row menu → Archive (moves to `/archived`) → Restore returns it to active →
Delete removes it and its messages after confirmation.

## 7. Profile and appearance

`/settings` → edit display name → save → appearance switch Light / Dark / System (System follows the
OS/browser setting live).

## 8. Danger zone

`/settings` → Delete all conversations → explicit confirmation dialog → all conversations and
messages for that user are removed.

## 9. Usage review

`/usage` → AI response count plus input, output and total tokens as reported by the provider.

## 10. Browse services directly

`/services` → filter by category or search → `/services/$slug` → documents, steps, fees, processing
time, authority, official link, last-verified date.

## 11. Protected-route guard

Visiting any `/_authenticated/*` URL without a session redirects to `/auth`.

## 12. Sign out

Header or settings → Sign out → session cleared → returned to the public site.
