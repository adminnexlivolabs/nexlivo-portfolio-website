import type { Metadata } from "next";
import { privacy } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy — Nexlivo Labs" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-[720px] px-4 py-16 md:px-6">
      <h1 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {privacy.title}
      </h1>
      <p className="mt-3 text-body-sm text-fog">Last updated {privacy.updated}</p>
      {privacy.sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="font-display text-subheading font-medium text-ink">{s.heading}</h2>
          <p className="mt-3 whitespace-pre-line text-body text-fog">{s.body}</p>
        </section>
      ))}
    </article>
  );
}
