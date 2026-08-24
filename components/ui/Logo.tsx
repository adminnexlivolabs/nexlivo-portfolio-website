type Props = { className?: string; labsClassName?: string };

export function Logo({ className = "", labsClassName = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 56"
      role="img"
      aria-label="Nexlivo Labs"
      className={className}
      style={{ height: "1.75rem", width: "auto" }}
    >
      <text
        x="100"
        y="26"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="32"
        fontWeight="500"
        letterSpacing="-1"
        fill="currentColor"
      >
        Nexlivo
      </text>
      <text
        x="100"
        y="48"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="13"
        fontWeight="700"
        letterSpacing="6"
        className={labsClassName}
        fill="currentColor"
      >
        LABS
      </text>
    </svg>
  );
}
