# Nexlivo Labs — Marketing Site Design

**Date:** 2026-08-24
**Status:** Approved design, pending implementation plan
**Stack:** Next.js (App Router) + Tailwind CSS v4 + TypeScript

---

## 1. Purpose

A single-page marketing site for Nexlivo Labs, a studio that designs and builds
web and mobile products for businesses and enterprises. The site must read as a
credible studio without any client work to show — there are no clients yet, so
no logo wall, no testimonials, no case studies. Credibility comes from clarity
of offering, an explicit process, visible capability depth, and design quality.

**Primary conversion goal:** an inbound project enquiry via the contact form,
phone, or email.

**Voice:** first-person plural ("we"). The founder appears once, in a small bio
low on the page. The site does not read as a freelancer portfolio.

---

## 2. Design source and how it was adapted

The system derives from `DESIGN.md` (the Privy reference): an ink-on-white
editorial system — white canvas, near-black text, flat surfaces, hairline
borders, pill buttons, one accent colour, and no shadows anywhere. Three
deliberate deviations, each with a reason:

### 2.1 Accent colour: violet → cyan

The reference's single accent is violet `#635bff`. Nexlivo's brand accent is the
logo cyan `#00C4CC`. Cyan replaces violet in every role violet held.

### 2.2 Contrast rule (the constraint this creates)

Measured WCAG 2.1 contrast ratios:

| Pair | Ratio | AA body text |
|---|---|---|
| `#00C4CC` on `#ffffff` | 2.15:1 | **FAIL** |
| `#ffffff` on `#00C4CC` | 2.15:1 | **FAIL** |
| `#010417` on `#00C4CC` | 9.47:1 | PASS |
| `#00C4CC` on `#010417` | 9.47:1 | PASS |
| `#010417` on `#ffffff` | 20.73:1 | PASS |
| `#73737c` on `#ffffff` | 4.70:1 | PASS |

The reference's violet was safe in both directions (4.7:1). Cyan is not. This
yields a **hard system rule**:

> **Cyan is a background under ink text, or a foreground on navy. It is never
> text on white, and never a background under white text.**

Consequence: the reference's announcement bar (violet band, white text) becomes
a **cyan band with ink text**. Cyan is otherwise restricted to: the announcement
bar fill, small decorative rules, the intro wordmark on navy, and icon accents on
the dark band. It is never used for body copy, links, or as a primary button fill.

**Focus indicators are a special case.** WCAG 2.1 SC 1.4.11 requires 3:1 for
non-text indicators; cyan on canvas is 2.15:1 and therefore **cannot** be a focus
ring on light surfaces. Focus rings are:

- On canvas/light surfaces: **2px `--color-ink`**, 2px offset (20.73:1).
- On carbon/graphite surfaces: **2px `--color-cyan`**, 2px offset (9.47:1).

This is the one place where the accent does *not* mark interaction on light
backgrounds, and the rule must not be "simplified" back to cyan everywhere.

### 2.3 Ink token unified with the logo plate

The logo's background samples to `#010417`; the reference's Obsidian Ink is
`#010110`. They are visually indistinguishable. They are collapsed into a single
`--ink` token at `#010417` so the brand plate and the body text are literally the
same colour, letting the logo sit natively in the layout.

### 2.4 Typography

`DESIGN.md` specifies ABC Favorit and describes it as a "high-contrast serif".
That description is wrong — ABC Favorit is a neo-grotesque sans — and the doc
itself flags the font as an unlicensed trial. Its serif substitutes are therefore
rejected: they would clash with the geometric-sans logo.

- **Display / headings: Montserrat** — confirmed as the logo's typeface. Using it
  for headlines makes the wordmark and the headings the same voice.
- **Body / UI: Inter** — retained from `DESIGN.md`.

Both are Google Fonts under the SIL Open Font License, self-hosted via
`next/font/google` (no external request at runtime, no layout shift).

`DESIGN.md`'s typographic *signature* is retained regardless of face: display
weight 400 (not bold), letter-spacing `-0.03em`, line-height 1.03–1.15.

---

## 3. Design tokens

Declared once in `app/globals.css` under Tailwind v4's `@theme`.

### Colour

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#ffffff` | Page background, card surfaces |
| `--color-ink` | `#010417` | Body text, headings, hairlines, filled buttons, intro plate |
| `--color-carbon` | `#111117` | Dark full-bleed band background |
| `--color-graphite` | `#22222a` | Cards inside the dark band |
| `--color-fog` | `#73737c` | Secondary copy, muted labels, footer links |
| `--color-ash` | `#d9d9d9` | Hairline dividers, dot pattern |
| `--color-cyan` | `#00C4CC` | Accent — see §2.2 for permitted uses |

