"use client";

import { useEffect, useRef } from "react";
import { home, site, whatsappUrl } from "@/lib/site";
import { CallScreen, PhoneFrame } from "./PhoneMockup";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { ChatIcon, PhoneIcon } from "./ui/icons";

/** Reference "Start using … now": heading, store-style badges, phone rising into the next section. */
export function StartCta() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const phone = site.contact.primaryPhone;

  useEffect(() => {
    const el = phoneRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      const r = el.parentElement!.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (r.height + window.innerHeight * 0.4)));
      el.style.transform = `translate3d(-50%, ${(1 - p) * 140}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section aria-labelledby="start-title" className="relative z-10 px-4 pt-24 sm:px-6 lg:pt-32">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <h2 id="start-title" className="text-silver text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[68px]">
          <Hl text={home.start.title} />
        </h2>
        <p className="max-w-md text-[15px] leading-relaxed tracking-[0.01em] text-mist">{home.start.body}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="badge-btn">
            <ChatIcon size={28} />
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[11px] text-mist">Message us on</span>
              <span className="text-[19px] font-semibold tracking-[-0.01em]">WhatsApp</span>
            </span>
          </a>
          <a href={`tel:${phone.tel}`} className="badge-btn">
            <PhoneIcon size={26} />
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[11px] text-mist">Call us on</span>
              <span className="text-[19px] font-semibold tracking-[-0.01em]">{phone.display}</span>
            </span>
          </a>
        </div>
      </Reveal>

      {/* Phone rises as you scroll and overlaps the section below */}
      <div className="relative mx-auto mt-16 h-[360px] max-w-[300px] sm:h-[420px]">
        <div ref={phoneRef} className="absolute left-1/2 top-0 w-[230px] will-change-transform sm:w-[280px]" style={{ transform: "translate3d(-50%, 0, 0)" }}>
          <PhoneFrame>
            <CallScreen />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
