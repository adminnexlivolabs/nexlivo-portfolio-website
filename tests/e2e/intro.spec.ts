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
