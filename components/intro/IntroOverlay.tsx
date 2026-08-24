"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "nexlivo:intro-seen";

// sessionStorage access can throw (SecurityError) when a browser has site
// data / storage blocked. These wrappers keep that from ever crashing a
// render or an effect — the worst case is the intro simply plays again.
function sessionSeen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markSessionSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Ignore: storage unavailable.
  }
}

export function IntroOverlay() {
  const [gone, setGone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const safetyTimer = useRef<number | null>(null);
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
      (sessionSeen() ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  useEffect(() => {
    const root = document.documentElement;

    const clearSafetyTimer = () => {
      if (safetyTimer.current !== null) {
        window.clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }
    };

    const finish = () => {
      clearSafetyTimer();
      root.dataset.introDone = "true";
      document.body.style.overflow = "";
      setGone(true);
    };

    // Already seen this session, or the user prefers reduced motion.
    if (skip.current) {
      finish();
      return;
    }

    markSessionSeen();

    // Captured at the moment the listener is attached, so cleanup can
    // remove it from the exact node it was added to without re-reading
    // ref.current (which may have already changed by the time cleanup
    // runs).
    let listenerEl: HTMLDivElement | null = null;

    // The plate's animationend listener must ignore the child words'
    // rise animations bubbling up (they end at ~840ms/~1020ms): only the
    // plate's own intro-wipe animation means "done". Without this check,
    // skipping before the second word finishes rising fires finish()
    // immediately and the wipe never plays.
    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName !== "intro-wipe") return;
      finish();
    };

    const leave = () => {
      if (leaving.current) return;
      leaving.current = true;
      const el = ref.current;
      if (!el) return finish();
      el.dataset.leaving = "true";
      listenerEl = el;
      el.addEventListener("animationend", onAnimationEnd);
      // Safety net if animationend never fires.
      safetyTimer.current = window.setTimeout(finish, 800);
    };

    const timer = window.setTimeout(leave, 1400);
    const onKey = () => leave();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onKey);

    return () => {
      window.clearTimeout(timer);
      clearSafetyTimer();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onKey);
      listenerEl?.removeEventListener("animationend", onAnimationEnd);
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
