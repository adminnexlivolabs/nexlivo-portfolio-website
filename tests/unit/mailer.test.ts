import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isMailerConfigured } from "@/lib/mailer";

describe("isMailerConfigured", () => {
  // Snapshot and restore process.env around each test so mutations here never
  // leak into other test files or between tests in this file.
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("is false when neither RESEND_API_KEY nor CONTACT_TO_EMAIL is set", () => {
    expect(isMailerConfigured()).toBe(false);
  });

  it("is false when only RESEND_API_KEY is set", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    expect(isMailerConfigured()).toBe(false);
  });

  it("is false when only CONTACT_TO_EMAIL is set", () => {
    process.env.CONTACT_TO_EMAIL = "admin.nexlivolabs@gmail.com";
    expect(isMailerConfigured()).toBe(false);
  });

  it("is true when both RESEND_API_KEY and CONTACT_TO_EMAIL are set", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "admin.nexlivolabs@gmail.com";
    expect(isMailerConfigured()).toBe(true);
  });

  it("is false when RESEND_API_KEY is set but empty", () => {
    process.env.RESEND_API_KEY = "";
    process.env.CONTACT_TO_EMAIL = "admin.nexlivolabs@gmail.com";
    expect(isMailerConfigured()).toBe(false);
  });
});
