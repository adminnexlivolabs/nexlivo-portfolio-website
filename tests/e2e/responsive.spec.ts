import { test, expect } from "@playwright/test";

const WIDTHS = [320, 375, 768, 1024, 1440];

test.describe("responsive", () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("content is capped at 1200px on a wide viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.keyboard.press("Escape");
    const width = await page
      .locator("#services > div")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(1200);
  });

  test("the display headline scales down on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.keyboard.press("Escape");
    const desktop = await page
      .locator("h1")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    await page.setViewportSize({ width: 375, height: 800 });
    const mobile = await page
      .locator("h1")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    expect(mobile).toBeLessThan(desktop);
    expect(mobile).toBeGreaterThanOrEqual(30);
  });
});
