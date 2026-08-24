import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";

export function Faq() {
  return (
    <Section id="faq">
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {content.faq.heading}
      </h2>
      <div className="mt-10 border-t border-ash">
        {content.faq.items.map((item) => (
          <details key={item.q} className="group border-b border-ash">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 py-5 text-subheading text-ink marker:content-none">
              <span>{item.q}</span>
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0 transition-transform duration-150 group-open:rotate-180"
              >
                <path d="M3 6l5 5 5-5" />
              </svg>
            </summary>
            <p className="max-w-[70ch] pb-6 text-body text-fog">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
