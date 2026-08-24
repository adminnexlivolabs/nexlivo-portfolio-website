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

  test("absorbs a honeypot submission even when the rest of the payload is invalid", async ({ request }) => {
    // This is the case that actually proves ORDERING: an otherwise-valid
    // honeypot payload (the previous test) would still return 200 even if the
    // honeypot check were moved to run after a successful safeParse but
    // before the mailer call. Pairing the honeypot with a field that fails
    // Zod validation (a malformed email) is the only way to prove the
    // honeypot check genuinely short-circuits BEFORE contactSchema.safeParse
    // runs — if it ran after, this would come back as a 400 with fieldErrors
    // instead of a plain 200.
    const res = await request.post("/api/contact", {
      data: { ...valid, email: "not-an-email", website: "spam.example" },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  test("returns 503 with a usable message when no mailer is configured", async ({ request }) => {
    // NOTE: this is an integration-level sanity check, not a deterministic
    // unit test — it passes only because this dev/CI environment happens not
    // to export RESEND_API_KEY for the already-running `next dev` process
    // that Playwright's webServer starts. A real, environment-independent
    // check of isMailerConfigured()'s branches lives in
    // tests/unit/mailer.test.ts, which sets/clears process.env directly.
    const res = await request.post("/api/contact", { data: valid });
    // With no RESEND_API_KEY in the dev environment this must be 503.
    expect(res.status()).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain("email us directly");
  });
});
