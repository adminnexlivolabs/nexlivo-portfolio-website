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
