import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

export function Services() {
  return (
    <Section id="services">
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {content.services.heading}
      </h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.services.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 60}>
            <Card variant="light" className="h-full">
              <h3 className="font-display text-subheading font-medium text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-body-sm text-fog">{item.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
