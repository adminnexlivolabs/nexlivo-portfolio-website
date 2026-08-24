import { test, expect } from "@playwright/test";
import { content } from "../../lib/content";

test.describe("faq and contact", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("renders seven FAQ items, collapsed by default", async ({ page }) => {
    const items = page.locator("#faq details");
    await expect(items).toHaveCount(7);
    await expect(items.first()).not.toHaveAttribute("open", "");
  });

  test("FAQ opens on keyboard activation", async ({ page }) => {
    const first = page.locator("#faq details").first();
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
  });

  test("every form control has a visible label", async ({ page }) => {
    for (const id of ["name", "email", "company", "projectType", "message"]) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toHaveCount(1);
      await expect(label).toBeVisible();
    }
  });

  test("invalid submission shows inline errors wired to their fields", async ({ page }) => {
    await page.getByLabel("Name").fill("");
    await page.getByLabel("Email").fill("nope");
    await page.getByRole("button", { name: "Send enquiry" }).click();

    const email = page.locator("#email");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAttribute("aria-describedby", "email-error");
    await expect(page.locator("#email-error")).toBeVisible();
  });

  test("contact details are real tel: and mailto: links", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: content.contact.email }),
    ).toHaveAttribute("href", `mailto:${content.contact.email}`);
    await expect(
      page.getByRole("link", { name: content.contact.phone }),
    ).toHaveAttribute("href", "tel:+919704069431");
  });

  test("form inputs meet the 44px touch target", async ({ page }) => {
    const box = await page.locator("#name").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
