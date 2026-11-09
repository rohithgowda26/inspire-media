"use client";

import Image from "next/image";
import { prefillLead } from "@/lib/events";
import { client, industries } from "@/lib/site";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { ArrowRightIcon } from "./ui/icons";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Industries we grow: one tile per sector with the real clients' logos. Hover (or focus) lights the
 * tile and reveals what we've made for that industry. Below: other industries we welcome + a CTA.
 * Keeps id="about" so the "About" menu link still lands here.
 */
export function Industries() {
  const { sectors } = industries;

  return (
    <section id="about" aria-labelledby="industries-title" className="relative isolate px-4 py-24 sm:px-6 lg:py-32">
      <div aria-hidden="true" className="absolute left-1/2 top-[40%] -z-10 h-[600px] w-[min(1200px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.12),transparent)]" />

      <div className="mx-auto max-w-[1232px]">
        {/* Heading */}
        <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-electric">
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
              {industries.eyebrow}
            </p>
            <h2 id="industries-title" className="text-[40px] font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-[58px] lg:text-[66px]">
              <Hl text={industries.title} />
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-mist lg:col-span-5 lg:pb-2">{industries.body}</p>
        </Reveal>

        {/* Sector tiles */}
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-5">
          {sectors.map((sec, i) => (
            <Reveal
              as="li"
              key={sec.title}
              delay={(i % 4) * 80}
              className={`group relative isolate flex min-h-[250px] flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[linear-gradient(160deg,#0f1628_0%,#090d18_100%)] p-6 outline-none transition-[border-color,box-shadow] duration-500 hover:border-electric/50 hover:shadow-[0_30px_70px_-30px_rgb(23_71_255/0.55)] focus-within:border-electric/50 ${
                i === 0 ? "lg:col-span-2" : ""
              }`}
            >
              {/* light that rises on hover */}
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-2/3 translate-y-8 bg-[radial-gradient(70%_100%_at_50%_100%,rgb(23_71_255/0.28),transparent)] opacity-0 transition-[opacity,transform] duration-700 group-hover:translate-y-0 group-hover:opacity-100" />

              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[11px] tracking-[0.18em] text-muted">{pad(i + 1)}</span>
                <span aria-hidden="true" className="flex size-9 -rotate-45 items-center justify-center rounded-full border border-white/12 text-white/50 transition-all duration-500 group-hover:rotate-0 group-hover:border-electric group-hover:bg-primary group-hover:text-white">
                  <ArrowRightIcon size={14} />
                </span>
              </div>

              <h3 className="mt-4 text-[22px] font-medium leading-tight tracking-[-0.02em] text-white sm:text-[24px]">{sec.title}</h3>

              {/* Clients in this industry */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {sec.clients.map((ci) => {
                  const c = client(ci);
                  return (
                    <span key={c.name} title={c.name} className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-black p-1.5 ring-1 ring-white/15 transition-transform duration-500 group-hover:scale-105">
                      <Image src={c.logo} alt={c.name} width={c.w} height={c.h} sizes="48px" className="max-h-full w-auto object-contain" />
                    </span>
                  );
                })}
                {sec.names.map((n) => (
                  <span key={n} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] text-ice">
                    {n}
                  </span>
                ))}
              </div>

              {/* What we've made — slides up on hover (always shown on touch screens) */}
              <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-6 text-[12.5px] text-mist transition-[opacity,transform] duration-500 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                {sec.work.map((w) => (
                  <li key={w} className="flex items-center gap-2">
                    <span aria-hidden="true" className="size-1 rounded-full bg-electric" />
                    {w}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}

          {/* CTA tile: every industry welcome */}
          <Reveal as="li" delay={sectors.length * 60} className="relative overflow-hidden rounded-[24px] bg-primary p-6 sm:col-span-2 sm:p-8 lg:col-span-4">
            <span aria-hidden="true" className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex h-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-[26px] font-medium leading-tight tracking-[-0.02em] text-white sm:text-[30px]">{industries.cta.title}</h3>
                <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-white/80">{industries.cta.body}</p>
              </div>
              <button type="button" onClick={() => prefillLead({})} className="btn btn-white w-full shrink-0 cursor-pointer sm:w-auto sm:self-start lg:self-center">
                {industries.cta.label} <ArrowRightIcon size={15} />
              </button>
            </div>
          </Reveal>
        </ul>

        {/* Other industries we welcome */}
        <Reveal className="mt-12 flex flex-col items-center gap-5 text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-muted">We also welcome</p>
          <ul className="flex max-w-4xl flex-wrap justify-center gap-2.5">
            {industries.more.map((m) => (
              <li key={m} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[13.5px] text-ice transition-colors hover:border-electric/60 hover:text-white">
                {m}
              </li>
            ))}
            <li className="rounded-full border border-electric/50 bg-primary/15 px-4 py-2 text-[13.5px] font-semibold text-white">+ every other industry</li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
