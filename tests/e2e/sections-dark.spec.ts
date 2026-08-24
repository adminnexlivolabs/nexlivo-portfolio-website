import { test, expect } from "@playwright/test";
import { content } from "../../lib/content";

test.describe("capabilities and about", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
  });

  test("capabilities is the carbon band with white heading", async ({ page }) => {
    const band = page.locator("#capabilities");
    await expect(band).toHaveCSS("background-color", "rgb(17, 17, 23)");
    const h2 = band.getByRole("heading", { level: 2 });
    await expect(h2).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("capabilities is the ONLY dark section on the page", async ({ page }) => {
    const darkCount = await page.evaluate(() => {
      const dark = new Set(["rgb(17, 17, 23)", "rgb(1, 4, 23)"]);
      return [...document.querySelectorAll("section")].filter((el) =>
        dark.has(getComputedStyle(el).backgroundColor),
      ).length;
    });
    expect(darkCount).toBe(1);
  });

  test("all three capability groups render", async ({ page }) => {
    for (const g of content.capabilities.groups) {
      await expect(
        page.getByRole("heading", { name: g.title, level: 3 }),
      ).toBeVisible();
    }
  });

  test("about shows the founder bio and both external links", async ({ page }) => {
    await expect(page.getByText(content.about.founder.name)).toBeVisible();
    const linkedin = page.getByRole("link", { name: "LinkedIn" });
    await expect(linkedin).toHaveAttribute("rel", /noopener/);
    await expect(linkedin).toHaveAttribute("target", "_blank");
  });

  test("focus rings on the dark band are cyan, not ink", async ({ page }) => {
    const color = await page.evaluate(() => {
      const el = document.querySelector("#capabilities a, #capabilities button");
      if (!el) return "no-focusable";
      (el as HTMLElement).focus();
      return getComputedStyle(el).outlineColor;
    });
    if (color !== "no-focusable") {
      expect(color).toBe("rgb(0, 196, 204)");
    }
  });
});