No other colours. No gradients. One exception: a `--color-danger` `#c0392b` for
form validation errors.

### Type scale

Retained from `DESIGN.md` verbatim.

| Role | Size | Line height | Tracking |
|---|---|---|---|
| `caption` | 12px | 1.4 | -0.24px |
| `body-sm` | 14px | 1.5 | -0.28px |
| `body` | 16px | 1.5 | -0.32px |
| `subheading` | 20px | 1.4 | -0.40px |
| `heading-sm` | 26px | 1.13 | -0.78px |
| `heading` | 38px | 1.15 | -1.14px |
| `heading-lg` | 56px | 1.07 | -1.68px |
| `display` | 76px | 1.03 | -2.28px |

Weights: 400 regular, 500 medium, 700 bold. Display sizes are **always weight
400** — bolding them breaks the system's character.

### Shape and space

- Radius: **8px** cards/images, **100px** buttons/tags, **2px** icons. No other values.
- Spacing: 4/8/12/16/20/24/32/48/80px.
- Page max-width **1200px**; section gap **80px** (48px on mobile); card padding **24px**.
- **Elevation is never a shadow.** Depth comes from background tone shifts and
  1px hairline borders in `--color-ink` at 10–15% opacity.

---

## 4. Page structure

Single route `/`, plus two legal routes. Order:

| # | Section | Surface | Notes |
|---|---|---|---|
| 0 | Intro overlay | Ink `#010417` | One-shot, session-scoped |
| 1 | Announcement bar | Cyan `#00C4CC` | **Ink text** (contrast rule) |
| 2 | Nav | Canvas | Sticky, hairline bottom border |
| 3 | Hero | Canvas | Headline + subtext + dual CTA |
| 4 | Services | Canvas | 4 cards |
| 5 | Process | Canvas | 4 numbered steps |
| 6 | Capabilities | Carbon `#111117` | **The single tonal break** |
| 7 | About | Canvas | Studio para + small founder bio |
| 8 | FAQ | Canvas | Accordion, 7 items |
| 9 | Contact | Canvas | Form + direct details |
| 10 | Footer | Canvas | 4-column links + dot pattern |

The white → dark → white rhythm is deliberate and matches the reference. The
Capabilities band is the **only** dark section; adding a second would flatten the
rhythm into stripes.

---

## 5. Section detail

### 5.0 Intro overlay

Fixed full-viewport plate in `--color-ink`, `z-index: 200`.

Sequence:

| t | Event |
|---|---|
| 0ms | Plate opaque, wordmark hidden behind clip-masks |
| 320ms | `Nexlivo` (cyan) translates from `100%` → `0` inside its mask, 520ms `cubic-bezier(.16,1,.3,1)` |
| 500ms | `LABS` (white) same transform, 180ms stagger |
| 1400ms | Plate `translateY(-100%)`, 600ms, same easing |
| 2000ms | Plate `display: none`, body scroll unlocked |

Rules:

- Words emerge from behind a mask edge. They **never fade** — opacity stays 1.
- Body scroll is locked while the plate is up; `overflow: hidden` on `<html>`.
- Skippable: click, `Esc`, or any keypress jumps straight to the wipe.
- Plays **once per session** (`sessionStorage`), not once per page view.
- Under `prefers-reduced-motion: reduce` the overlay **does not render at all** —
  no plate, no animation, no scroll lock. First paint is the finished site.
- The overlay must not delay LCP: the page beneath renders fully behind it, and
  the overlay is not server-blocking.

### 5.1 Announcement bar

Full-bleed cyan band. Ink text, 13px Inter weight 500, centred. Inline pill link
on the right: transparent fill, 1px ink border, ink text, 100px radius, `→` glyph.
Dismissible, persisted to `localStorage`.

### 5.2 Nav

Sticky, canvas background, 1px bottom hairline in ink at 12% opacity, height 64px.
Logo left (SVG wordmark, ink). Centre links: Services, Process, Capabilities, FAQ.
Right: "Contact" ghost pill button. Below 768px collapses to a full-screen drawer
with a focus trap.

### 5.3 Hero

- Headline: Montserrat 400, `display` at ≥1024px / `heading-lg` below, ink.
- Subtext: Inter 400 18px, fog, max 60ch.
- Dual CTA: **primary** = filled ink pill, white text, `→` glyph;
  **secondary** = ghost pill, 1px ink border, inverting to ink fill on hover.
