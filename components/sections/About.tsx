import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";

export function About() {
  const { founder } = content.about;
  return (
    <Section id="about">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
          {content.about.heading}
        </h2>
        <div>
          <p className="max-w-[60ch] text-subheading text-ink">
            {content.about.body}
          </p>
          <div className="mt-10 border-t border-ash pt-6">
            <p className="text-body-sm font-medium text-ink">
              {founder.name}
              <span className="text-fog"> · {founder.role}</span>
            </p>
            <p className="mt-2 max-w-[60ch] text-body-sm text-fog">
              {founder.bio}
            </p>
            <ul className="mt-4 flex flex-wrap gap-4">
              {founder.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm text-ink underline decoration-ash underline-offset-4 transition-colors duration-150 hover:decoration-ink"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
