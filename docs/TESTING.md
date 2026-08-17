# Testing

Testing to date is **manual**, executed against the running application. An automated suite
(Vitest + Playwright) is **PLANNED**.

## Validation commands

```sh
npm install
npm run lint
npm run build
```

## Manual test matrix

### Landing

- [x] Page loads without console errors
- [x] Navigation links resolve
- [x] Ask GovGuide entry point opens the chat
- [x] Responsive at desktop / tablet / mobile widths

### Guest chat

- [x] Message sends and an AI answer returns
- [x] Conversational context maintained across turns
- [x] Thinking/loading state visible while pending
- [x] Provider or network failure shows a handled error, history preserved
- [x] Source cards render with authority and last-verified date
- [x] Copy and feedback controls work

### Authentication

- [x] Sign up creates an account and a profile row
- [x] Sign in with valid credentials
- [x] Invalid credentials show an error
- [x] Sign out clears the session
- [x] Visiting a protected route unauthenticated redirects to `/auth`
- [x] Password reset email flow reaches `/reset-password`

### Conversations

- [x] Create a new conversation
- [x] Messages persist across reload
- [x] History list shows conversations with generated titles
- [x] Search matches by title and message content
- [x] Archive moves the conversation to Archived
- [x] Restore returns it to active
- [x] Delete removes the conversation and its messages
- [x] Guest transcript imports into a new account

### Profile / settings

- [x] Display name saves and re-renders
- [x] Light and Dark themes apply
- [x] System theme follows the OS/browser preference

### Danger zone

- [x] Confirmation required before deletion
- [x] Delete all conversations empties the list
- [x] Rows are actually removed from the database

### Usage

- [x] AI response count reflects stored assistant messages
- [x] Input / output / total tokens reflect provider-reported values only

### Responsive

- [x] Desktop 1280px+
- [x] Tablet ~768–1024px
- [x] Mobile ~375–430px
- [x] No horizontal scrolling or overlapping elements

### Security spot checks

- [x] Requesting another user's conversation id returns no rows (RLS)
- [x] No secret keys present in the client bundle