- No hero image. The reference uses product mockups; there is no product to show,
  and a stock illustration would cheapen it. The headline carries the section.

### 5.4 Services — 4 cards

1. **Web Applications** — SaaS platforms, dashboards, internal tools
2. **Mobile Applications** — iOS and Android, cross-platform
3. **Product Design** — UI/UX, design systems, prototypes
4. **Cloud & DevOps** — deployment, CI/CD, monitoring, cost control

The fourth is included because it is the studio's genuine differentiator and is
directly backed by the founder's certifications and day-to-day work.

Cards: canvas fill, 1px ash border, 8px radius, 24px padding, no shadow. Line
icons at 20px, 1.5px stroke, ink. Hover: border darkens to ink at 30%, 150ms.

### 5.5 Process — 4 steps

`Discover → Design → Build → Ship & Run`

Numbered `01`–`04` in Montserrat 400 at `heading-sm`, cyan-underlined. "Ship &
Run" closes the loop on operations — where the studio's infrastructure depth is
substantiated rather than asserted.

### 5.6 Capabilities — dark band

Full-bleed `--color-carbon`. Heading in Montserrat 400 `heading`, white. Three
`--color-graphite` cards, 8px radius, 24–32px padding, no border, no shadow:

- **Frontend** — React, Next.js, TypeScript, Tailwind, React Native, Flutter
- **Backend** — Node.js, Python, REST/GraphQL, PostgreSQL
- **Cloud & Ops** — AWS, GCP, Azure, Docker, CI/CD, observability

Card body copy in fog. Cyan permitted here for icon strokes (9.47:1 on carbon).

### 5.7 About

One studio paragraph in "we" voice. Beneath it, a compact founder bio block:
name, role, 2–3 lines, and a portfolio/LinkedIn link. Ash hairline above,
smaller type than the surrounding section — present, not prominent.

**Open item for the client:** whether to name the current employer
([x]cube LABS / PurpleTalk). The bio is written without it by default; the
certifications and discipline experience carry the credibility on their own.
Adding an employer name to a personal startup's site is the founder's call,
and may carry employment implications.

### 5.8 FAQ — accordion, 7 items

1. What kind of projects do you take on?
2. How long does a typical project take?
3. Who owns the code and the design?
4. Do you work with enterprise clients?
5. What happens after launch?
6. How do you price projects?
7. How do we get started?

Native `<details>`/`<summary>` styled to spec — keyboard accessible with no JS.
Ash hairline between items. Chevron rotates 150ms.

### 5.9 Contact

Two columns at ≥768px, stacked below.

- **Left — form:** Name, Email, Company (optional), Project type (select: Web /
  Mobile / Design / Cloud / Other), Message. Inputs are light-mode style:
  canvas fill, 1px ash border, 8px radius, 44px min height. Focus: 1px cyan
  border plus a 3px cyan-at-10% ring. Errors inline beneath the field in
  `--color-danger`, wired via `aria-describedby`.
- **Right — direct details:** `+91 9704069431` (`tel:` link),
  `admin.nexlivolabs@gmail.com` (`mailto:` link), and **Hyderabad, India** as the
  stated base. Response-time expectation ("we reply within one business day")
  sits beneath them.

**Backend:** the form POSTs to a Next.js Route Handler at `/api/contact` with
server-side validation and a honeypot field. Delivery is behind a provider
adapter (Resend by default) that is **inert until an API key is supplied**. With
no key configured the endpoint returns a clear error and the UI directs the user
to the email and phone links, which always work. This is a known, accepted gap —
the site ships functional without a key.

### 5.10 Footer

Canvas with an ash dot pattern at 20% opacity over the upper portion. Four
columns: Services, Company, Legal, Contact. Headings 14px Inter 700 ink; links
14px Inter 400 fog, hovering to ink. Bottom row: copyright, SVG social icons.

### 5.11 Legal routes

`/terms` and `/privacy`, generated from `Nexlivo_Legal_Pack.md`. Plain typographic
pages reusing the token system, max-width 720px for readability. Linked from the
footer.

---

## 6. Architecture

