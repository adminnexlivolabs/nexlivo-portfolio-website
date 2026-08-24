import { describe, it, expect } from "vitest";
import { contactSchema, PROJECT_TYPES } from "@/lib/contact-schema";

describe("contactSchema", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    company: "Analytical Engines",
    projectType: "Web Application",
    message: "We need a dashboard for our operations team.",
    website: "",
  };

  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a submission with no company", () => {
    const r = contactSchema.safeParse({ ...valid, company: "" });
    expect(r.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const r = contactSchema.safeParse({ ...valid, name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const r = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects a message under 10 characters", () => {
    const r = contactSchema.safeParse({ ...valid, message: "hi" });
    expect(r.success).toBe(false);
  });

  it("rejects a project type outside the allowed list", () => {
    const r = contactSchema.safeParse({ ...valid, projectType: "Blockchain" });
    expect(r.success).toBe(false);
  });

  it("strips the honeypot field rather than rejecting it", () => {
    // The honeypot is handled by the route, not the schema — see Task 9.
    const r = contactSchema.safeParse({ ...valid, website: "spam.example" });
    expect(r.success).toBe(true);
    expect(r.success && "website" in r.data).toBe(false);
  });

  it("exposes exactly five project types", () => {
    expect(PROJECT_TYPES).toHaveLength(5);
    expect(PROJECT_TYPES).toContain("Web Application");
  });
});
