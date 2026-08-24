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

    // Tripwire against silent corruption: a section count and a "not
    // Lorem ipsum" check would both pass even if the extraction script
    // paraphrased or garbled the actual legal text. Assert a distinctive,
    // verbatim phrase from the Governing Law and Disputes section (source:
    // ~/Downloads/Nexlivo_Legal_Pack.md, "## 1.20 Governing Law and
    // Disputes") so a future wording drift fails this test, not just a
    // human proofread.
    const termsText = await page.locator("article").innerText();
    expect(termsText).toContain(
      "the MSA below uses a **lawyer-review placeholder** rather than making a final arbitration election.",
    );
  });

  test("privacy page renders with real prose", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy Policy");
    const text = await page.locator("article").innerText();
    expect(text.length).toBeGreaterThan(500);
    expect(text).not.toContain("TODO");
    expect(text).not.toContain("Lorem ipsum");

    // Same tripwire as the terms test above, for the Privacy Policy: a
    // distinctive verbatim phrase from the Data Retention section (source:
    // "## 2.9 Data Retention") that a paraphrase or corrupted extraction
    // would not reproduce exactly.
    expect(text).toContain(
      "Client application data is subject to the applicable client contract, DPA, instructions, backup practices, and legal requirements.",
    );
  });

  test("legal pages keep line length readable", async ({ page }) => {
    await page.goto("/terms");
    const box = await page.locator("article").boundingBox();
    expect(box!.width).toBeLessThanOrEqual(720);
  });
});
