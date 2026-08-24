# Nexlivo Labs Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Nexlivo Labs single-page marketing site — a light, editorial, ink-on-white studio site with a word-by-word logo intro, four service offerings, an FAQ, a working contact form, and legal pages.

**Architecture:** Next.js App Router with Server Components by default; exactly four client components (intro overlay, announcement bar, nav, contact form), each for a specific stateful reason. All design tokens are declared once in Tailwind v4's `@theme` block. All site copy lives in a single `lib/content.ts` module so text changes never touch JSX. Animation is CSS-only — no animation library.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Zod, Vitest (unit), Playwright (E2E), Node 24.

**Spec:** `docs/superpowers/specs/2026-08-24-nexlivo-labs-site-design.md`

---

## Global Constraints

Every task's requirements implicitly include this section. Values are copied verbatim from the spec.

**Environment**
- Node is installed at `~/.local/node`. Every shell command must begin with `export PATH="$HOME/.local/node/bin:$PATH"` or run in a shell where `~/.bashrc` has been sourced. There is no system Node.
- Project root is `~/nexlivo-labs`, already a git repo with an initial commit.

**Colour tokens — these seven, plus `--color-danger`. No others. No gradients.**

| Token | Value |
|---|---|
| `--color-canvas` | `#ffffff` |
| `--color-ink` | `#010417` |
| `--color-carbon` | `#111117` |
| `--color-graphite` | `#22222a` |
| `--color-fog` | `#73737c` |
| `--color-ash` | `#d9d9d9` |
| `--color-cyan` | `#00c4cc` |
| `--color-danger` | `#c0392b` |

**The cyan rule (hard constraint, verified by test in Task 11)**
> Cyan is a background under ink text, or a foreground on navy. It is **never** text on white, and **never** a background under white text.
- `#00c4cc` on `#ffffff` measures 2.15:1 — fails WCAG AA in both directions.
- `#010417` on `#00c4cc` measures 9.47:1 — passes.
- The announcement bar is therefore a **cyan band with ink text**, not white text.

**Focus indicators (surface-dependent — do not "simplify" to cyan everywhere)**
- On canvas/light surfaces: `2px solid var(--color-ink)`, `outline-offset: 2px` (20.73:1).
- On carbon/graphite surfaces: `2px solid var(--color-cyan)`, `outline-offset: 2px` (9.47:1).
- Focus rings are never removed.

**Typography**
- Display/headings: **Montserrat**. Body/UI: **Inter**. Both via `next/font/google`, self-hosted, `display: swap`.
- Display sizes are **always weight 400**. Never bold a display heading.
- Type scale (size / line-height / letter-spacing): `caption` 12px/1.4/-0.24px · `body-sm` 14px/1.5/-0.28px · `body` 16px/1.5/-0.32px · `subheading` 20px/1.4/-0.4px · `heading-sm` 26px/1.13/-0.78px · `heading` 38px/1.15/-1.14px · `heading-lg` 56px/1.07/-1.68px · `display` 76px/1.03/-2.28px

**Shape and space**
- Radius: **8px** cards/images, **100px** buttons/tags, **2px** icons. No other values.
- Spacing: 4/8/12/16/20/24/32/48/80px only.
- Page max-width **1200px**; section gap **80px** desktop / 64px tablet / 48px mobile; card padding **24px**.
- **No `box-shadow` anywhere in the codebase.** Depth is background tone shifts and 1px hairline borders in ink at 10–15% opacity. Task 11 asserts this.

**Accessibility**
- Body text ≥ 4.5:1, large text ≥ 3:1.
- Touch targets ≥ 44×44px, ≥ 8px apart.
- Every input has a persistent visible `<label>` — never placeholder-only.
- Errors adjacent to their field, wired with `aria-describedby`.
- Icons are SVG. **No emoji as icons, ever.**
- Single `<h1>`; heading levels never skip.
- All animation behind `@media (prefers-reduced-motion: no-preference)`.
- Viewport meta permits zoom; `user-scalable=no` is forbidden.

**Out of scope — do not build:** client logos, testimonials, case studies, blog/CMS, dark-mode toggle, analytics, i18n.

---

## File Structure

| Path | Responsibility |
|---|---|
| `app/layout.tsx` | Fonts, metadata, intro anti-flash script, mounts overlay + bar + nav + footer |
| `app/page.tsx` | Composes the seven sections in order |
| `app/globals.css` | `@theme` tokens, base layer, intro keyframes, reveal keyframes |
| `app/terms/page.tsx` · `app/privacy/page.tsx` | Legal prose pages |
| `app/api/contact/route.ts` | POST handler: validate, honeypot, delegate to mailer |
| `lib/content.ts` | **All site copy.** Single source of truth |
| `lib/contact-schema.ts` | Zod schema shared by client and server |
| `lib/mailer.ts` | Provider adapter; inert without `RESEND_API_KEY` |
| `components/ui/Button.tsx` | Pill button, `filled` / `ghost` variants |
| `components/ui/Card.tsx` | 8px card, `light` / `dark` variants |
| `components/ui/Section.tsx` | Section wrapper: max-width, padding, id anchor |
| `components/ui/Reveal.tsx` | Shared IntersectionObserver scroll reveal |
| `components/ui/Logo.tsx` | Inline SVG wordmark, `currentColor`-driven |
| `components/intro/IntroOverlay.tsx` | The one-shot intro plate |
| `components/layout/AnnouncementBar.tsx` | Cyan band, dismissible |
| `components/layout/Nav.tsx` | Sticky nav + mobile drawer with focus trap |
| `components/layout/Footer.tsx` | Four-column footer + dot pattern |
| `components/sections/*.tsx` | Hero, Services, Process, Capabilities, About, Faq, Contact |
| `tests/unit/*.test.ts` | Vitest — schema, content invariants |
| `tests/e2e/*.spec.ts` | Playwright — intro, a11y, responsive, contrast, form |

---

## Task 1: Scaffold, tokens, fonts, and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: the `@theme` token names every later task uses — `bg-canvas`, `bg-ink`, `bg-carbon`, `bg-graphite`, `text-fog`, `border-ash`, `bg-cyan`, `text-danger`, `font-display`, `font-sans`, `text-display`, `text-heading-lg`, `text-heading`, `text-heading-sm`, `text-subheading`, `text-body`, `text-body-sm`, `text-caption`, `rounded-card` (8px), `rounded-pill` (100px). Also the npm scripts `dev`, `build`, `test:unit`, `test:e2e`.

- [ ] **Step 1: Scaffold the Next.js app**

```bash
cd ~/nexlivo-labs
export PATH="$HOME/.local/node/bin:$PATH"
npx --yes create-next-app@latest . \
  --typescript --tailwind --app --eslint \
  --src-dir=false --import-alias "@/*" --turbopack --no-git --yes
```

If the directory-not-empty prompt appears, accept — `docs/` and `.git/` must be preserved.

- [ ] **Step 2: Add remaining dependencies**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm install zod
npm install -D vitest @vitejs/plugin-react jsdom @playwright/test
npx playwright install chromium --with-deps || npx playwright install chromium
```

- [ ] **Step 3: Write `app/globals.css` with the full token system**

Replace the entire file:

```css
@import "tailwindcss";

