import { content } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";
import { InstagramIcon, LinkedInIcon } from "@/components/ui/Icons";

const socialIcons = { Instagram: InstagramIcon, LinkedIn: LinkedInIcon };

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-ash">
      {/* Decorative dot pattern, upper portion only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-20"
        style={{
          backgroundImage: "radial-gradient(var(--color-ash) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-4 py-16 md:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="text-ink"><Logo /></span>
            <p className="mt-4 max-w-[28ch] text-body-sm text-fog">
              {content.footer.tagline}
            </p>
            <ul className="mt-5 flex gap-3">
              {content.footer.social.map((s) => {
                const Icon = socialIcons[s.label as keyof typeof socialIcons];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Nexlivo Labs on ${s.label}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-card border border-ash text-fog transition-colors duration-150 hover:border-ink/30 hover:text-ink"
                    >
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {content.footer.columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-body-sm font-bold text-ink">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-body-sm text-fog no-underline transition-colors duration-150 hover:text-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ash pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-fog">
            © {new Date().getFullYear()} Nexlivo Labs. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li>
              <a href={`mailto:${content.contact.email}`} className="text-caption text-fog no-underline hover:text-ink">
                {content.contact.email}
              </a>
            </li>
            <li>
              <a href={content.contact.phoneHref} className="text-caption text-fog no-underline hover:text-ink">
                {content.contact.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
