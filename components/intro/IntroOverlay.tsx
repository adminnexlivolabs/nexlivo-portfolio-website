"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "nexlivo:intro-seen";

export function IntroOverlay() {
  const [gone, setGone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  // Snapshot the "already seen / reduced motion" decision once, at render
  // time, before any effect can mutate sessionStorage. Reading this fresh
  // from inside the effect body would break under React's development
  // Strict Mode, which mounts -> cleans up -> remounts effects once: the
  // first mount writes the session key, so a naive re-read on the
  // simulated remount would see "already seen" and skip the intro that
  // was supposed to play. The ref is stable across that remount because
  // it belongs to the same component instance.
  const skip = useRef<boolean | null>(null);
  if (skip.current === null) {
    skip.current =
      typeof window !== "undefined" &&
      (sessionStorage.getItem(SESSION_KEY) === "1" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  useEffect(() => {
    const root = document.documentElement;

    const finish = () => {
      root.dataset.introDone = "true";
      document.body.style.overflow = "";
      setGone(true);
    };

    // Already seen this session, or the user prefers reduced motion.
    if (skip.current) {
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
