import { content } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ShaderBackground } from "@/components/ui/ShaderBackground";

export function Hero() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
        <ShaderBackground className="h-full w-full" />
      </div>
      <Section className="relative z-10 pt-16 md:pt-24 lg:pt-28">
        <h1 className="max-w-[16ch] font-display text-[clamp(2.375rem,7vw,4.75rem)] font-normal leading-[1.03] tracking-[-0.03em] text-white drop-shadow-[0_2px_16px_rgba(1,4,23,0.6)]">
          {content.hero.headline}
        </h1>
        <p className="mt-6 max-w-[60ch] text-subheading text-white/80 drop-shadow-[0_1px_10px_rgba(1,4,23,0.6)]">
          {content.hero.subtext}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={content.hero.primaryCta.href} variant="filled">
            {content.hero.primaryCta.label}
          </Button>
          <Button
            href={content.hero.secondaryCta.href}
            variant="ghost"
            className="border-white text-white hover:bg-white hover:text-ink"
          >
            {content.hero.secondaryCta.label}
          </Button>
        </div>
      </Section>
    </div>
  );
}
