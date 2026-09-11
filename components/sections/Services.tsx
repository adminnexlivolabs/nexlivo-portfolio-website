import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import { WebIcon, MobileIcon, DesignIcon, CloudIcon } from "@/components/ui/Icons";

const icons = [WebIcon, MobileIcon, DesignIcon, CloudIcon];

export function Services() {
  return (
    <Section id="services" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 text-ink opacity-[0.04]"
      >
        <CircuitPattern className="h-full w-full" />
      </div>
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {content.services.heading}
      </h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.services.items.map((item, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={item.title} delay={i * 60}>
              <Card variant="light" className="h-full">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-ash text-ink">
                  <Icon />
                </span>
                <h3 className="mt-4 font-display text-subheading font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-body-sm text-fog">{item.body}</p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
