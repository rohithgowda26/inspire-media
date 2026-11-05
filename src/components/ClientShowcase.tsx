"use client";

import Image from "next/image";
import { useRef } from "react";
import { clients, home } from "@/lib/site";
import { GrowthScreen, PhoneFrame } from "./PhoneMockup";
import { Reveal } from "./ui/Reveal";
import { Hl, plain } from "./ui/Hl";
import { CloseIcon } from "./ui/icons";

type Client = (typeof clients)[number];

function Tile({ c }: { c: Client }) {
  return (
    <div className="flex size-28 shrink-0 items-center justify-center rounded-[30px] bg-black p-4 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1.5 sm:size-36 sm:rounded-[36px]">
      <Image src={c.logo} alt="" width={c.w} height={c.h} sizes="150px" className="max-h-full w-auto max-w-full object-contain" />
    </div>
  );
}

/** Reference "integrations" band: app-icon row around a phone, cut by a horizon line. */
export function ClientShowcase() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const loop = [...clients, ...clients];

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#05080f_0%,#0a0f1c_18%,#0d1324_60%,#0a0f1c_100%)] pt-28 lg:pt-36"
    >
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center">
        <h2 id="work-title" className="text-silver text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[64px]">
          <Hl text={home.clients.title} />
        </h2>
        <p className="max-w-lg text-[15px] leading-relaxed tracking-[0.01em] text-mist">{home.clients.body}</p>
      </Reveal>

      <div className="relative mt-20 h-[260px] sm:mt-24 sm:h-[330px]">
        <div aria-hidden="true" className="marquee-wrap mask-fade-x absolute inset-x-0 top-14 overflow-hidden sm:top-16">
          <div className="marquee gap-6 sm:gap-10" style={{ "--duration": "70s" } as React.CSSProperties}>
            {loop.map((c, i) => (
              <Tile key={`${c.name}-${i}`} c={c} />
            ))}
          </div>
        </div>
        {/* Phone rises from the horizon in the centre */}
        <div className="absolute bottom-0 left-1/2 w-[230px] -translate-x-1/2 overflow-hidden sm:w-[300px]" style={{ height: "100%" }}>
          <PhoneFrame className="!rounded-b-none !border-b-0">
            <GrowthScreen />
          </PhoneFrame>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgb(207_224_255/0.35),transparent)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0f1c] to-transparent" />
      </div>

      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center sm:py-20">
        <h3 className="text-2xl font-semibold tracking-[-0.02em] sm:text-[30px]">{home.clients.footTitle}</h3>
        <p className="max-w-lg text-[15px] leading-relaxed tracking-[0.01em] text-mist">{home.clients.footBody}</p>
        <button type="button" onClick={() => dialogRef.current?.showModal()} aria-haspopup="dialog" className="btn btn-dark mt-3">
          See all {clients.length} clients
        </button>
      </Reveal>

      {/* Accessible static list of client names */}
      <ul className="sr-only" aria-label="Clients">
        {clients.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby="clients-dialog-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="card m-auto max-h-[88dvh] w-[min(880px,calc(100%-24px))] p-0 text-white"
      >
        <div className="flex flex-col gap-6 p-6 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <h3 id="clients-dialog-title" className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              {plain(home.clients.title)}
            </h3>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.14]"
            >
              <CloseIcon size={16} />
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {clients.map((c) => (
              <li key={c.name} className="flex flex-col items-center gap-3 rounded-2xl bg-white/[0.03] p-4 text-center ring-1 ring-white/[0.06]">
                <div className="flex h-24 w-full items-center justify-center rounded-xl bg-black p-3">
                  <Image src={c.logo} alt={`${c.name} logo`} width={c.w} height={c.h} sizes="180px" className="max-h-full w-auto max-w-full object-contain" />
                </div>
                <span className="text-[13px] font-medium text-mist">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </section>
  );
}
