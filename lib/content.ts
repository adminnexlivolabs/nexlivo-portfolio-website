// Chrome-level section links (announcement / nav / footer) are written ROOTED
// ("/#services", not "#services") because those three components are mounted in
// app/layout.tsx and therefore render on EVERY route, including /terms and
// /privacy. A bare "#services" resolves against the *current* document, so from
// /terms it would only rewrite the fragment and leave the visitor stranded on
// the legal page with no way home. The leading "/" makes each one resolve to the
// homepage section from anywhere; on the homepage itself the browser still
// treats it as a same-document fragment navigation, so in-page scrolling is
// unchanged.
//
// `hero` below deliberately keeps bare fragments: it renders only inside
// app/page.tsx, so it can never be reached from another route, and a
// document-relative fragment preserves any query string (utm_* and friends)
// that a rooted href would drop.
export const content = {
  announcement: {
    text: "Nexlivo Labs is taking on new projects this quarter.",
    linkLabel: "Get in touch",
    href: "/#contact",
  },

  nav: {
    home: { label: "Nexlivo Labs home", href: "/" },
    links: [
      { label: "Services", href: "/#services" },
      { label: "Process", href: "/#process" },
      { label: "Capabilities", href: "/#capabilities" },
      { label: "FAQ", href: "/#faq" },
    ],
    cta: { label: "Contact", href: "/#contact" },
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
    // Announced in the form's role="status" region when client-side validation
    // rejects a submission. The inline per-field messages are correct but sit
    // away from where focus and screen-reader attention are (the submit
    // button), so without this a failed submit is silent.
    validationSummary: "Please fix the highlighted fields below.",
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
          { label: "Web Applications", href: "/#services" },
          { label: "Mobile Applications", href: "/#services" },
          { label: "Product Design", href: "/#services" },
          { label: "Cloud & DevOps", href: "/#services" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/#about" },
          { label: "Process", href: "/#process" },
          { label: "Capabilities", href: "/#capabilities" },
          { label: "FAQ", href: "/#faq" },
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
    social: [
      { label: "Instagram", href: "https://www.instagram.com/nexlivolabs/?hl=en" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/nexlivo-labs/" },
    ],
  },
} as const;
