import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import { FrontendIcon, BackendIcon, CloudOpsIcon } from "@/components/ui/Icons";

const icons = [FrontendIcon, BackendIcon, CloudOpsIcon];

export function Capabilities() {
  return (
    <Section id="capabilities" className="on-dark bg-carbon relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 text-cyan opacity-[0.12]"
      >
        <CircuitPattern className="h-full w-full" />
      </div>
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-canvas">
        {content.capabilities.heading}
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {content.capabilities.groups.map((g, i) => {
          const Icon = icons[i];
          return (
            <Reveal key={g.title} delay={i * 60}>
              <Card variant="dark" className="h-full">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-canvas/15 text-cyan">
                  <Icon />
                </span>
                <h3 className="mt-4 font-display text-subheading font-medium text-canvas">
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
          );
        })}
      </div>
    </Section>
  );
}
