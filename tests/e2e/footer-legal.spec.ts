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
    // human proofread. The words are the source's; the `**` emphasis
    // markers around "lawyer-review placeholder" are stripped by
    // scripts/extract-legal.py because they are Markdown punctuation and
    // the page renders section bodies as plain text.
    const termsText = await page.locator("article").innerText();
    expect(termsText).toContain(
      "the MSA below uses a lawyer-review placeholder rather than making a final arbitration election.",
    );
  });

  test("legal pages render no raw markdown syntax", async ({ page }) => {
    // The pages render section bodies with `whitespace-pre-line`, i.e. as
    // plain text, so any Markdown punctuation surviving extraction shows up
    // literally to the reader. scripts/extract-legal.py strips emphasis
    // markers, code-span backticks, and ATX sub-heading markers; this asserts
    // the result end to end.
    for (const path of ["/terms", "/privacy"]) {
      await page.goto(path);
      const text = await page.locator("article").innerText();
      expect(text, `${path} must not render ** emphasis markers`).not.toContain("**");
      expect(text, `${path} must not render code-span backticks`).not.toContain("`");
      // No "#" at all: the source uses none as prose in either document, so
      // any hash on the page is a leaked "###" sub-heading marker.
      expect(text, `${path} must not render heading markers`).not.toContain("#");
    }

    // And the words inside those markers must survive intact - stripping the
    // punctuation must not have eaten the content it wrapped.
    await page.goto("/terms");
    expect(await page.locator("article").innerText()).toContain(
      "Legal enquiries: [LEGAL EMAIL]",
    );

    // A de-marked "### " sub-heading must still stand on its own line rather
    // than running into the prose around it - `whitespace-pre-line` preserves
    // the source's line breaks, and dropping the marker must not collapse them.
    await page.goto("/privacy");
    const privacyLines = (await page.locator("article").innerText())
      .split("\n")
      .map((l) => l.trim());
    for (const subheading of [
      "Information you provide",
      "Automatically collected information",
    ]) {
      expect(privacyLines, `"${subheading}" must be its own line`).toContain(subheading);
    }
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

  test("a legal page is not a navigation dead end - the logo returns home", async ({
    page,
  }) => {
    await page.goto("/terms");
    await page.keyboard.press("Escape"); // the intro plays on any first-visit route
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });

    // The header, footer, and announcement bar all render on /terms because
    // they are mounted in app/layout.tsx. Before this fix every one of their
    // section links was an unrooted fragment ("#services", "#top"), which
    // from /terms only rewrote the fragment and left the visitor stranded.
    const home = page.locator("header").getByRole("link", { name: "Nexlivo Labs home" });
    await expect(home).toHaveAttribute("href", "/");
    await home.click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#services")).toBeAttached();
  });

  test("chrome section links are rooted so they work from a legal page", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });

    // Every in-page section link rendered by the always-mounted chrome must
    // carry a leading "/" - a bare "#faq" here would resolve to
    // "/privacy#faq", which points at nothing.
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll("header a[href], footer a[href], [data-testid='announcement'] a[href]")]
        .map((a) => a.getAttribute("href")!)
        .filter((h) => h.includes("#")),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, `"${href}" must be rooted, not document-relative`).toMatch(/^\/#/);
    }

    // And one of them actually navigates back to the homepage section.
    await page.locator("footer").getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/localhost:\d+\/#faq$/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#faq")).toBeVisible();
  });

  test("legal pages keep line length readable", async ({ page }) => {
    await page.goto("/terms");
    const box = await page.locator("article").boundingBox();
    expect(box!.width).toBeLessThanOrEqual(720);
  });
});
