type Props = { className?: string };

// Decorative network/circuit motif — evokes cloud & infrastructure without
// depending on a raster image (keeps the page's zero-third-party-request and
// CLS guarantees intact). Colour comes from currentColor so callers control
// tone via a text-* class; opacity is set by the caller's wrapper, not here,
// so the same markup works on both light and dark sections.
export function CircuitPattern({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.25">
        <path d="M-20 120H220v-80h260v160h240V80h300v320H1220" />
        <path d="M-20 460h180V300h320v-140h260v260h340v-220h280" />
        <path d="M120 40v560" strokeDasharray="2 10" />
        <path d="M860 40v560" strokeDasharray="2 10" />
      </g>
      <g fill="currentColor">
        <circle cx="220" cy="120" r="5" />
        <circle cx="480" cy="200" r="5" />
        <circle cx="720" cy="40" r="5" />
        <circle cx="1020" cy="80" r="5" />
        <circle cx="160" cy="460" r="5" />
        <circle cx="440" cy="300" r="5" />
        <circle cx="700" cy="160" r="5" />
        <circle cx="1040" cy="240" r="5" />
      </g>
    </svg>
  );
}
