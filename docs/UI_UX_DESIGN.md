# UI/UX Design System

## Intent

Communicate trust, clarity, intelligence, accessibility, precision and reliability — a premium
digital public-service platform, deliberately not a generic AI chatbot dashboard.

## Foundations

- **Colour** — semantic OKLCH tokens in `src/styles.css`, with a complete `.dark` theme. Components
  use tokens only (`bg-surface`, `text-muted-foreground`, `bg-primary`), never raw hex or
  `text-white` / `bg-black`, so theming and dark mode stay intact.
- **Typography** — display face for headings (`font-display`), humanist sans for body; tight
  tracking on large headings, relaxed leading in body copy.
- **Surfaces** — `.glass` and `.glass-secondary` frosted layers over `.mesh-light` gradient mesh
  backgrounds; soft shadows (`shadow-soft`) and ambient glow (`shadow-glow`) for elevation.
- **Shape** — generous radii (rounded-2xl / 3xl), asymmetric chat bubbles for speaker direction.
- **Spacing** — wide vertical rhythm on marketing sections, compact rhythm in the workspace.

## Components

`BrandLogo` / `BrandMark` (single source of logo truth), `SiteHeader`, `SiteFooter`, `Reveal`
(scroll-triggered blur-in), `AnimatedNumber`, `ServiceIcon`, `Disclaimer`, `AnswerBody`
(structured answer rendering), `WorkspaceShell` (authenticated sidebar layout).

## Motion

Smooth, calm and purposeful: blur-and-rise reveals on scroll, staggered card entrances, floating
glass hover lift, gentle typing indicator, eased transitions using shared `--ease-soft` timing.
Motion never blocks reading or interaction.

**Reduced motion** — under `prefers-reduced-motion: reduce` decorative animation is reduced or
disabled and content renders in its final state.

## Accessibility

Semantic landmarks and a single H1 per page, labelled form controls, `sr-only` labels on icon-only
buttons, `aria-live` on the message list, visible focus states, AA-targeted contrast in both themes,
and plain-language copy throughout.

## Responsive behaviour

| Breakpoint | Behaviour                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Desktop    | Expanded navigation, full workspace with persistent sidebar, richer visual effects                    |
| Tablet     | Adaptive columns, collapsible navigation, reduced motion complexity                                   |
| Mobile     | Full-width chat, navigation drawer, touch-sized controls, auto-growing composer, simplified animation |

Guarded against horizontal scrolling, overflow, overlapping elements and unreadable text.

## Logo rules

Use the official asset via `BrandLogo` / `BrandMark` only. Preserve aspect ratio and resolution, do
not recreate or distort it, and do not repeat it more than once per view.
