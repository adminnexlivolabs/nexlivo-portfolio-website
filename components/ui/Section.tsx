import type { ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, className = "", children }: Props) {
  return (
    <section id={id} className={`py-12 md:py-16 lg:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
