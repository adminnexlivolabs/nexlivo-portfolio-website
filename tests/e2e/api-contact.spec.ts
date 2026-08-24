import { test, expect } from "@playwright/test";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  projectType: "Web Application",
  message: "We need an operations dashboard for our team.",
  website: "",
};

test.describe("POST /api/contact", () => {
  test("rejects an invalid payload with field errors", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...valid, email: "nope", message: "hi" },
    });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.fieldErrors.email).toBeTruthy();
    expect(json.fieldErrors.message).toBeTruthy();
  });

  test("rejects a malformed body", async ({ request }) => {
    const res = await request.post("/api/contact", {
      headers: { "Content-Type": "application/json" },
      data: "not json at all",
    });
    expect([400, 500]).toContain(res.status());
  });

  test("absorbs honeypot submissions with a silent 200", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...valid, website: "spam.example" },
    });
    // Must be indistinguishable from success so bots learn nothing — and must
    // NOT be the 503 a genuine unconfigured submission would return.
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  test("returns 503 with a usable message when no mailer is configured", async ({ request }) => {
    const res = await request.post("/api/contact", { data: valid });
    // With no RESEND_API_KEY in the dev environment this must be 503.
    expect(res.status()).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("email us directly");
  });
});
