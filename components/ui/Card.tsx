import type { ReactNode } from "react";

type Props = {
  variant?: "light" | "dark";
  className?: string;
  children: ReactNode;
  testId?: string;
};

const variants = {
  light:
    "bg-canvas border border-ash text-ink hover:border-ink/30 transition-colors duration-150",
  dark: "bg-graphite text-canvas",
} as const;

export function Card({
  variant = "light",
  className = "",
  children,
  testId,
}: Props) {
  return (
    <div
      data-testid={testId}
      className={`rounded-card p-6 ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
