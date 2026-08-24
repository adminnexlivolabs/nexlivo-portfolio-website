import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

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
      </div>
    </Section>
  );
}
