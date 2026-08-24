import { test, expect } from "@playwright/test";

test.describe("performance", () => {
  test("cumulative layout shift stays under 0.1", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{
          value: number;
          hadRecentInput: boolean;
        }>) {
          if (!entry.hadRecentInput) {
            (window as unknown as { __cls: number }).__cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("intro")).toBeHidden({ timeout: 3000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const cls = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(cls).toBeLessThan(0.1);
  });

  test("makes no third-party network requests", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
        external.push(req.url());
      }
    });
    await page.goto("/");
    await page.keyboard.press("Escape");
    await page.waitForLoadState("networkidle");
    // Fonts are self-hosted by next/font; nothing should leave the origin.
    expect(external).toEqual([]);
  });

  test("every image declares intrinsic dimensions", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Escape");
    const undeclared = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => !img.getAttribute("width") || !img.getAttribute("height"))
        .map((img) => img.src),
    );
    expect(undeclared).toEqual([]);
  });
});
