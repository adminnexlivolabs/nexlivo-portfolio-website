import { describe, it, expect } from "vitest";
import { content } from "@/lib/content";

describe("content", () => {
  it("has exactly four services", () => {
    expect(content.services.items).toHaveLength(4);
  });

  it("has exactly four process steps, numbered 01 to 04", () => {
    expect(content.process.steps.map((s) => s.number)).toEqual([
      "01", "02", "03", "04",
    ]);
  });

  it("has exactly seven FAQ items, each a question", () => {
    expect(content.faq.items).toHaveLength(7);
    for (const item of content.faq.items) {
      expect(item.q.endsWith("?")).toBe(true);
    }
  });

  it("exposes the correct contact details", () => {
    expect(content.contact.email).toBe("admin.nexlivolabs@gmail.com");
    expect(content.contact.phone).toBe("+91 9704069431");
    expect(content.contact.phoneHref).toBe("tel:+919704069431");
  });

  it("contains no emoji in any copy (icons must be SVG)", () => {
    const json = JSON.stringify(content);
    // Covers pictographs, symbols, transport, and dingbats.
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    expect(emoji.test(json)).toBe(false);
  });
});
