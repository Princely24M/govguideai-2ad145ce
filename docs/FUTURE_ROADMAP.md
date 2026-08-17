# Future Roadmap

Everything below is **PLANNED**, not implemented.

## Near term

- Automated tests: Vitest unit coverage for retrieval and prompt assembly, Playwright end-to-end
  coverage for auth, chat and conversation management.
- Expand verified coverage beyond the current services (tax, home affairs certificates, municipal
  services, education applications).
- Semantic retrieval using pgvector embeddings alongside keyword matching, for better recall on
  loosely worded questions.
- Streaming answers token-by-token in the chat UI.
- Export a conversation or a document checklist as PDF.

## Medium term

- Multilingual answers: isiZulu, isiXhosa, Afrikaans, Sesotho.
- Voice input and read-aloud answers for low-literacy and accessibility use cases.
- Office locator with operating hours and appointment guidance, sourced from official data.
- Personalised checklists that remember which documents a user already has.
- Admin console for the content team to update verified records and re-verification dates, with an
  audit trail.

## Longer term

- Progressive web app with offline access to checklists.
- WhatsApp and USSD channels for low-bandwidth access.
- Official data partnerships or APIs to replace manual verification.
- Application status tracking where departments expose it.
- Analytics on unanswered questions to prioritise new verified content.

## Known limitations today

- Coverage is limited to the currently verified services.
- Retrieval is keyword-based and can miss unusual phrasings.
- Verified records are maintained manually and carry a last-verified date rather than live data.
- English only.
- No automated regression suite yet.
