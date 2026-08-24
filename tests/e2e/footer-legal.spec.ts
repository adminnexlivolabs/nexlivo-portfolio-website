import { test, expect } from "@playwright/test";

test.describe("footer and legal pages", () => {
  test("footer renders three link columns plus the brand block", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    const footer = page.locator("footer");
    await expect(footer.getByRole("heading", { name: "Services" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Company" })).toBeVisible();
    await expect(footer.getByRole("heading", { name: "Legal" })).toBeVisible();
  });

  test("terms page is reachable from the footer and has content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await page.locator("footer").getByRole("link", { name: "Terms & Conditions" }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Terms & Conditions");
    expect((await page.locator("article section").count())).toBeGreaterThan(3);
  });

  test("privacy page renders with real prose", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy Policy");
    const text = await page.locator("article").innerText();
    expect(text.length).toBeGreaterThan(500);
    expect(text).not.toContain("TODO");
    expect(text).not.toContain("Lorem ipsum");
  });

  test("legal pages keep line length readable", async ({ page }) => {
    await page.goto("/terms");
    const box = await page.locator("article").boundingBox();
    expect(box!.width).toBeLessThanOrEqual(720);
  });
});
