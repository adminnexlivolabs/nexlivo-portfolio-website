import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

export function Capabilities() {
  return (
    <Section id="capabilities" className="on-dark bg-carbon">
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-canvas">
        {content.capabilities.heading}
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {content.capabilities.groups.map((g, i) => (
          <Reveal key={g.title} delay={i * 60}>
            <Card variant="dark" className="h-full">
              <h3 className="font-display text-subheading font-medium text-canvas">
                {g.title}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-pill border border-canvas/15 px-3 py-1 text-caption text-canvas/80"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
