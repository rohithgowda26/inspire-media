import Image from "next/image";
import Link from "next/link";
import { site, whatsappUrl } from "@/lib/site";

type FooterLink = { label: string; href: string; external?: boolean };

const linkClass = "text-[15px] text-mist transition-colors hover:text-white";

function FooterAnchor({
  link,
  className = linkClass,
}: {
  link: FooterLink;
  className?: string;
}) {
  if (link.href === "/privacy")
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );
  return (
    <a
      href={link.href}
      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
      className={className}
    >
      {link.label}
    </a>
  );
}

/** Footer: brand block + four link columns, giant outlined wordmark, mono copyright bar. */
export function Footer() {
  const { contact } = site;
  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Company",
      links: [
        { label: "About", href: "/#about" },
        { label: "Services", href: "/#services" },
        { label: "Work", href: "/#work" },
        { label: "Process", href: "/#process" },
        { label: "Contact", href: "/#contact" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "SEO", href: "/#services" },
        { label: "Paid Ads", href: "/#services" },
        { label: "Creative Content", href: "/#services" },
        { label: "Political Campaigns", href: "/political-campaigns" },
      ],
    },
    {
      title: "Follow",
      links: [
        { label: "Instagram", href: contact.instagram.url, external: true },
        { label: "WhatsApp", href: whatsappUrl(), external: true },
      ],
    },
    {
      title: "Contact",
      links: [
        ...contact.phones.map((p) => ({
          label: p.display,
          href: `tel:${p.tel}`,
        })),
        { label: "Email us", href: `mailto:${contact.email}` },
      ],
    },
  ];

  return (
    <footer className="overflow-hidden bg-ink px-4 pb-28 pt-16 sm:px-6 sm:pb-10 lg:pt-20">
      <div className="mx-auto flex max-w-[1232px] flex-col">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.85fr)] lg:gap-16">
          {/* Brand block */}
          <div className="flex max-w-[330px] flex-col gap-5">
            <Image
              src="/brand/inspire-media-logo-white.svg"
              alt={site.name}
              width={359}
              height={226}
              className="h-12 w-auto self-start"
            />
            <p className="text-[16px] leading-relaxed text-ice/90">
              Performance marketing for Brands &amp; D2C businesses. We
              don&apos;t just market your brand — we grow it.
            </p>
            <address className="text-[14px] not-italic leading-relaxed text-muted">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Inspire+Media+126+Revenue+Colony+Raj+Nagar+Hubli+580032"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {contact.address.line1}, {contact.address.city} –{" "}
                {contact.address.postalCode} ↗
              </a>
            </address>
            <iframe
              title="Inspire Media location on Google Maps"
              src="https://www.google.com/maps?q=126+Revenue+Colony+Raj+Nagar+Hubli+580032&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-44 w-full rounded-xl border border-white/10"
            />
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4"
          >
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-5">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <FooterAnchor link={l} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Giant outlined wordmark */}
        <p
          aria-hidden="true"
          className="wordmark-outline mt-14 select-none whitespace-nowrap font-display text-[clamp(52px,16.4vw,222px)] uppercase leading-[0.9] tracking-[0.005em] lg:mt-12"
        >
          Inspire Media
        </p>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.08] pt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <FooterAnchor
              link={{ label: "Privacy", href: "/privacy" }}
              className="transition-colors hover:text-white"
            />
            <FooterAnchor
              link={{
                label: "Instagram",
                href: contact.instagram.url,
                external: true,
              }}
              className="transition-colors hover:text-white"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
