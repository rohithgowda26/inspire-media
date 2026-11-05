"use client";

import { useEffect, useState } from "react";
import { site, whatsappUrl } from "@/lib/site";
import { ChatIcon, PhoneIcon } from "./ui/icons";

/**
 * Fixed Call + WhatsApp buttons, bottom-right.
 * Hidden over the hero (which has its own CTAs) and slide in once the visitor scrolls past it.
 */
export function FloatingContact() {
  const phone = site.contact.primaryPhone;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-4 z-30 flex flex-col items-center gap-3 transition-all duration-500 sm:bottom-7 sm:right-7 sm:gap-4 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      aria-hidden={!visible || undefined}
    >
      <a
        href={`tel:${phone.tel}`}
        aria-label={`Call ${site.name} on ${phone.display}`}
        tabIndex={visible ? undefined : -1}
        className="group flex flex-col items-center gap-1.5"
      >
        <span className="flex size-12 items-center justify-center rounded-full border border-electric bg-primary text-white shadow-[0_10px_30px_rgb(23_71_255/0.55)] transition-transform group-hover:-translate-y-0.5 sm:size-14">
          <PhoneIcon size={22} />
        </span>
        <span className="hidden rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-white/10 sm:block">
          Call
        </span>
      </a>
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${site.name} on WhatsApp`}
        tabIndex={visible ? undefined : -1}
        className="group flex flex-col items-center gap-1.5"
      >
        <span className="flex size-12 animate-pulse-ring items-center justify-center rounded-full bg-whatsapp text-white transition-transform group-hover:-translate-y-0.5 sm:size-14">
          <ChatIcon size={24} />
        </span>
        <span className="hidden rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-semibold ring-1 ring-white/10 sm:block">
          WhatsApp
        </span>
      </a>
    </div>
  );
}
