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
    // :focus-visible does not reliably match programmatic element.focus()
    // on anchors/buttons in Chromium - it must be driven by real keyboard
    // navigation (Tab), or this test would report missing rings that are
    // actually present. So this walks the page with real Tab presses
    // rather than calling .focus() from page.evaluate().
    //
    // The selector excludes tabindex="-1" nodes (e.g. the contact form's
    // honeypot input) - those are deliberately removed from tab order and
    // Tab will never land on them, so counting them would make full
    // coverage unreachable.
    const selector =
      'a[href], button:not([disabled]), input:not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const total = await page.evaluate((sel) => {
      const els = [...document.querySelectorAll<HTMLElement>(sel)];
      let n = 0;
      els.forEach((el, i) => {
        if (el.offsetParent === null) return; // hidden
        el.setAttribute("data-focus-probe", String(i));
        n++;
      });
      return n;
    }, selector);

    const seen = new Set<string>();
    const bad: string[] = [];
    const maxPresses = total + 10;
    for (let i = 0; i < maxPresses && seen.size < total; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const probe = el.getAttribute("data-focus-probe");
        if (probe === null) return null;
        const cs = getComputedStyle(el);
        const w = parseFloat(cs.outlineWidth || "0");
        const ringed =
          el.matches(":focus-visible") && cs.outlineStyle !== "none" && w >= 1;
        return { probe, ringed, tag: el.tagName, text: (el.textContent ?? "").slice(0, 20) };
      });
      if (!info) continue; // focus left the document, or landed off-probe
      if (seen.has(info.probe)) continue; // already checked (wraparound)
      seen.add(info.probe);
      if (!info.ringed) bad.push(`${info.tag}:${info.text}`);
    }

    // Full coverage: every probed element actually received focus once.
    expect(seen.size).toBe(total);
    expect(bad).toEqual([]);
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
