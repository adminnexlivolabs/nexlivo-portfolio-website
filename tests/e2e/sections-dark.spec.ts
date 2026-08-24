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
    // The surface-dependent focus ring is a non-negotiable of the spec, and
    // globals.css implements it as a DESCENDANT rule:
    //
    //     :focus-visible          { outline: 2px solid var(--color-ink); }
    //     .on-dark :focus-visible { outline-color: var(--color-cyan); }
    //
    // Capabilities is the only dark surface and it currently contains no
    // focusable element, so a query for one there returns null. Rather than
    // adding a decorative link to the real section just to give the test
    // something to click, this injects a throwaway probe anchor into the real
    // `.on-dark` section and a matching control into a light one, focuses
    // each, and compares the computed ring. That exercises the actual CSS
    // contract - including the `.on-dark` class really being on the section -
    // and cannot silently no-op the way the old query could.
    await expect(page.locator("#capabilities")).toHaveClass(/\bon-dark\b/);

    const result = await page.evaluate(() => {
      const probe = (hostSelector: string) => {
        const host = document.querySelector(hostSelector);
        if (!host) throw new Error(`missing host ${hostSelector}`);
        const a = document.createElement("a");
        a.href = "#";
        a.dataset.focusProbe = "1";
        a.textContent = "focus probe";
        host.appendChild(a);
        a.focus();
        const cs = getComputedStyle(a);
        const read = {
          // Asserted below: if the browser did not treat this as a
          // focus-visible match, the outline values would be meaningless
          // defaults and the test must fail rather than pass vacuously.
          focusVisible: a.matches(":focus-visible"),
          insideOnDark: Boolean(a.closest(".on-dark")),
          outlineColor: cs.outlineColor,
          outlineStyle: cs.outlineStyle,
          outlineWidth: cs.outlineWidth,
        };
        a.blur();
        a.remove();
        return read;
      };
      // #capabilities carries .on-dark; #services is a plain light section.
      return { dark: probe("#capabilities"), light: probe("#services") };
    });

    expect(result.dark.focusVisible).toBe(true);
    expect(result.light.focusVisible).toBe(true);
    expect(result.dark.insideOnDark).toBe(true);
    expect(result.light.insideOnDark).toBe(false);

    // Dark surface -> cyan ring. Light surface -> ink ring. Same width and
    // style on both, so only the colour is surface-dependent.
    expect(result.dark.outlineColor).toBe("rgb(0, 196, 204)");
    expect(result.light.outlineColor).toBe("rgb(1, 4, 23)");
    for (const r of [result.dark, result.light]) {
      expect(r.outlineStyle).toBe("solid");
      expect(r.outlineWidth).toBe("2px");
    }

    // The probes must not outlive the assertion.
    await expect(page.locator("[data-focus-probe]")).toHaveCount(0);
  });
});