```
nexlivo-labs/
  app/
    layout.tsx              fonts, metadata, IntroOverlay mount
    page.tsx                composes sections in order
    globals.css             @theme tokens, base layer
    terms/page.tsx
    privacy/page.tsx
    api/contact/route.ts    POST handler, validation, provider adapter
  components/
    intro/IntroOverlay.tsx        'use client' — the only stateful piece
    layout/AnnouncementBar.tsx    'use client' — dismissal
    layout/Nav.tsx                'use client' — mobile drawer
    layout/Footer.tsx             server
    sections/Hero.tsx             server
    sections/Services.tsx         server
    sections/Process.tsx          server
    sections/Capabilities.tsx     server
    sections/About.tsx            server
    sections/Faq.tsx              server
    sections/Contact.tsx          'use client' — form state
    ui/Button.tsx  Card.tsx  Section.tsx  Reveal.tsx
  lib/
    content.ts              ALL copy — single source of truth
    contact-schema.ts       shared client/server validation
  public/
    nexlivo-logo.svg        rebuilt wordmark
    favicon / og-image
```

**Server Components by default.** Only four components are client components,
each for a specific reason noted above. All copy lives in `lib/content.ts` so
text edits never require touching JSX.

### Animation

CSS-only. Intro uses keyframes plus a small state machine. Scroll reveals use a
single shared `IntersectionObserver` in `Reveal.tsx` toggling a class — an 8px
rise plus opacity, 400ms, 60ms stagger. **No GSAP, no Framer Motion**: a flat
system with 150ms transitions does not justify an animation dependency, and the
bundle stays near-zero.

Every animation sits behind `@media (prefers-reduced-motion: no-preference)`.
Under `reduce`, all content renders in its final state immediately.

---

## 7. Accessibility requirements

Non-negotiable, verified by test:

- Body text ≥ 4.5:1; large text ≥ 3:1. The cyan rule in §2.2 is enforced.
- Visible focus on every interactive element, per the surface-dependent rule in
  §2.2 — **ink on light, cyan on dark**, 2px, 2px offset. Focus rings are
  **never** removed, and cyan is never a focus ring on a light surface.
- Touch targets ≥ 44×44px with ≥ 8px separation.
- Full keyboard operability: nav drawer traps focus and restores it on close;
  intro is dismissible by keyboard; accordion is native.
- Every form input has a persistent visible `<label>` — never placeholder-only.
- Errors appear adjacent to their field, not only summarised at the top.
- Semantic landmarks and a single `<h1>`; heading levels never skip.
- Icons are SVG. **No emoji as icons.**
- `prefers-reduced-motion` honoured throughout.
- Viewport meta permits zoom; `user-scalable=no` is forbidden.

## 8. Performance requirements

- CLS < 0.1 — fonts via `next/font` with `display: swap` and a matched fallback.
- No horizontal scroll at any width from 320px up.
- Images in WebP/AVIF via `next/image` with explicit dimensions.
- Zero render-blocking third-party requests. No analytics in the initial build.

## 9. Responsive behaviour

Breakpoints 375 / 768 / 1024 / 1440.

- Display type steps 76 → 56 → 38px down the breakpoints.
- Section gaps 80 → 64 → 48px.
- Container padding 32 → 24 → 16px.
- Grids collapse 4 → 2 → 1 column.
- Nav collapses to a drawer below 768px.
- Buttons go full-width below 480px.

## 10. Testing

Playwright, using the `playwright-cli` skill.

1. **Intro** — plays once, reveals the site, is skippable, and does not render at
   all under reduced motion.
2. **Reduced motion** — with `prefers-reduced-motion: reduce`, first paint shows
   final content and no plate.
3. **Contrast** — assert computed colours against the §2.2 table; specifically
   assert the announcement bar uses ink text, not white.
4. **Responsive** — no horizontal overflow at 320/375/768/1024/1440.
5. **Keyboard** — tab the full page; every focused element has a visible ring;
   the drawer traps and restores focus.
6. **Form** — invalid submissions surface inline field-level errors; a valid
   submission with no API key configured surfaces the fallback contact path.
7. **Legal routes** — `/terms` and `/privacy` render and are footer-reachable.

## 11. Out of scope

Client logos, testimonials, case studies (no clients yet — explicitly excluded).
Blog/CMS. Dark-mode toggle — dark is a *sectional* choice here, not a theme, per
`DESIGN.md`. Analytics. i18n. Booking/scheduling integration.

## 12. Known gaps carried into implementation

1. Contact delivery is inert until an email provider key is supplied.
2. Founder-bio employer naming is unresolved and awaits the client's decision (§5.7).
3. The source logo is a JPEG with a baked-in navy background; the wordmark is
   rebuilt as SVG in Montserrat and must be visually diffed against the original.
4. Node.js is not installed on the build machine and must be installed to
   `~/.local` before any scaffolding.