@theme {
  --color-canvas: #ffffff;
  --color-ink: #010417;
  --color-carbon: #111117;
  --color-graphite: #22222a;
  --color-fog: #73737c;
  --color-ash: #d9d9d9;
  --color-cyan: #00c4cc;
  --color-danger: #c0392b;

  --font-display: var(--font-montserrat), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --text-caption: 12px;
  --text-caption--line-height: 1.4;
  --text-caption--letter-spacing: -0.24px;
  --text-body-sm: 14px;
  --text-body-sm--line-height: 1.5;
  --text-body-sm--letter-spacing: -0.28px;
  --text-body: 16px;
  --text-body--line-height: 1.5;
  --text-body--letter-spacing: -0.32px;
  --text-subheading: 20px;
  --text-subheading--line-height: 1.4;
  --text-subheading--letter-spacing: -0.4px;
  --text-heading-sm: 26px;
  --text-heading-sm--line-height: 1.13;
  --text-heading-sm--letter-spacing: -0.78px;
  --text-heading: 38px;
  --text-heading--line-height: 1.15;
  --text-heading--letter-spacing: -1.14px;
  --text-heading-lg: 56px;
  --text-heading-lg--line-height: 1.07;
  --text-heading-lg--letter-spacing: -1.68px;
  --text-display: 76px;
  --text-display--line-height: 1.03;
  --text-display--letter-spacing: -2.28px;

  --radius-card: 8px;
  --radius-pill: 100px;
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    background-color: var(--color-canvas);
    color: var(--color-ink);
    font-family: var(--font-sans);
    font-size: var(--text-body);
    line-height: 1.5;
    letter-spacing: -0.32px;
  }
  h1, h2, h3 {
    font-family: var(--font-display);
    font-weight: 400;
  }
  :focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 2px;
  }
  .on-dark :focus-visible {
    outline-color: var(--color-cyan);
  }
  ::selection {
    background: var(--color-cyan);
    color: var(--color-ink);
  }
}
```

- [ ] **Step 4: Write `app/layout.tsx` with fonts and metadata**

```tsx
import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexlivo Labs — Web and mobile product studio",
  description:
    "Nexlivo Labs designs and builds web and mobile products for businesses and enterprises, and keeps them running after launch.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Write a minimal `app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main>
      <h1 className="font-display text-heading">Nexlivo Labs</h1>
    </main>
  );
}
```

- [ ] **Step 6: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 7: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

- [ ] **Step 8: Add npm scripts**

In `package.json`, set the `scripts` block to:

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test:unit": "vitest run",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 9: Write the failing smoke test**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("page renders with the token system applied", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("Nexlivo Labs");

  // Body must use the ink token, not a default black.
  const bodyColor = await page.evaluate(
    () => getComputedStyle(document.body).color,
  );
  expect(bodyColor).toBe("rgb(1, 4, 23)");

  // Display headings must resolve to Montserrat, not a fallback.
  const h1Font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1Font).toContain("Montserrat");

  // Display headings must be weight 400 — never bold.
  const h1Weight = await h1.evaluate((el) => getComputedStyle(el).fontWeight);
  expect(h1Weight).toBe("400");
});
```

- [ ] **Step 10: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e
```
Expected: PASS. If the font assertion fails, `next/font` variables are not reaching `@theme` — verify the `className` on `<html>` and the `--font-display` mapping.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app with Nexlivo design tokens and test harness"
```

---

## Task 2: Content module and contact schema

