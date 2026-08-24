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
    // Must actually have played first, or the assertions below can't
    // distinguish "played then cleared" from "never played at all" -
    // toBeHidden()/toHaveCount(0) both pass vacuously for an element
    // that never existed.
    await expect(page.getByTestId("intro")).toBeVisible();
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

  test("does not block the page or lock scroll with JavaScript disabled", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    // The inline anti-flash script never ran, so data-js is never set.
    // The plate must stay hidden by CSS regardless - it must not sit
    // over the page waiting for JS that will never arrive.
    await expect(page.getByTestId("intro")).toBeHidden();
    const overflow = await page.evaluate(
      () => getComputedStyle(document.body).overflow,
    );
    expect(overflow).not.toBe("hidden");
    await ctx.close();
  });

  test("reveal-gated content is visible immediately with JavaScript disabled", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/primitives-harness");
    await expect(page.getByTestId("reveal-target")).toHaveCSS(
      "opacity",
      "1",
    );
    await ctx.close();
  });

  test("reveal-gated content becomes fully visible with JavaScript on", async ({
    page,
  }) => {
    await page.goto("/primitives-harness");
    // This is what F1 broke: the data-js re-scope of the hidden rule
    // must not outrank the revealed rule once data-revealed="true" is
    // set by Reveal's IntersectionObserver.
    await expect(page.getByTestId("reveal-target")).toHaveCSS(
      "opacity",
      "1",
    );
  });
});
