import { test, expect } from "@playwright/test";

test.describe("announcement bar and nav", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape"); // skip intro
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("announcement bar is cyan with INK text, never white", async ({ page }) => {
    const bar = page.getByTestId("announcement");
    await expect(bar).toHaveCSS("background-color", "rgb(0, 196, 204)");
    const color = await bar
      .locator("p")
      .evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(1, 4, 23)");
    expect(color).not.toBe("rgb(255, 255, 255)");
  });

  test("nav is sticky and shows all four links on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const header = page.locator("header");
    await expect(header).toHaveCSS("position", "sticky");
    for (const label of ["Services", "Process", "Capabilities", "FAQ"]) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("nav collapses to a drawer below 768px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const toggle = page.getByTestId("nav-toggle");
    await expect(toggle).toBeVisible();
    await expect(page.getByTestId("mobile-nav")).toHaveCount(0);
    await toggle.click();
    await expect(page.getByTestId("mobile-nav")).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  test("drawer closes on Escape and returns focus to the toggle", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.getByTestId("nav-toggle").click();
    await expect(page.getByTestId("mobile-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mobile-nav")).toHaveCount(0);
    await expect(page.getByTestId("nav-toggle")).toBeFocused();
  });

  test("the menu toggle meets the 44px touch target", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const box = await page.getByTestId("nav-toggle").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
