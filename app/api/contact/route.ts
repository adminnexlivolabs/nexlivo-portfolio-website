import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";
import { isMailerConfigured, sendEnquiry } from "@/lib/mailer";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Honeypot: checked BEFORE validation and answered with a plain 200, so a bot
  // cannot tell it was caught. `website` is intentionally absent from the schema.
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).website === "string" &&
    (body as Record<string, string>).website.length > 0
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  if (!isMailerConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Our enquiry form is not connected yet. Please email us directly.",
      },
      { status: 503 },
    );
  }

  try {
    await sendEnquiry(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not send your message. Please email us directly." },
      { status: 502 },
    );
  }
}
