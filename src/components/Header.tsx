"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { site, whatsappUrl } from "@/lib/site";
import { MobileNavigation } from "./MobileNavigation";
import { ChatIcon, MenuIcon } from "./ui/icons";

/** Compact floating pill nav, centred (reference layout). */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = site.nav
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3">
        <div className="pill pointer-events-auto flex w-full max-w-[600px] items-center justify-between gap-3 rounded-full py-1.5 pl-4 pr-1.5 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)]">
          <a href="/#top" aria-label={`${site.name} — back to top`} className="flex shrink-0 items-center gap-2">
            <Image src="/brand/inspire-media-logo-white.svg" alt={site.name} width={359} height={226} priority className="h-7 w-auto" />
          </a>

          <nav aria-label="Primary" className="hidden items-center md:flex">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={`/${item.href}`}
                aria-current={active === item.href ? "true" : undefined}
                className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  active === item.href ? "text-white" : "text-muted hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hidden h-8 items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.12] sm:flex"
            >
              <ChatIcon size={14} />
              Chat
            </a>
            <a href="/#contact" className="btn btn-white !h-8 !px-3.5 !text-[13px]">
              Book a call
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="flex size-8 items-center justify-center rounded-full bg-white/[0.07] text-white md:hidden"
            >
              <MenuIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
