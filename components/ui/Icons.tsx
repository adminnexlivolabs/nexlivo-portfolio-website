type IconProps = { className?: string };

const base = "h-5 w-5";

export function WebIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <rect x="2" y="4" width="16" height="12" rx="1.5" />
      <path d="M2 7.5h16" />
      <path d="M8 10.5l-1.75 1.75L8 14" />
      <path d="M12 10.5l1.75 1.75L12 14" />
    </svg>
  );
}

export function MobileIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <rect x="6" y="2" width="8" height="16" rx="1.5" />
      <path d="M9 15.25h2" />
    </svg>
  );
}

export function DesignIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <path d="M12.5 2.5l5 5-8.75 8.75-5 1.25 1.25-5 7.5-10z" />
      <path d="M10.5 4.5l5 5" />
    </svg>
  );
}

export function CloudIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <path d="M5.75 15a3.25 3.25 0 01-.4-6.48A4 4 0 0113.9 6.24 3.25 3.25 0 0113.75 15h-8z" />
    </svg>
  );
}

export function FrontendIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <path d="M7 5.5L2.5 10 7 14.5" />
      <path d="M13 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}

export function BackendIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <rect x="3" y="3" width="14" height="5" rx="1.25" />
      <rect x="3" y="12" width="14" height="5" rx="1.25" />
      <path d="M6 5.5h.01" />
      <path d="M6 14.5h.01" />
    </svg>
  );
}

export function CloudOpsIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <path d="M5.5 13.5a3 3 0 01-.35-5.98A3.65 3.65 0 0112.65 6.1 2.9 2.9 0 0112.5 13.5h-7z" />
      <path d="M10 13.5V17M8 17h4" />
    </svg>
  );
}

export function InstagramIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <rect x="2.5" y="2.5" width="15" height="15" rx="4" />
      <circle cx="10" cy="10" r="3.5" />
      <path d="M14.2 5.8h.01" />
    </svg>
  );
}

export function LinkedInIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${base} ${className}`}
    >
      <rect x="2.5" y="2.5" width="15" height="15" rx="2.5" />
      <path d="M6.5 8.5v6" />
      <path d="M6.5 6.3h.01" />
      <path d="M10 14.5v-4a2 2 0 014 0v4" />
      <path d="M10 10.5v4" />
    </svg>
  );
}
