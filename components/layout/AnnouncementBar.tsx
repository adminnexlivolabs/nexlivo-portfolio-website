"use client";

import { useEffect, useState } from "react";
import { content } from "@/lib/content";

const KEY = "nexlivo:announcement-dismissed";

export function AnnouncementBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Reading a persisted dismissal from localStorage on mount, so the
    // server-rendered (always-visible) markup matches hydration and only
    // flips to hidden once we know the client's prior choice.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(KEY) === "1") setHidden(true);
    } catch {}
  }, []);

  if (hidden) return null;

  return (
    <div data-testid="announcement" className="relative bg-cyan text-ink">
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
            try {
              localStorage.setItem(KEY, "1");
            } catch {}
            setHidden(true);
          }}
          className="absolute right-4 hidden h-11 w-11 items-center justify-center text-ink md:inline-flex"
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
