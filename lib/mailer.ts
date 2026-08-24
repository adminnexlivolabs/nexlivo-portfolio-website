import type { ContactInput } from "./contact-schema";

export function isMailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

export async function sendEnquiry(input: ContactInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    throw new Error("Mailer is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `New enquiry — ${input.projectType} — ${input.name}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Company: ${input.company || "—"}`,
        `Project type: ${input.projectType}`,
        "",
        input.message,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    throw new Error(`Mail provider returned ${res.status}`);
  }
}
