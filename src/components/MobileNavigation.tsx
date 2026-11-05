"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { site, whatsappUrl } from "@/lib/site";
import { ChatIcon, CloseIcon, PhoneIcon } from "./ui/icons";

type Props = { open: boolean; onClose: () => void };

export function MobileNavigation({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock page scroll, focus the panel, close on Escape, keep Tab inside the menu
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>("a, button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <div id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} className={`fixed inset-0 z-50 md:hidden ${open ? "visible" : "invisible"}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-ink/80 backdrop-blur-md transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panelRef}
        className={`card absolute inset-x-3 top-3 flex flex-col gap-6 !rounded-[28px] p-5 transition-all duration-500 ease-out-expo ${
          open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <Image src="/brand/inspire-media-logo-white.svg" alt={site.name} width={359} height={226} className="h-7 w-auto" />
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex size-9 items-center justify-center rounded-full bg-white/[0.07] text-white">
            <CloseIcon size={16} />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={`/${item.href}`}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="border-b border-white/[0.06] py-3.5 text-2xl font-semibold tracking-tight text-white last:border-0"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5">
          <a href="/#contact" onClick={onClose} tabIndex={open ? 0 : -1} className="btn btn-white">
            Book a strategy call
          </a>
          <div className="grid grid-cols-2 gap-2.5">
            <a href={`tel:${site.contact.primaryPhone.tel}`} tabIndex={open ? 0 : -1} className="btn btn-dark">
              <PhoneIcon size={16} /> Call
            </a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} className="btn btn-dark">
              <ChatIcon size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
