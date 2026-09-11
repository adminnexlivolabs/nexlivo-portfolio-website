import Image from "next/image";
import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

export function Work() {
  return (
    <Section id="work">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <h2 className="font-display text-heading font-normal tracking-[-0.03em] text-ink">
          {content.work.heading}
        </h2>
        <div className="flex flex-col gap-4">
          {content.work.items.map((item, i) => (
            <Reveal key={item.name} delay={i * 60}>
              <Card variant="light" className="flex items-start gap-4">
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  width={56}
                  height={56}
                  className="h-14 w-14 shrink-0 rounded-card border border-ash object-cover"
                />
                <div>
                  <h3 className="font-display text-subheading font-medium text-ink">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-caption text-fog">{item.category}</p>
                  <p className="mt-3 max-w-[48ch] text-body-sm text-fog">{item.body}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
