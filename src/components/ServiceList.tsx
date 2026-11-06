"use client";

import type { CSSProperties } from "react";
import { prefillLead } from "@/lib/events";
import { serviceList } from "@/lib/site";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { ArrowRightIcon } from "./ui/icons";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Services as a quiet, editorial index: numbered rows with hairline rules that draw in on scroll.
 * Hover (or focus) warms a row: a soft cream wash sweeps in, the name eases right in cream,
 * its one-line description appears and the arrow fills. Click opens the contact form with that service.
 */
export function ServiceList() {
  const items = serviceList.items;

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative isolate px-4 py-24 sm:px-6 lg:py-36"
    >
      <div
        aria-hidden="true"
        className="absolute right-[-12%] top-[18%] -z-10 size-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.10),transparent)]"
      />

      <div className="mx-auto grid max-w-[1232px] gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Heading */}
        <Reveal className="flex flex-col gap-6 lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
          <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-electric">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-gradient-to-r from-transparent to-electric"
            />
            {serviceList.eyebrow}
            <span className="text-muted">/ {pad(items.length)}</span>
          </p>
          <h2
            id="services-title"
            className="text-[40px] font-medium leading-[1.06] tracking-[-0.035em] text-white sm:text-[52px]"
          >
            <Hl text={serviceList.title} />
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-mist">
            {serviceList.body}
          </p>
        </Reveal>

        {/* Index */}
        <ul className="lg:col-span-8" aria-label="Our services">
          {items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 70} className="relative">
              <span
                aria-hidden="true"
                className="svc-line absolute inset-x-0 top-0 h-px bg-white/[0.12]"
                style={{ "--delay": `${i * 70}ms` } as CSSProperties}
              />
              <button
                type="button"
                onClick={() => prefillLead({ service: it.formValue })}
                className="group relative flex w-full cursor-pointer items-center gap-5 overflow-hidden py-6 text-left outline-none focus-visible:bg-white/[0.03] sm:gap-8 sm:py-8"
              >
                {/* soft cream wash that sweeps in on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[linear-gradient(90deg,rgb(232_220_196/0.07),rgb(232_220_196/0.015)_70%,transparent)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />

                <span className="relative w-8 shrink-0 font-mono text-[12px] tracking-[0.1em] text-muted transition-colors duration-500 group-hover:text-cream">
                  {pad(i + 1)}
                </span>

                <span className="relative flex min-w-0 flex-1 flex-col gap-1.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-8">
                  <span className="text-[26px] font-normal leading-tight tracking-[-0.03em] text-white/90 transition-[color,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-2 group-hover:text-cream sm:text-[38px] lg:text-[46px]">
                    {it.title}
                  </span>
                  <span className="text-[13px] leading-snug text-mist transition-[opacity,transform] duration-500 lg:max-w-[270px] lg:translate-x-3 lg:text-right lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                    {it.line}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="relative flex size-11 shrink-0 -rotate-45 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all duration-500 group-hover:rotate-0 group-hover:border-cream group-hover:bg-cream group-hover:text-[#0a1020]"
                >
                  <ArrowRightIcon size={16} />
                </span>
              </button>
              {i === items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="svc-line absolute inset-x-0 bottom-0 h-px bg-white/[0.12]"
                  style={{ "--delay": `${(i + 1) * 70}ms` } as CSSProperties}
                />
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
