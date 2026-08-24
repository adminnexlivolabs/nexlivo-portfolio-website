import { test, expect } from "@playwright/test";

test.describe("UI primitives", () => {
  test.beforeEach(async ({ page }) => await page.goto("/primitives-harness"));

  test("filled button has ink background and canvas text", async ({ page }) => {
    const btn = page.getByTestId("btn-filled");
    await expect(btn).toHaveCSS("background-color", "rgb(1, 4, 23)");
    await expect(btn).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("buttons are pill-shaped and meet the 44px touch target", async ({ page }) => {
    const btn = page.getByTestId("btn-filled");
    await expect(btn).toHaveCSS("border-radius", "100px");
    const box = await btn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("ghost button is transparent with a 1px ink border", async ({ page }) => {
    const btn = page.getByTestId("btn-ghost");
    await expect(btn).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(btn).toHaveCSS("border-color", "rgb(1, 4, 23)");
    await expect(btn).toHaveCSS("border-top-width", "1px");
  });

  test("cards use 8px radius and cast no shadow", async ({ page }) => {
    const card = page.getByTestId("card-light");
    await expect(card).toHaveCSS("border-radius", "8px");
    await expect(card).toHaveCSS("box-shadow", "none");
  });

  test("section content is capped at 1200px", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const inner = page.getByTestId("section-inner");
    const box = await inner.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(1200);
  });
});
