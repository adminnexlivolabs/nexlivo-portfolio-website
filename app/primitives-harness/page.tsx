import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export default function Harness() {
  return (
    <Section id="harness">
      <div data-testid="section-inner">
        <Button href="#" variant="filled" testId="btn-filled">
          Filled
        </Button>
        <Button href="#" variant="ghost" testId="btn-ghost">
          Ghost
        </Button>
        <Card variant="light" testId="card-light">
          Light card
        </Card>
        <Reveal>
          <p data-testid="reveal-target">Revealed content</p>
        </Reveal>
      </div>
    </Section>
  );
}
