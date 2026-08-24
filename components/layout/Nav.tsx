"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Every path that closes the drawer - Escape, a drawer link, the drawer
  // CTA, or the toggle itself while open - must return focus to the toggle
  // button explicitly. Relying on "the toggle was just clicked so it's
  // already focused" doesn't hold in Safari, which doesn't focus buttons
  // on click, so this is called from all four sites rather than assumed.
  //
  // The drawer links navigate to in-page anchors (#services, #process,
  // and eventually #capabilities/#faq). A same-document fragment
  // navigation's default action runs synchronously right after this
  // handler returns, and per the HTML fragment-navigation algorithm it
  // will itself attempt to move focus based on the target element - since
  // section targets aren't natively focusable, that clears focus entirely
  // and stomps the focus() call below. Deferring to the next animation
  // frame lets that browser-driven focus change happen first, so ours is
  // the one that wins.
  const closeDrawer = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

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
        closeDrawer();
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
  }, [open, closeDrawer]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/12 bg-canvas">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6 lg:px-8"
      >
        {/* Rooted, not "#top": the header renders on /terms and /privacy too,
            where a bare fragment would leave the visitor on the legal page. */}
        <a
          href={content.nav.home.href}
          className="text-ink"
          aria-label={content.nav.home.label}
        >
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
          onClick={() => (open ? closeDrawer() : setOpen(true))}
          className="inline-flex h-11 w-11 items-center justify-center text-ink md:hidden"
          data-testid="nav-toggle"
        >
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {open ? (
              <path d="M3 3l14 14M17 3L3 17" />
            ) : (
              <>
                <path d="M2 6h16" />
                <path d="M2 14h16" />
              </>
            )}
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
                  onClick={closeDrawer}
                  className="flex min-h-[44px] items-center text-body text-ink no-underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={content.nav.cta.href}
            onClick={closeDrawer}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-pill bg-ink px-5 text-body-sm font-medium text-canvas no-underline"
          >
            {content.nav.cta.label}
          </a>
        </div>
      )}
    </header>
  );
}
