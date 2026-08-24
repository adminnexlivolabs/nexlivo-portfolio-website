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

    // Every text-bearing element in the bar - the copy, the inline pill
    // link, and the dismiss button - must use ink, never white. White on
    // cyan measures 2.15:1 (fails AA); ink on cyan measures 9.47:1.
    const elements = [
      bar.locator("p"),
      bar.getByRole("link", { name: /get in touch/i }),
      bar.getByRole("button", { name: "Dismiss announcement" }),
    ];
    for (const el of elements) {
      const color = await el.evaluate((node) => getComputedStyle(node).color);
      expect(color).toBe("rgb(1, 4, 23)");
      expect(color).not.toBe("rgb(255, 255, 255)");
    }
  });

  test("the announcement dismiss button is reachable on mobile and meets the touch target", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const dismiss = page.getByRole("button", { name: "Dismiss announcement" });
    await expect(dismiss).toBeVisible();
    const box = await dismiss.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("a dismissed announcement stays hidden on reload, with no flash of content", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Dismiss announcement" }).click();
    await expect(page.getByTestId("announcement")).toHaveCount(0);

    // Reload: sessionStorage (intro-seen) survives a reload, so the intro
    // does not replay, but this is the real regression case for the fix -
    // a returning visitor whose dismissal is in localStorage must never
    // see the bar rendered visible even for a frame before JS hides it.
    // The inline <head> script sets data-announcement-dismissed on <html>
    // before first paint, and CSS (not a post-mount setState) hides
    // .announcement-bar on that attribute, so it should never be visible.
    await page.reload();
    await expect(page.getByTestId("announcement")).toBeHidden();
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

  test("drawer closing via a nav link also returns focus to the toggle", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.getByTestId("nav-toggle").click();
    const panel = page.getByTestId("mobile-nav");
    await expect(panel).toBeVisible();
    await panel.getByRole("link", { name: "Services" }).click();
    await expect(panel).toHaveCount(0);
    await expect(page.getByTestId("nav-toggle")).toBeFocused();
  });

  test("the menu toggle meets the 44px touch target", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const box = await page.getByTestId("nav-toggle").boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
