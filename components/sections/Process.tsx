import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Process() {
  return (
    <Section id="process">
      <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
        {content.process.heading}
      </h2>
      <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {content.process.steps.map((step, i) => (
          <li key={step.number}>
            <Reveal delay={i * 60}>
              <span className="font-display text-heading-sm font-normal text-ink">
                {step.number}
              </span>
              <span className="mt-2 block h-px w-8 bg-cyan" aria-hidden="true" />
              <h3 className="mt-4 font-display text-subheading font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-body-sm text-fog">{step.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
