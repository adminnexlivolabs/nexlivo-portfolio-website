import { test, expect } from "@playwright/test";
import { content } from "../../lib/content";

test.describe("light sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("there is exactly one h1, carrying the hero headline", async ({ page }) => {
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
    await expect(h1s.first()).toHaveText(content.hero.headline);
  });

  test("the hero headline is weight 400, never bold", async ({ page }) => {
    const weight = await page
      .locator("h1")
      .evaluate((el) => getComputedStyle(el).fontWeight);
    expect(weight).toBe("400");
  });

  test("all four services render with their titles", async ({ page }) => {
    for (const s of content.services.items) {
      await expect(
        page.getByRole("heading", { name: s.title, level: 3 }),
      ).toBeVisible();
    }
  });

  test("process renders four ordered steps ending in Ship & Run", async ({ page }) => {
    const items = page.locator("#process ol > li");
    await expect(items).toHaveCount(4);
    await expect(items.last()).toContainText("Ship & Run");
  });

  test("anchor links resolve to real section targets", async ({ page }) => {
    for (const id of ["services", "process"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("no element on the page casts a shadow", async ({ page }) => {
    const shadowed = await page.evaluate(() =>
      [...document.querySelectorAll("*")].filter(
        (el) => getComputedStyle(el).boxShadow !== "none",
      ).length,
    );
    expect(shadowed).toBe(0);
  });
});
