import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <Section className="pt-16 md:pt-24 lg:pt-28">
      <h1 className="max-w-[16ch] font-display text-[clamp(2.375rem,7vw,4.75rem)] font-normal leading-[1.03] tracking-[-0.03em] text-ink">
        {content.hero.headline}
      </h1>
      <p className="mt-6 max-w-[60ch] text-subheading text-fog">
        {content.hero.subtext}
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href={content.hero.primaryCta.href} variant="filled">
          {content.hero.primaryCta.label}
        </Button>
        <Button href={content.hero.secondaryCta.href} variant="ghost">
          {content.hero.secondaryCta.label}
        </Button>
      </div>
    </Section>
  );
}
