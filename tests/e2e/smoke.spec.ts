import { test, expect } from "@playwright/test";

test("page renders with the token system applied", async ({ page }) => {
  await page.goto("/");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("Nexlivo Labs");

  // Body must use the ink token, not a default black.
  const bodyColor = await page.evaluate(
    () => getComputedStyle(document.body).color,
  );
  expect(bodyColor).toBe("rgb(1, 4, 23)");

  // Display headings must resolve to Montserrat, not a fallback.
  const h1Font = await h1.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1Font).toContain("Montserrat");

  // Display headings must be weight 400 — never bold.
  const h1Weight = await h1.evaluate((el) => getComputedStyle(el).fontWeight);
  expect(h1Weight).toBe("400");
});
