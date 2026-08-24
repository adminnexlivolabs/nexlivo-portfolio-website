"use client";

import { useState } from "react";
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { contactSchema, PROJECT_TYPES } from "@/lib/contact-schema";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "mt-2 w-full min-h-[44px] rounded-card border border-ash bg-canvas px-4 py-3 " +
  "text-body text-ink placeholder:text-fog/60 transition-colors duration-150 " +
  "focus:border-cyan focus:outline-none focus:ring-[3px] focus:ring-cyan/10";
const label = "block text-caption font-medium text-ink";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    // Raw form data, including the honeypot `website` field. This is what
    // gets POSTed — the API route (Task 9) reads the raw body to check the
    // honeypot before validating. `contactSchema.safeParse` below is only
    // used to decide whether to show inline field errors and to block
    // submission on invalid input; its *parsed* result (which Zod strips
    // unknown keys, including `website`, from) is never sent anywhere.
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = contactSchema.safeParse(data);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
        setFormError(json.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setFormError("Could not reach the server.");
    }
  }

  return (
    <Section id="contact">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="max-w-[16ch] font-display text-heading font-normal tracking-[-0.03em] text-ink">
            {content.contact.heading}
          </h2>
          <p className="mt-4 text-subheading text-fog">
            {content.contact.subtext}
          </p>

          <form onSubmit={onSubmit} noValidate className="relative mt-10" data-testid="contact-form">
            {/* Honeypot — visually hidden, never announced. */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="name">Name</label>
                <input
                  id="name" name="name" type="text" required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={field}
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-caption text-danger">{errors.name}</p>
                )}
              </div>

              <div>
                <label className={label} htmlFor="email">Email</label>
                <input
                  id="email" name="email" type="email" required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={field}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-caption text-danger">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={label} htmlFor="company">Company <span className="text-fog">(optional)</span></label>
                <input id="company" name="company" type="text" className={field} />
              </div>

              <div>
                <label className={label} htmlFor="projectType">Project type</label>
                <select id="projectType" name="projectType" defaultValue={PROJECT_TYPES[0]} className={field}>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className={label} htmlFor="message">What are you building?</label>
              <textarea
                id="message" name="message" rows={5} required
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={field}
              />
              {errors.message && (
                <p id="message-error" className="mt-2 text-caption text-danger">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-pill bg-ink px-6 text-body-sm font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send enquiry"}
            </button>

            <div role="status" aria-live="polite" className="mt-4">
              {status === "sent" && (
                <p className="text-body-sm text-ink" data-testid="form-success">
                  Thank you — we will reply within one business day.
                </p>
              )}
              {formError && (
                <p className="text-body-sm text-danger" data-testid="form-error">
                  {formError} You can also email us directly at {content.contact.email}.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="lg:pt-4">
          <dl className="space-y-6">
            <div>
              <dt className="text-caption text-fog">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${content.contact.email}`} className="text-body text-ink underline decoration-ash underline-offset-4 hover:decoration-ink">
                  {content.contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-fog">Phone</dt>
              <dd className="mt-1">
                <a href={content.contact.phoneHref} className="text-body text-ink underline decoration-ash underline-offset-4 hover:decoration-ink">
                  {content.contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-caption text-fog">Based in</dt>
              <dd className="mt-1 text-body text-ink">{content.contact.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Section>
  );
}
