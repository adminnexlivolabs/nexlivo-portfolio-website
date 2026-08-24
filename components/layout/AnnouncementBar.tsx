"use client";

import { useState } from "react";
import { content } from "@/lib/content";

const KEY = "nexlivo:announcement-dismissed";

export function AnnouncementBar() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  // Initial visibility for a returning visitor who already dismissed this is
  // handled entirely by CSS: the inline <head> script (app/layout.tsx) reads
  // localStorage before first paint and sets data-announcement-dismissed on
  // <html>, and globals.css hides .announcement-bar on that attribute — the
  // same pattern IntroOverlay uses for data-js/data-intro-done. That means
  // this component never needs to read localStorage itself just to decide
  // whether to render, so there is no post-mount setState and no flash of
  // the bar for visitors who already dismissed it.
  return (
    <div
      data-testid="announcement"
      className="announcement-bar relative bg-cyan text-ink"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-3 py-2.5 pl-4 pr-16 md:pl-6 md:pr-16">
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
            try {
              localStorage.setItem(KEY, "1");
            } catch {}
            setHidden(true);
          }}
          className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-ink"
        >
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
