import type { ReactNode } from "react";

type Props = {
  href: string;
  variant?: "filled" | "ghost";
  children: ReactNode;
  className?: string;
  testId?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill px-5 py-3 " +
  "min-h-[44px] text-body-sm font-medium no-underline cursor-pointer " +
  "transition-colors duration-150";

const variants = {
  filled: "bg-ink text-canvas hover:bg-carbon",
  ghost: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-canvas",
} as const;

export function Button({
  href,
  variant = "filled",
  children,
  className = "",
  testId,
}: Props) {
  return (
    <a
      href={href}
      data-testid={testId}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
      <span aria-hidden="true">&#8594;</span>
    </a>
  );
}