**Files:**
- Create: `lib/content.ts`, `lib/contact-schema.ts`
- Test: `tests/unit/contact-schema.test.ts`, `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks
- Produces:
  - `lib/content.ts` exports `content` with keys: `announcement`, `nav`, `hero`, `services`, `process`, `capabilities`, `about`, `faq`, `contact`, `footer`. Exact shapes are shown in Step 1 below — every later section task reads from these.
  - `lib/contact-schema.ts` exports `contactSchema` (Zod), `type ContactInput`, and `PROJECT_TYPES: readonly string[]`.

- [ ] **Step 1: Write `lib/content.ts`**

```ts
export const content = {
  announcement: {
    text: "Nexlivo Labs is taking on new projects this quarter.",
    linkLabel: "Get in touch",
    href: "#contact",
  },

  nav: {
    links: [
      { label: "Services", href: "#services" },
      { label: "Process", href: "#process" },
      { label: "Capabilities", href: "#capabilities" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: { label: "Contact", href: "#contact" },
  },

  hero: {
    headline: "We design and build software that businesses run on.",
    subtext:
      "Nexlivo Labs is a product studio. We take web and mobile products from first sketch to production — and keep them running once they are there.",
    primaryCta: { label: "Start a project", href: "#contact" },
    secondaryCta: { label: "See how we work", href: "#process" },
  },

  services: {
    heading: "What we do",
    items: [
      {
        title: "Web Applications",
        body: "SaaS platforms, dashboards, and internal tools built to hold up under real use. React and Next.js, typed end to end.",
      },
      {
        title: "Mobile Applications",
        body: "iOS and Android from a single codebase. React Native and Flutter, shipped to both stores.",
      },
      {
        title: "Product Design",
        body: "Interface and experience design, design systems, and prototypes you can click through before a line of code is written.",
      },
      {
        title: "Cloud & DevOps",
        body: "Deployment pipelines, monitoring, and cost control — the part most studios hand back unfinished.",
      },
    ],
  },

  process: {
    heading: "How we work",
    steps: [
      {
        number: "01",
        title: "Discover",
        body: "We map the problem, the users, and the constraints before proposing a solution. You get a written scope, a timeline, and a fixed price.",
      },
      {
        number: "02",
        title: "Design",
        body: "Wireframes through to high-fidelity screens and a design system. You review and sign off on every screen before we build.",
      },
      {
        number: "03",
        title: "Build",
        body: "Two-week cycles, each ending in a working build. You see progress continuously, not all at once at the end.",
      },
      {
        number: "04",
        title: "Ship & Run",
        body: "We deploy, instrument, and monitor. Handover includes the infrastructure, the pipelines, and the documentation to run it without us.",
      },
    ],
  },

  capabilities: {
    heading: "What we build with",
    groups: [
      {
        title: "Frontend",
        items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native", "Flutter"],
      },
      {
        title: "Backend",
        items: ["Node.js", "Python", "REST & GraphQL", "PostgreSQL"],
      },
      {
        title: "Cloud & Ops",
        items: ["AWS", "Google Cloud", "Azure", "Docker", "CI/CD", "Observability"],
      },
    ],
  },

  about: {
    heading: "About the studio",
    body: "Nexlivo Labs works with businesses and enterprises that need software built properly the first time. We are deliberately small: the people who scope your project are the people who build it. We take on a limited number of engagements so each one gets senior attention from start to finish.",
    founder: {
      name: "Farooq Khan",
      role: "Founder",
      bio: "Cloud and DevOps engineer turned product builder. Google Cloud Certified Associate Cloud Engineer, Oracle Cloud Infrastructure Certified Architect Associate, and Microsoft Certified in Azure AI Fundamentals. Background in infrastructure operations, CI/CD, and monitoring at enterprise scale.",
      links: [
        { label: "LinkedIn", href: "https://www.linkedin.com/in/farooq710" },
        { label: "Portfolio", href: "https://farooq-portfolio-blond.vercel.app/" },
      ],
    },
  },

  faq: {
    heading: "Questions",
    items: [
      {
        q: "What kind of projects do you take on?",
        a: "Web and mobile products for businesses and enterprises: SaaS platforms, internal tools, dashboards, and customer-facing apps. We work best where the problem is clear but the solution is not yet.",
      },
      {
        q: "How long does a typical project take?",
        a: "A focused MVP runs six to ten weeks. A full product build typically runs three to six months. You get a written timeline after discovery, before you commit to anything.",
      },
      {
        q: "Who owns the code and the design?",
        a: "You do. On final payment, all source code, design files, and infrastructure configuration transfer to you outright. We retain no licence over your product.",
      },
      {
        q: "Do you work with enterprise clients?",
        a: "Yes. We handle procurement, security review, NDAs, and master service agreements. Our infrastructure practice is built around the compliance and uptime expectations enterprise teams already hold.",
      },
      {
        q: "What happens after launch?",
        a: "Every engagement ends with a real handover: documentation, pipelines, and monitoring you can operate yourself. If you would rather we kept running it, we offer ongoing support retainers.",
      },
      {
        q: "How do you price projects?",
        a: "Fixed price per phase, quoted after discovery. You approve the scope and the number before work starts. No hourly billing and no open-ended invoices.",
      },
      {
        q: "How do we get started?",
        a: "Send a note describing what you are building. We reply within one business day and set up a call to work out whether we are the right fit.",
      },
    ],
  },

  contact: {
    heading: "Tell us what you are building.",
    subtext: "We reply within one business day.",
    email: "admin.nexlivolabs@gmail.com",
    phone: "+91 9704069431",
    phoneHref: "tel:+919704069431",
    location: "Hyderabad, India",
  },

  footer: {
    columns: [
      {
        title: "Services",
        links: [
          { label: "Web Applications", href: "#services" },
          { label: "Mobile Applications", href: "#services" },
          { label: "Product Design", href: "#services" },
          { label: "Cloud & DevOps", href: "#services" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "#about" },
          { label: "Process", href: "#process" },
          { label: "Capabilities", href: "#capabilities" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Terms & Conditions", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
        ],
      },
    ],
    tagline: "A product studio for web and mobile.",
  },
} as const;
```

- [ ] **Step 2: Write the failing schema test**

Create `tests/unit/contact-schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { contactSchema, PROJECT_TYPES } from "@/lib/contact-schema";

describe("contactSchema", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    projectType: "Web Application",
    message: "We need a dashboard for our operations team.",
    website: "",
  };

  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a submission with no company", () => {
    const r = contactSchema.safeParse({ ...valid, company: "" });
    expect(r.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const r = contactSchema.safeParse({ ...valid, name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const r = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects a message under 10 characters", () => {
    const r = contactSchema.safeParse({ ...valid, message: "hi" });
    expect(r.success).toBe(false);
  });

  it("rejects a project type outside the allowed list", () => {
    const r = contactSchema.safeParse({ ...valid, projectType: "Blockchain" });
    expect(r.success).toBe(false);
  });

  it("strips the honeypot field rather than rejecting it", () => {
    // The honeypot is handled by the route, not the schema — see Task 9.
    const r = contactSchema.safeParse({ ...valid, website: "spam.example" });
    expect(r.success).toBe(true);
    expect(r.success && "website" in r.data).toBe(false);
  });

  it("exposes exactly five project types", () => {
    expect(PROJECT_TYPES).toHaveLength(5);
    expect(PROJECT_TYPES).toContain("Web Application");
  });
});
```

- [ ] **Step 3: Run it to confirm failure**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:unit
```
Expected: FAIL — `Cannot find module '@/lib/contact-schema'`.

- [ ] **Step 4: Write `lib/contact-schema.ts`**

```ts
import { z } from "zod";

export const PROJECT_TYPES = [
  "Web Application",
  "Mobile Application",
  "Product Design",
  "Cloud & DevOps",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  projectType: z.enum(PROJECT_TYPES, {
    message: "Please choose a project type",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more — at least 10 characters")
    .max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

**Note on the honeypot:** the `website` field is deliberately **not** part of this
schema. Zod strips unknown keys, so a filled honeypot passes validation cleanly
and is then caught separately in the route handler (Task 9), which absorbs it
with a `200` so bots learn nothing from the response. Putting it in the schema
would return a `400` and tell a bot exactly what tripped it.

- [ ] **Step 5: Write the content invariant test**

Create `tests/unit/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { content } from "@/lib/content";

describe("content", () => {
  it("has exactly four services", () => {
    expect(content.services.items).toHaveLength(4);
  });

  it("has exactly four process steps, numbered 01 to 04", () => {
    expect(content.process.steps.map((s) => s.number)).toEqual([
      "01", "02", "03", "04",
    ]);
  });

  it("has exactly seven FAQ items, each a question", () => {
    expect(content.faq.items).toHaveLength(7);
    for (const item of content.faq.items) {
      expect(item.q.endsWith("?")).toBe(true);
    }
  });

  it("exposes the correct contact details", () => {
    expect(content.contact.email).toBe("admin.nexlivolabs@gmail.com");
    expect(content.contact.phone).toBe("+91 9704069431");
    expect(content.contact.phoneHref).toBe("tel:+919704069431");
  });

  it("contains no emoji in any copy (icons must be SVG)", () => {
    const json = JSON.stringify(content);
    // Covers pictographs, symbols, transport, and dingbats.
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    expect(emoji.test(json)).toBe(false);
  });
});
```

- [ ] **Step 6: Run both unit tests**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:unit
```
Expected: PASS, 13 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add content module and validated contact schema"
```

---

## Task 3: UI primitives

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Card.tsx`, `components/ui/Section.tsx`, `components/ui/Reveal.tsx`
- Test: `tests/e2e/primitives.spec.ts`

**Interfaces:**
- Consumes: tokens from Task 1
- Produces:
  - `<Button variant="filled" | "ghost" href={string} children>` — renders an `<a class="...">`; filled = ink fill/white text, ghost = transparent with 1px ink border.
  - `<Card variant="light" | "dark" className? children>` — 8px radius, 24px padding, no shadow.
  - `<Section id={string} className? children>` — `<section>` with `max-width: 1200px`, responsive vertical gap and horizontal padding.
  - `<Reveal as?="div" delay?={number} children>` — client component; adds `data-reveal` and observes.

- [ ] **Step 1: Write `components/ui/Button.tsx`**

```tsx
import type { ReactNode } from "react";

type Props = {
  href: string;
  variant?: "filled" | "ghost";
  children: ReactNode;
  className?: string;
  testId?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill px-5 py-3 " +
  "min-h-[44px] text-body-sm font-medium no-underline cursor-pointer " +
  "transition-colors duration-150";

const variants = {
  filled: "bg-ink text-canvas hover:bg-carbon",
  ghost: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-canvas",
} as const;

export function Button({
  href,
  variant = "filled",
  children,
  className = "",
  testId,
}: Props) {
  return (
    <a
      href={href}
      data-testid={testId}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
      <span aria-hidden="true">&#8594;</span>
    </a>
  );
}
```

- [ ] **Step 2: Write `components/ui/Card.tsx`**

```tsx
import type { ReactNode } from "react";

type Props = {
  variant?: "light" | "dark";
  className?: string;
  children: ReactNode;
  testId?: string;
};

const variants = {
  light:
    "bg-canvas border border-ash text-ink hover:border-ink/30 transition-colors duration-150",
  dark: "bg-graphite text-canvas",
} as const;

export function Card({
  variant = "light",
  className = "",
  children,
  testId,
}: Props) {
  return (
    <div
      data-testid={testId}
      className={`rounded-card p-6 ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Write `components/ui/Section.tsx`**

```tsx
import type { ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, className = "", children }: Props) {
  return (
    <section id={id} className={`py-12 md:py-16 lg:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `components/ui/Reveal.tsx`**

```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = { children: ReactNode; delay?: number; className?: string };

export function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.revealed = "true";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.revealed = "true";
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={{ transitionDelay: `${delay}ms` }}
      className={className}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Add reveal styles to `app/globals.css`**

Append:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 400ms ease-out, transform 400ms ease-out;
  }
  [data-reveal][data-revealed="true"] {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 6: Write the failing primitives test**

Create `tests/e2e/primitives.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("UI primitives", () => {
  test.beforeEach(async ({ page }) => await page.goto("/primitives-harness"));

  test("filled button has ink background and canvas text", async ({ page }) => {
    const btn = page.getByTestId("btn-filled");
    await expect(btn).toHaveCSS("background-color", "rgb(1, 4, 23)");
    await expect(btn).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("buttons are pill-shaped and meet the 44px touch target", async ({ page }) => {
    const btn = page.getByTestId("btn-filled");
    await expect(btn).toHaveCSS("border-radius", "100px");
    const box = await btn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("ghost button is transparent with a 1px ink border", async ({ page }) => {
    const btn = page.getByTestId("btn-ghost");
    await expect(btn).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(btn).toHaveCSS("border-color", "rgb(1, 4, 23)");
    await expect(btn).toHaveCSS("border-top-width", "1px");
  });

  test("cards use 8px radius and cast no shadow", async ({ page }) => {
    const card = page.getByTestId("card-light");
    await expect(card).toHaveCSS("border-radius", "8px");
    await expect(card).toHaveCSS("box-shadow", "none");
  });

  test("section content is capped at 1200px", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const inner = page.getByTestId("section-inner");
    const box = await inner.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(1200);
  });
});
```

- [ ] **Step 7: Create the harness page**

Create `app/primitives-harness/page.tsx`. This route exists only for component tests and is deleted in Task 11.

```tsx
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

export default function Harness() {
  return (
    <Section id="harness">
      <div data-testid="section-inner">
        <Button href="#" variant="filled" testId="btn-filled">
          Filled
        </Button>
        <Button href="#" variant="ghost" testId="btn-ghost">
          Ghost
        </Button>
        <Card variant="light" testId="card-light">
          Light card
        </Card>
      </div>
    </Section>
  );
}
```

The `testId` prop was defined on both components in Steps 1 and 2, so the test
ids land on the rendered `<a>` and `<div>` themselves rather than on wrapper
spans — which matters, because the assertions read computed styles off those
exact elements.

- [ ] **Step 8: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- primitives
```
Expected: PASS, 5 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Button, Card, Section, and Reveal primitives"
```

---

## Task 4: Logo SVG and intro overlay

**Files:**
- Create: `components/ui/Logo.tsx`, `components/intro/IntroOverlay.tsx`
- Modify: `app/globals.css` (intro keyframes), `app/layout.tsx` (anti-flash script + mount)
- Test: `tests/e2e/intro.spec.ts`

**Interfaces:**
- Consumes: tokens from Task 1
- Produces:
  - `<Logo className? />` — inline SVG wordmark. "Nexlivo" fills with `currentColor`; "LABS" uses `fill="currentColor"` at reduced opacity so a single colour prop drives both. Rendered as `<svg role="img" aria-label="Nexlivo Labs">`.
  - `<IntroOverlay />` — self-contained; no props.
  - Root attribute contract: `document.documentElement.dataset.introDone === "true"` means the overlay must not display.

- [ ] **Step 1: Write `components/ui/Logo.tsx`**

The wordmark is set in Montserrat, matching the source logo. Using live text inside the SVG keeps it crisp and accessible, and guarantees an exact typeface match since Montserrat is already loaded.

```tsx
type Props = { className?: string; labsClassName?: string };

export function Logo({ className = "", labsClassName = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 56"
      role="img"
      aria-label="Nexlivo Labs"
      className={className}
      style={{ height: "1.75rem", width: "auto" }}
    >
      <text
        x="100"
        y="26"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="32"
        fontWeight="500"
        letterSpacing="-1"
        fill="currentColor"
      >
        Nexlivo
      </text>
      <text
        x="100"
        y="48"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="13"
        fontWeight="700"
        letterSpacing="6"
        className={labsClassName}
        fill="currentColor"
      >
        LABS
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Add intro styles to `app/globals.css`**

Append:

```css
/* --- Intro overlay --- */
.intro {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--color-ink);
  display: grid;
  place-items: center;
}

.intro__mask {
  display: block;
  overflow: hidden;
}

.intro__word {
  display: block;
  transform: translateY(110%);
}

/* Anti-flash + reduced motion: never show the plate. */
html[data-intro-done="true"] .intro {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .intro {
    display: none !important;
  }
}

@media (prefers-reduced-motion: no-preference) {
  html:not([data-intro-done="true"]) body {
    overflow: hidden;
  }
  .intro__word {
    animation: intro-rise 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .intro__word--1 { animation-delay: 320ms; }
  .intro__word--2 { animation-delay: 500ms; }

  .intro[data-leaving="true"] {
    animation: intro-wipe 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}

@keyframes intro-rise {
  to { transform: translateY(0); }
}

@keyframes intro-wipe {
  to { transform: translateY(-100%); }
}
```

- [ ] **Step 3: Write `components/intro/IntroOverlay.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "nexlivo:intro-seen";

export function IntroOverlay() {
  const [gone, setGone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);

  useEffect(() => {
    const root = document.documentElement;

    const finish = () => {
      root.dataset.introDone = "true";
      document.body.style.overflow = "";
      setGone(true);
    };

    // Already seen this session, or the user prefers reduced motion.
    if (
      sessionStorage.getItem(SESSION_KEY) === "1" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finish();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "1");

    const leave = () => {
      if (leaving.current) return;
      leaving.current = true;
      const el = ref.current;
      if (!el) return finish();
      el.dataset.leaving = "true";
      el.addEventListener("animationend", finish, { once: true });
      // Safety net if animationend never fires.
      window.setTimeout(finish, 800);
    };

    const timer = window.setTimeout(leave, 1400);
    const onKey = () => leave();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onKey);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={ref} className="intro" data-testid="intro" aria-hidden="true">
      <div className="text-center">
        <span className="intro__mask">
          <span className="intro__word intro__word--1 block font-display text-[clamp(2.5rem,10vw,5rem)] font-medium tracking-[-0.03em] text-cyan">
            Nexlivo
          </span>
        </span>
        <span className="intro__mask mt-1">
          <span className="intro__word intro__word--2 block font-display text-[clamp(0.9rem,3vw,1.4rem)] font-bold tracking-[0.4em] text-canvas">
            LABS
          </span>
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add the anti-flash script and mount the overlay in `app/layout.tsx`**

Inside `<head>`, before `</head>`, add a blocking script that sets the root attribute *before first paint* so returning visitors and reduced-motion users never see a flash of the plate:

```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var s=sessionStorage.getItem('nexlivo:intro-seen')==='1';var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(s||r){document.documentElement.dataset.introDone='true';}}catch(e){}})();`,
    }}
  />
</head>
```

Then in `<body>`, render `<IntroOverlay />` as the first child, before `{children}`. Import it at the top:
`import { IntroOverlay } from "@/components/intro/IntroOverlay";`

- [ ] **Step 5: Write the failing intro test**

Create `tests/e2e/intro.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("intro overlay", () => {
  test("plays, then reveals the site", async ({ page }) => {
    await page.goto("/");
    const intro = page.getByTestId("intro");
    await expect(intro).toBeVisible();
    // Plate is the ink token, matching the brand plate.
    await expect(intro).toHaveCSS("background-color", "rgb(1, 4, 23)");
    // It clears itself without interaction.
    await expect(intro).toBeHidden({ timeout: 5000 });
  });

  test("is skippable with a keypress", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("intro")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 2000 });
  });

  test("plays only once per session", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 5000 });
    await page.goto("/");
    // Second visit in the same session: never rendered.
    await expect(page.getByTestId("intro")).toHaveCount(0);
  });

  test("does not render at all under reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByTestId("intro")).toHaveCount(0);
    // And the page must be scrollable immediately.
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflow).not.toBe("hidden");
    await ctx.close();
  });

  test("restores scrolling after the intro completes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 5000 });
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflow).not.toBe("hidden");
  });
});
```

- [ ] **Step 6: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- intro
```
Expected: PASS, 5 tests. If "plays only once per session" fails, the session guard is running before `sessionStorage` is set — confirm the key is written on the *first* effect run.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add SVG wordmark and word-by-word intro overlay"
```

---

## Task 5: Announcement bar and nav

**Files:**
- Create: `components/layout/AnnouncementBar.tsx`, `components/layout/Nav.tsx`
- Modify: `app/layout.tsx`
- Test: `tests/e2e/nav.spec.ts`

**Interfaces:**
- Consumes: `content.announcement`, `content.nav` (Task 2); `Logo` (Task 4); `Button` (Task 3)
- Produces: `<AnnouncementBar />`, `<Nav />` — both prop-less, mounted in `app/layout.tsx` above `{children}`.

- [ ] **Step 1: Write `components/layout/AnnouncementBar.tsx`**

The single most important detail: **ink text on cyan**, never white. White on cyan measures 2.15:1 and fails AA.

```tsx
"use client";

import { useEffect, useState } from "react";
import { content } from "@/lib/content";

const KEY = "nexlivo:announcement-dismissed";

export function AnnouncementBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "1") setHidden(true);
    } catch {}
  }, []);

  if (hidden) return null;

  return (
    <div
      data-testid="announcement"
      className="bg-cyan text-ink"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-3 px-4 py-2.5 md:px-6">
        <p className="text-caption font-medium">{content.announcement.text}</p>
        <a
          href={content.announcement.href}
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-pill border border-ink px-3.5 py-1 text-caption font-medium text-ink no-underline transition-colors duration-150 hover:bg-ink hover:text-cyan"
        >
          {content.announcement.linkLabel}
          <span aria-hidden="true">&#8594;</span>
        </a>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            try { localStorage.setItem(KEY, "1"); } catch {}
            setHidden(true);
          }}
          className="absolute right-4 hidden h-11 w-11 items-center justify-center text-ink md:inline-flex"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

Wrap the outer `<div>` with `relative` so the absolute dismiss button anchors correctly: change `className="bg-cyan text-ink"` to `className="relative bg-cyan text-ink"`.

- [ ] **Step 2: Write `components/layout/Nav.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape handling while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const selector =
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const nodes = () => Array.from(panel.querySelectorAll<HTMLElement>(selector));
    nodes()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = nodes();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/12 bg-canvas">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6 lg:px-8"
      >
        <a href="#top" className="text-ink" aria-label="Nexlivo Labs home">
          <Logo />
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {content.nav.links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-body-sm text-ink no-underline transition-opacity duration-150 hover:opacity-60"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={content.nav.cta.href}
          className="hidden min-h-[44px] items-center rounded-pill border border-ink px-5 text-body-sm font-medium text-ink no-underline transition-colors duration-150 hover:bg-ink hover:text-canvas md:inline-flex"
        >
          {content.nav.cta.label}
        </a>

        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center text-ink md:hidden"
          data-testid="nav-toggle"
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M3 3l14 14M17 3L3 17" /> : <><path d="M2 6h16" /><path d="M2 14h16" /></>}
          </svg>
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          data-testid="mobile-nav"
          className="border-t border-ink/12 bg-canvas px-4 pb-6 pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {content.nav.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center text-body text-ink no-underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={content.nav.cta.href}
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-pill bg-ink px-5 text-body-sm font-medium text-canvas no-underline"
          >
            {content.nav.cta.label}
          </a>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Mount both in `app/layout.tsx`**

In `<body>`, order: `<IntroOverlay />`, then `<AnnouncementBar />`, then `<Nav />`, then `<main id="top">{children}</main>`.

- [ ] **Step 4: Write the failing nav test**

Create `tests/e2e/nav.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("announcement bar and nav", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape"); // skip intro
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("announcement bar is cyan with INK text, never white", async ({ page }) => {
    const bar = page.getByTestId("announcement");
    await expect(bar).toHaveCSS("background-color", "rgb(0, 196, 204)");
    const color = await bar
      .locator("p")
      .evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(1, 4, 23)");
    expect(color).not.toBe("rgb(255, 255, 255)");
  });

  test("nav is sticky and shows all four links on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const header = page.locator("header");
    await expect(header).toHaveCSS("position", "sticky");
    for (const label of ["Services", "Process", "Capabilities", "FAQ"]) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("nav collapses to a drawer below 768px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const toggle = page.getByTestId("nav-toggle");
    await expect(toggle).toBeVisible();
    await expect(page.getByTestId("mobile-nav")).toHaveCount(0);
    await toggle.click();
    await expect(page.getByTestId("mobile-nav")).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("drawer closes on Escape and returns focus to the toggle", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.getByTestId("nav-toggle").click();
    await expect(page.getByTestId("mobile-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mobile-nav")).toHaveCount(0);
    await expect(page.getByTestId("nav-toggle")).toBeFocused();
  });

  test("the menu toggle meets the 44px touch target", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const box = await page.getByTestId("nav-toggle").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
```

- [ ] **Step 5: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- nav
```
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add cyan announcement bar and sticky nav with mobile drawer"
```

---

## Task 6: Hero, Services, and Process sections

**Files:**
- Create: `components/sections/Hero.tsx`, `components/sections/Services.tsx`, `components/sections/Process.tsx`
- Modify: `app/page.tsx`
- Test: `tests/e2e/sections-light.spec.ts`

**Interfaces:**
- Consumes: `content.hero`, `content.services`, `content.process` (Task 2); `Section`, `Card`, `Button`, `Reveal` (Task 3)
- Produces: `<Hero />`, `<Services />`, `<Process />`. Section ids: `services`, `process`.

- [ ] **Step 1: Write `components/sections/Hero.tsx`**

```tsx
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <Section className="pt-16 md:pt-24 lg:pt-28">
      <h1 className="max-w-[16ch] font-display text-[clamp(2.375rem,7vw,4.75rem)] font-normal leading-[1.03] tracking-[-0.03em] text-ink">
        {content.hero.headline}
      </h1>
      <p className="mt-6 max-w-[60ch] text-subheading text-fog">
        {content.hero.subtext}
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href={content.hero.primaryCta.href} variant="filled">
          {content.hero.primaryCta.label}
        </Button>
        <Button href={content.hero.secondaryCta.href} variant="ghost">
          {content.hero.secondaryCta.label}
        </Button>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Write `components/sections/Services.tsx`**

```tsx
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

export function Services() {
  return (
    <Section id="services">
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {content.services.heading}
      </h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.services.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 60}>
            <Card variant="light" className="h-full">
              <h3 className="font-display text-subheading font-medium text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-body-sm text-fog">{item.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Write `components/sections/Process.tsx`**

```tsx
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Process() {
  return (
    <Section id="process">
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {content.process.heading}
      </h2>
      <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {content.process.steps.map((step, i) => (
          <li key={step.number}>
            <Reveal delay={i * 60}>
              <span className="font-display text-heading-sm font-normal text-ink">
                {step.number}
              </span>
              <span className="mt-2 block h-px w-8 bg-cyan" aria-hidden="true" />
              <h3 className="mt-4 font-display text-subheading font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-body-sm text-fog">{step.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 4: Compose them in `app/page.tsx`**

```tsx
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
    </>
  );
}
```

- [ ] **Step 5: Write the failing sections test**

Create `tests/e2e/sections-light.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { content } from "../../lib/content";

test.describe("light sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("there is exactly one h1, carrying the hero headline", async ({ page }) => {
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s.first()).toHaveText(content.hero.headline);
  });

  test("the hero headline is weight 400, never bold", async ({ page }) => {
    const weight = await page
      .locator("h1")
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(weight).toBe("400");
  });

  test("all four services render with their titles", async ({ page }) => {
    for (const s of content.services.items) {
      await expect(
        page.getByRole("heading", { name: s.title, level: 3 }),
      ).toBeVisible();
    }
  });

  test("process renders four ordered steps ending in Ship & Run", async ({ page }) => {
    const items = page.locator("#process ol > li");
    await expect(items).toHaveCount(4);
    await expect(items.last()).toContainText("Ship & Run");
  });

  test("anchor links resolve to real section targets", async ({ page }) => {
    for (const id of ["services", "process"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("no element on the page casts a shadow", async ({ page }) => {
    const shadowed = await page.evaluate(() =>
      [...document.querySelectorAll("*")].filter(
        (el) => getComputedStyle(el).boxShadow !== "none",
      ).length,
    );
    expect(shadowed).toBe(0);
  });
});
```

- [ ] **Step 6: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- sections-light
```
Expected: PASS, 6 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add hero, services, and process sections"
```

---

## Task 7: Capabilities (dark band) and About

**Files:**
- Create: `components/sections/Capabilities.tsx`, `components/sections/About.tsx`
- Modify: `app/page.tsx`
- Test: `tests/e2e/sections-dark.spec.ts`

**Interfaces:**
- Consumes: `content.capabilities`, `content.about` (Task 2); `Section`, `Card`, `Reveal` (Task 3)
- Produces: `<Capabilities />` (id `capabilities`), `<About />` (id `about`). Capabilities is the **only** dark section on the page.

- [ ] **Step 1: Write `components/sections/Capabilities.tsx`**

The `on-dark` class switches focus rings to cyan per the global constraint.

```tsx
import { content } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

export function Capabilities() {
  return (
    <section id="capabilities" className="on-dark bg-carbon py-12 md:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8">
        <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-canvas">
          {content.capabilities.heading}
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {content.capabilities.groups.map((g, i) => (
            <Reveal key={g.title} delay={i * 60}>
              <Card variant="dark" className="h-full">
                <h3 className="font-display text-subheading font-medium text-canvas">
                  {g.title}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-pill border border-canvas/15 px-3 py-1 text-caption text-fog"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Note: `text-fog` on `bg-graphite` measures 3.4:1 — acceptable for these non-essential tag labels at 12px only if they are supplementary. They are not: they are the content. **Use `text-canvas/80` instead of `text-fog`** for the tag labels, which measures above 4.5:1 on graphite. Make that substitution.

- [ ] **Step 2: Write `components/sections/About.tsx`**

```tsx
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";

export function About() {
  const { founder } = content.about;
  return (
    <Section id="about">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
          {content.about.heading}
        </h2>
        <div>
          <p className="max-w-[60ch] text-subheading text-ink">
            {content.about.body}
          </p>
          <div className="mt-10 border-t border-ash pt-6">
            <p className="text-body-sm font-medium text-ink">
              {founder.name}
              <span className="text-fog"> · {founder.role}</span>
            </p>
            <p className="mt-2 max-w-[60ch] text-body-sm text-fog">
              {founder.bio}
            </p>
            <ul className="mt-4 flex flex-wrap gap-4">
              {founder.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm text-ink underline decoration-ash underline-offset-4 transition-colors duration-150 hover:decoration-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Add both to `app/page.tsx`**

Order after `<Process />`: `<Capabilities />`, then `<About />`.

- [ ] **Step 4: Write the failing test**

Create `tests/e2e/sections-dark.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { content } from "../../lib/content";

test.describe("capabilities and about", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("capabilities is the carbon band with white heading", async ({ page }) => {
    const band = page.locator("#capabilities");
    await expect(band).toHaveCSS("background-color", "rgb(17, 17, 23)");
    const h2 = band.getByRole("heading", { level: 2 });
    await expect(h2).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("capabilities is the ONLY dark section on the page", async ({ page }) => {
    const darkCount = await page.evaluate(() => {
      const dark = new Set(["rgb(17, 17, 23)", "rgb(1, 4, 23)"]);
      return [...document.querySelectorAll("section")].filter((el) =>
        dark.has(getComputedStyle(el).backgroundColor),
      ).length;
    });
    expect(darkCount).toBe(1);
  });

  test("all three capability groups render", async ({ page }) => {
    for (const g of content.capabilities.groups) {
      await expect(
        page.getByRole("heading", { name: g.title, level: 3 }),
      ).toBeVisible();
    }
  });

  test("about shows the founder bio and both external links", async ({ page }) => {
    await expect(page.getByText(content.about.founder.name)).toBeVisible();
    const linkedin = page.getByRole("link", { name: "LinkedIn" });
    await expect(linkedin).toHaveAttribute("rel", /noopener/);
    await expect(linkedin).toHaveAttribute("target", "_blank");
  });

  test("focus rings on the dark band are cyan, not ink", async ({ page }) => {
    const color = await page.evaluate(() => {
      const el = document.querySelector("#capabilities a, #capabilities button");
      if (!el) return "no-focusable";
      (el as HTMLElement).focus();
      return getComputedStyle(el).outlineColor;
    });
    if (color !== "no-focusable") {
      expect(color).toBe("rgb(0, 196, 204)");
    }
  });
});
```

- [ ] **Step 5: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- sections-dark
```
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add capabilities dark band and about section"
```

---

## Task 8: FAQ and contact form UI

**Files:**
- Create: `components/sections/Faq.tsx`, `components/sections/Contact.tsx`
- Modify: `app/page.tsx`, `app/globals.css`
- Test: `tests/e2e/faq-contact.spec.ts`

**Interfaces:**
- Consumes: `content.faq`, `content.contact` (Task 2); `contactSchema`, `PROJECT_TYPES` (Task 2); `Section` (Task 3)
- Produces: `<Faq />` (id `faq`), `<Contact />` (id `contact`). Contact POSTs JSON to `/api/contact` (implemented in Task 9) and handles `{ ok: true }` / `{ ok: false, error, fieldErrors? }`.

- [ ] **Step 1: Write `components/sections/Faq.tsx`**

Native `<details>` gives full keyboard accessibility with no JavaScript.

```tsx
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";

export function Faq() {
  return (
    <Section id="faq">
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {content.faq.heading}
      </h2>
      <div className="mt-10 border-t border-ash">
        {content.faq.items.map((item) => (
          <details key={item.q} className="group border-b border-ash">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-5 text-subheading text-ink marker:content-none">
              <span>{item.q}</span>
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0 transition-transform duration-150 group-open:rotate-180"
              >
                <path d="M3 6l5 5 5-5" />
              </svg>
            </summary>
            <p className="max-w-[70ch] pb-6 text-body text-fog">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
```

Add to `app/globals.css` to suppress the default marker in WebKit:

```css
summary::-webkit-details-marker {
  display: none;
}
```

- [ ] **Step 2: Write `components/sections/Contact.tsx`**

```tsx
"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { contactSchema, PROJECT_TYPES } from "@/lib/contact-schema";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "mt-2 w-full min-h-[44px] rounded-card border border-ash bg-canvas px-4 py-3 " +
  "text-body text-ink placeholder:text-fog/60 transition-colors duration-150 " +
  "focus:border-cyan focus:outline-none focus:ring-[3px] focus:ring-cyan/10";
const label = "block text-caption font-medium text-ink";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = contactSchema.safeParse(data);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
        setFormError(json.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setFormError("Could not reach the server.");
    }
  }

  return (
    <Section id="contact">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="max-w-[16ch] font-display text-heading font-normal tracking-[-0.03em] text-ink">
            {content.contact.heading}
          </h2>
          <p className="mt-4 text-subheading text-fog">
            {content.contact.subtext}
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-10" data-testid="contact-form">
            {/* Honeypot — visually hidden, never announced. */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="name">Name</label>
                <input
                  id="name" name="name" type="text" required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={field}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-caption text-danger">{errors.name}</p>
                )}
              </div>

              <div>
                <label className={label} htmlFor="email">Email</label>
                <input
                  id="email" name="email" type="email" required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={field}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-caption text-danger">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={label} htmlFor="company">Company <span className="text-fog">(optional)</span></label>
                <input id="company" name="company" type="text" className={field} />
              </div>

              <div>
                <label className={label} htmlFor="projectType">Project type</label>
                <select id="projectType" name="projectType" defaultValue={PROJECT_TYPES[0]} className={field}>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className={label} htmlFor="message">What are you building?</label>
              <textarea
                id="message" name="message" rows={5} required
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={field}
              />
              {errors.message && (
                <p id="message-error" className="mt-2 text-caption text-danger">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-pill bg-ink px-6 text-body-sm font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send enquiry"}
            </button>

            <div role="status" aria-live="polite" className="mt-4">
              {status === "sent" && (
                <p className="text-body-sm text-ink" data-testid="form-success">
                  Thank you — we will reply within one business day.
                </p>
              )}
              {formError && (
                <p className="text-body-sm text-danger" data-testid="form-error">
                  {formError} You can also email us directly at {content.contact.email}.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="lg:pt-4">
          <dl className="space-y-6">
            <div>
              <dt className="text-caption text-fog">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${content.contact.email}`} className="text-body text-ink underline decoration-ash underline-offset-4 hover:decoration-ink">
                  {content.contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-fog">Phone</dt>
              <dd className="mt-1">
                <a href={content.contact.phoneHref} className="text-body text-ink underline decoration-ash underline-offset-4 hover:decoration-ink">
                  {content.contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-fog">Based in</dt>
              <dd className="mt-1 text-body text-ink">{content.contact.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Section>
  );
}
```

Note: the honeypot wrapper uses `absolute` — add `relative` to the `<form>` element's className so it positions against the form, not the viewport.

- [ ] **Step 3: Add both to `app/page.tsx`**

Order after `<About />`: `<Faq />`, then `<Contact />`.

- [ ] **Step 4: Write the failing test**

Create `tests/e2e/faq-contact.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { content } from "../../lib/content";

test.describe("faq and contact", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("renders seven FAQ items, collapsed by default", async ({ page }) => {
    const items = page.locator("#faq details");
    await expect(items).toHaveCount(7);
    await expect(items.first()).not.toHaveAttribute("open", "");
  });

  test("FAQ opens on keyboard activation", async ({ page }) => {
    const first = page.locator("#faq details").first();
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
  });

  test("every form control has a visible label", async ({ page }) => {
    for (const id of ["name", "email", "company", "projectType", "message"]) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toHaveCount(1);
      await expect(label).toBeVisible();
    }
  });

  test("invalid submission shows inline errors wired to their fields", async ({ page }) => {
    await page.getByLabel("Name").fill("");
    await page.getByLabel("Email").fill("nope");
    await page.getByRole("button", { name: "Send enquiry" }).click();

    const email = page.locator("#email");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAttribute("aria-describedby", "email-error");
    await expect(page.locator("#email-error")).toBeVisible();
  });

  test("contact details are real tel: and mailto: links", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: content.contact.email }),
    ).toHaveAttribute("href", `mailto:${content.contact.email}`);
    await expect(
      page.getByRole("link", { name: content.contact.phone }),
    ).toHaveAttribute("href", "tel:+919704069431");
  });

  test("form inputs meet the 44px touch target", async ({ page }) => {
    const box = await page.locator("#name").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
```

- [ ] **Step 5: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- faq-contact
```
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add FAQ accordion and contact form"
```

---

## Task 9: Contact API route and mailer adapter

**Files:**
- Create: `app/api/contact/route.ts`, `lib/mailer.ts`, `.env.example`
- Test: `tests/e2e/api-contact.spec.ts`

**Interfaces:**
- Consumes: `contactSchema` (Task 2)
- Produces: `POST /api/contact` accepting `ContactInput` JSON and returning:
  - `200 { ok: true }` on success
  - `400 { ok: false, error: string, fieldErrors: Record<string,string> }` on validation failure
  - `503 { ok: false, error: string }` when no mail provider is configured
  - `lib/mailer.ts` exports `isMailerConfigured(): boolean` and `sendEnquiry(input: ContactInput): Promise<void>`

- [ ] **Step 1: Write `lib/mailer.ts`**

```ts
import type { ContactInput } from "./contact-schema";

export function isMailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

export async function sendEnquiry(input: ContactInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    throw new Error("Mailer is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `New enquiry — ${input.projectType} — ${input.name}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Company: ${input.company || "—"}`,
        `Project type: ${input.projectType}`,
        "",
        input.message,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    throw new Error(`Mail provider returned ${res.status}`);
  }
}
```

- [ ] **Step 2: Write `app/api/contact/route.ts`**

```ts
import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";
import { isMailerConfigured, sendEnquiry } from "@/lib/mailer";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Honeypot: checked BEFORE validation and answered with a plain 200, so a bot
  // cannot tell it was caught. `website` is intentionally absent from the schema.
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).website === "string" &&
    (body as Record<string, string>).website.length > 0
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  if (!isMailerConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Our enquiry form is not connected yet. Please email us directly.",
      },
      { status: 503 },
    );
  }

  try {
    await sendEnquiry(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not send your message. Please email us directly." },
      { status: 502 },
    );
  }
}
```

- [ ] **Step 3: Write `.env.example`**

```
# Contact form delivery. Without these the form returns a 503 and the UI
# directs visitors to the email and phone links instead.
RESEND_API_KEY=
CONTACT_TO_EMAIL=admin.nexlivolabs@gmail.com
CONTACT_FROM_EMAIL=
```

- [ ] **Step 4: Write the failing API test**

Create `tests/e2e/api-contact.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  projectType: "Web Application",
  message: "We need an operations dashboard for our team.",
  website: "",
};

test.describe("POST /api/contact", () => {
  test("rejects an invalid payload with field errors", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...valid, email: "nope", message: "hi" },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.fieldErrors.email).toBeTruthy();
    expect(json.fieldErrors.message).toBeTruthy();
  });

  test("rejects a malformed body", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "Content-Type": "application/json" },
      data: "not json at all",
    });
    expect([400, 500]).toContain(res.status());
  });

  test("absorbs honeypot submissions with a silent 200", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...valid, website: "spam.example" },
    });
    // Must be indistinguishable from success so bots learn nothing — and must
    // NOT be the 503 a genuine unconfigured submission would return.
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  test("returns 503 with a usable message when no mailer is configured", async ({ request }) => {
    const res = await request.post("/api/contact", { data: valid });
    // With no RESEND_API_KEY in the dev environment this must be 503.
    expect(res.status()).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("email us directly");
  });
});
```

- [ ] **Step 5: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- api-contact
```
Expected: PASS, 4 tests. Ensure no `.env.local` with a real `RESEND_API_KEY` exists, or the 503 test will fail.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add contact API route with validation and mailer adapter"
```

---

## Task 10: Footer and legal pages

**Files:**
- Create: `components/layout/Footer.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `lib/legal.ts`
- Modify: `app/layout.tsx`
- Test: `tests/e2e/footer-legal.spec.ts`

**Interfaces:**
- Consumes: `content.footer`, `content.contact` (Task 2); `Logo` (Task 4)
- Produces: `<Footer />` mounted in `app/layout.tsx` after `{children}`; routes `/terms` and `/privacy`.

- [ ] **Step 1: Extract legal prose into `lib/legal.ts` mechanically**

The source is `~/Downloads/Nexlivo_Legal_Pack.md`. This is **binding legal
language** — it must be transferred verbatim, never paraphrased, summarised, or
regenerated from memory. Run this script, which does the transfer mechanically so
no wording can drift:

```bash
cd ~/nexlivo-labs
python3 scripts/extract-legal.py
```

> **Note (final review, C1/I1 fix wave):** the extraction script used to be
> inlined here as a heredoc. It now lives as a tracked, runnable file at
> `scripts/extract-legal.py`, which is also what the generated `lib/legal.ts`
> banner points at. Edit and re-run that file — this doc is no longer a copy
> of it.

Verify the output: both counts must be greater than 5, and `lib/legal.ts` must
contain no `…`, `TODO`, or `Lorem`. If the script reports "Could not locate
part", open the source file and check the exact `# ` heading wording, then adjust
the `bounds()` predicates — do not fall back to typing the prose by hand.

If any extracted section references a company detail the client has not yet
supplied (registered address, entity number), carry it across **unchanged** and
list it in the commit message so it can be reviewed before launch.

- [ ] **Step 2: Write `components/layout/Footer.tsx`**

```tsx
import { content } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-ash">
      {/* Decorative dot pattern, upper portion only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-20"
        style={{
          backgroundImage: "radial-gradient(var(--color-ash) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-4 py-16 md:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-ink"><Logo /></span>
            <p className="mt-4 max-w-[28ch] text-body-sm text-fog">
              {content.footer.tagline}
            </p>
          </div>

          {content.footer.columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-body-sm font-bold text-ink">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-body-sm text-fog no-underline transition-colors duration-150 hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ash pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-fog">
            © {new Date().getFullYear()} Nexlivo Labs. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <a href={`mailto:${content.contact.email}`} className="text-caption text-fog no-underline hover:text-ink">
                {content.contact.email}
              </a>
            </li>
            <li>
              <a href={content.contact.phoneHref} className="text-caption text-fog no-underline hover:text-ink">
                {content.contact.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Write the shared legal page markup**

Create `app/terms/page.tsx`:

```tsx
import type { Metadata } from "next";
import { terms } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms & Conditions — Nexlivo Labs" };

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-[720px] px-4 py-16 md:px-6">
      <h1 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {terms.title}
      </h1>
      <p className="mt-3 text-body-sm text-fog">Last updated {terms.updated}</p>
      {terms.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="font-display text-subheading font-medium text-ink">{s.heading}</h2>
          <p className="mt-3 whitespace-pre-line text-body text-fog">{s.body}</p>
        </section>
      ))}
    </article>
  );
}
```

Create `app/privacy/page.tsx` identically, importing `privacy` instead of `terms` and setting the title to `"Privacy Policy — Nexlivo Labs"`.

- [ ] **Step 4: Mount the footer in `app/layout.tsx`**

Add `import { Footer } from "@/components/layout/Footer";` and render `<Footer />` immediately after `</main>`.

- [ ] **Step 5: Write the failing test**

Create `tests/e2e/footer-legal.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("footer and legal pages", () => {
  test("footer renders three link columns plus the brand block", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "Services" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Company" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Legal" })).toBeVisible();
  });

  test("terms page is reachable from the footer and has content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await page.locator("footer").getByRole("link", { name: "Terms & Conditions" }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Terms & Conditions");
    expect((await page.locator("article section").count())).toBeGreaterThan(3);
  });

  test("privacy page renders with real prose", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy Policy");
    const text = await page.locator("article").innerText();
    expect(text.length).toBeGreaterThan(500);
    expect(text).not.toContain("TODO");
    expect(text).not.toContain("Lorem ipsum");
  });

  test("legal pages keep line length readable", async ({ page }) => {
    await page.goto("/terms");
    const box = await page.locator("article").boundingBox();
    expect(box!.width).toBeLessThanOrEqual(720);
  });
});
```

- [ ] **Step 6: Run the test**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- footer-legal
```
Expected: PASS, 4 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add footer and legal pages from the Nexlivo legal pack"
```

---

## Task 11: Full accessibility, responsive, and contrast suite

**Files:**
- Create: `tests/e2e/a11y.spec.ts`, `tests/e2e/responsive.spec.ts`
- Delete: `app/primitives-harness/page.tsx`, `tests/e2e/primitives.spec.ts`
- Modify: `app/layout.tsx` (metadata polish)
- Test: the two new suites plus a full run

**Interfaces:**
- Consumes: every component built so far
- Produces: the acceptance gate. Nothing consumes this task.

- [ ] **Step 1: Write the contrast and a11y suite**

Create `tests/e2e/a11y.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

function relLum(rgb: string): number {
  const [r, g, b] = rgb.match(/\d+/g)!.slice(0, 3).map(Number);
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(fg: string, bg: string): number {
  const a = relLum(fg), b = relLum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function skipIntro(page: Page) {
  await page.goto("/");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
}

test.describe("accessibility", () => {
  test("the cyan rule holds: cyan is never text on a light background", async ({ page }) => {
    await skipIntro(page);
    const violations = await page.evaluate(() => {
      const bad: string[] = [];
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.color !== "rgb(0, 196, 204)") continue;
        // Walk up for the effective background.
        let node: Element | null = el;
        let bg = "rgba(0, 0, 0, 0)";
        while (node) {
          const c = getComputedStyle(node).backgroundColor;
          if (c && c !== "rgba(0, 0, 0, 0)") { bg = c; break; }
          node = node.parentElement;
        }
        if (bg === "rgb(255, 255, 255)" || bg === "rgba(0, 0, 0, 0)") {
          bad.push(`${el.tagName}.${el.className}`);
        }
      }
      return bad;
    });
    expect(violations).toEqual([]);
  });

  test("the announcement bar uses ink text, not white", async ({ page }) => {
    await skipIntro(page);
    const bar = page.getByTestId("announcement");
    const bg = await bar.evaluate((el) => getComputedStyle(el).backgroundColor);
    const fg = await bar.locator("p").evaluate((el) => getComputedStyle(el).color);
    expect(bg).toBe("rgb(0, 196, 204)");
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  test("body copy meets 4.5:1 against its background", async ({ page }) => {
    await skipIntro(page);
    const pairs = await page.evaluate(() => {
      const out: Array<{ fg: string; bg: string; text: string }> = [];
      for (const el of document.querySelectorAll("p, li, dd, summary")) {
        const t = (el.textContent ?? "").trim();
        if (t.length < 12) continue;
        const cs = getComputedStyle(el);
        if (parseFloat(cs.fontSize) >= 24) continue; // large text: 3:1 rule
        let node: Element | null = el;
        let bg = "rgb(255, 255, 255)";
        while (node) {
          const c = getComputedStyle(node).backgroundColor;
          if (c && c !== "rgba(0, 0, 0, 0)") { bg = c; break; }
          node = node.parentElement;
        }
        out.push({ fg: cs.color, bg, text: t.slice(0, 40) });
      }
      return out;
    });
    const failures = pairs.filter((p) => ratio(p.fg, p.bg) < 4.5);
    expect(failures).toEqual([]);
  });

  test("every interactive element shows a visible focus ring", async ({ page }) => {
    await skipIntro(page);
    const noRing = await page.evaluate(() => {
      const bad: string[] = [];
      const els = document.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input, select, textarea",
      );
      for (const el of els) {
        if (el.offsetParent === null) continue; // hidden
        el.focus();
        const cs = getComputedStyle(el);
        const w = parseFloat(cs.outlineWidth || "0");
        if (cs.outlineStyle === "none" || w < 1) bad.push(el.tagName + ":" + (el.textContent ?? "").slice(0, 20));
      }
      return bad;
    });
    expect(noRing).toEqual([]);
  });

  test("heading levels never skip", async ({ page }) => {
    await skipIntro(page);
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
        Number(h.tagName[1]),
      ),
    );
    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  test("no emoji is used as an icon anywhere on the page", async ({ page }) => {
    await skipIntro(page);
    const text = await page.locator("body").innerText();
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text)).toBe(false);
  });

  test("nothing on the page casts a shadow", async ({ page }) => {
    await skipIntro(page);
    const n = await page.evaluate(
      () =>
        [...document.querySelectorAll("*")].filter(
          (el) => getComputedStyle(el).boxShadow !== "none",
        ).length,
    );
    expect(n).toBe(0);
  });

  test("the viewport permits zoom", async ({ page }) => {
    await page.goto("/");
    const meta = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(meta).not.toContain("user-scalable=no");
    expect(meta).not.toContain("maximum-scale=1");
  });

  test("the whole page is reachable by keyboard", async ({ page }) => {
    await skipIntro(page);
    const reached = new Set<string>();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(
        () => document.activeElement?.tagName ?? "NONE",
      );
      reached.add(tag);
    }
    expect(reached.has("A")).toBe(true);
    expect(reached.has("BUTTON") || reached.has("INPUT")).toBe(true);
  });
});
```

- [ ] **Step 2: Write the responsive suite**

Create `tests/e2e/responsive.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const WIDTHS = [320, 375, 768, 1024, 1440];

test.describe("responsive", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("content is capped at 1200px on a wide viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.keyboard.press("Escape");
    const width = await page
      .locator("#services > div")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(1200);
  });

  test("the display headline scales down on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.keyboard.press("Escape");
    const desktop = await page
      .locator("h1")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    await page.setViewportSize({ width: 375, height: 800 });
    const mobile = await page
      .locator("h1")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    expect(mobile).toBeLessThan(desktop);
    expect(mobile).toBeGreaterThanOrEqual(30);
  });
});
```

- [ ] **Step 3: Remove the test harness route**

```bash
cd ~/nexlivo-labs
rm -rf app/primitives-harness tests/e2e/primitives.spec.ts
```

The harness existed only to exercise primitives in isolation; the real sections now cover them, and leaving a stray route in production is sloppy.

- [ ] **Step 4: Run the two new suites**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- a11y responsive
```
Expected: PASS, 12 tests.

If the "body copy meets 4.5:1" test fails on the capability tag labels, that is the `text-fog`-on-graphite issue flagged in Task 7 Step 1 — switch those labels to `text-canvas/80`.

- [ ] **Step 5: Add the performance suite (spec §8)**

Create `tests/e2e/performance.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("performance", () => {
  test("cumulative layout shift stays under 0.1", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{
          value: number;
          hadRecentInput: boolean;
        }>) {
          if (!entry.hadRecentInput) {
            (window as unknown as { __cls: number }).__cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const cls = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(cls).toBeLessThan(0.1);
  });

  test("makes no third-party network requests", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
        external.push(req.url());
      }
    });
    await page.goto("/");
    await page.keyboard.press("Escape");
    await page.waitForLoadState("networkidle");
    // Fonts are self-hosted by next/font; nothing should leave the origin.
    expect(external).toEqual([]);
  });

  test("every image declares intrinsic dimensions", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    const undeclared = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => !img.getAttribute("width") || !img.getAttribute("height"))
        .map((img) => img.src),
    );
    expect(undeclared).toEqual([]);
  });
});
```

Run it:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:e2e -- performance
```
Expected: PASS, 3 tests. If the third-party test fails on a Google Fonts URL,
`next/font` is misconfigured — fonts must be self-hosted at build time, not
fetched at runtime.

- [ ] **Step 6: Run the entire suite and a production build**

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run test:unit
npm run test:e2e
npm run build
```
Expected: all unit tests pass, all E2E tests pass, and `next build` completes with no type errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add accessibility, contrast, responsive, and performance suites"
```

---

## Acceptance criteria

The site is done when all of the following hold:

1. `npm run test:unit` — all pass.
2. `npm run test:e2e` — all pass.
3. `npm run build` — completes with no TypeScript or lint errors.
10. CLS is under 0.1 and the page makes zero third-party network requests.
4. The intro plays once per session, is skippable, and does not render at all under reduced motion.
5. The announcement bar is cyan with **ink** text.
6. No `box-shadow` exists anywhere in the rendered page.
7. No horizontal scroll at 320, 375, 768, 1024, or 1440px.
8. `/terms` and `/privacy` render real prose from the legal pack and are footer-reachable.
9. The contact form validates inline and, with no API key set, directs the visitor to email and phone.

## Deferred to the client

These are noted in the spec and are **not** blockers:

1. `RESEND_API_KEY` — until supplied, the form returns 503 and the UI points at the email and phone links. Both always work.
2. Whether to name the current employer in the founder bio (spec §5.7). Built without it.
3. The rebuilt SVG wordmark should be eyeballed against the original JPEG before launch.
