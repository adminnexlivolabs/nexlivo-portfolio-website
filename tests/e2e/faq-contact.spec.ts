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

  test("a failed submission is announced and moves focus to the first bad field", async ({
    page,
  }) => {
    await page.getByLabel("Email").fill("nope");
    await page.getByLabel("What are you building?").fill("short");
    await page.getByRole("button", { name: "Send enquiry" }).click();

    // The role="status" region must actually say something - inline field
    // errors alone are invisible to a screen-reader user whose focus is on
    // the submit button.
    const live = page.getByTestId("form-error");
    await expect(live).toBeVisible();
    await expect(live).toContainText(content.contact.validationSummary);

    // ...and focus lands on the first field in DOM order that has an error
    // (name is empty, so it wins over email and message).
    await expect(page.locator("#name")).toBeFocused();
  });

  test("a valid submission with no mailer configured shows the email fallback", async ({
    page,
  }) => {
    // Spec 10.6: the 503 "mailer not configured" path must surface the
    // fallback-to-email message to the *user*, not just in the API response.
    // This drives the real rendered form through a real submit; the dev
    // environment deliberately has no RESEND_API_KEY (see .env.example), so
    // /api/contact answers 503 and nothing is actually mailed. The message
    // below identifies the submission in the unlikely event a mailer IS
    // configured locally - in which case this test fails loudly rather than
    // silently passing.
    await page.getByLabel("Name").fill("E2E Test");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByLabel("What are you building?").fill(
      "Automated end-to-end test submission — please ignore.",
    );
    await page.getByRole("button", { name: "Send enquiry" }).click();

    const live = page.getByTestId("form-error");
    await expect(live).toBeVisible();
    // The API's own 503 copy, so this cannot be satisfied by the
    // client-side validation branch.
    await expect(live).toContainText("Our enquiry form is not connected yet");
    // And the fallback address the user is meant to reach for instead.
    await expect(live).toContainText(content.contact.email);
    await expect(page.getByTestId("form-success")).toHaveCount(0);
  });

  test("contact details are real tel: and mailto: links", async ({ page }) => {
    const contact = page.locator("#contact");
    await expect(
      contact.getByRole("link", { name: content.contact.email }),
    ).toHaveAttribute("href", `mailto:${content.contact.email}`);
    await expect(
      contact.getByRole("link", { name: content.contact.phone }),
    ).toHaveAttribute("href", "tel:+919704069431");
  });

  test("form inputs meet the 44px touch target", async ({ page }) => {
    const box = await page.locator("#name").boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
