"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { designWork } from "@/lib/site";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { CloseIcon } from "./ui/icons";

type Tile = (typeof designWork.tiles)[number];

/**
 * Graphic design showcase: a continuously moving strip of real creatives
 * (pauses on hover). Tap a design to see it full size.
 */
export function DesignStrip() {
  const [open, setOpen] = useState<Tile | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const row = (copy: number) => (
    <div key={copy} aria-hidden={copy === 1} className="flex h-full shrink-0 gap-4 pr-4 sm:gap-5 sm:pr-5">
      {designWork.tiles.map((t) => {
        return (
          <button
            key={t.src}
            type="button"
            tabIndex={copy === 1 ? -1 : 0}
            onClick={() => setOpen(t)}
            aria-label={`View design: ${t.alt}`}
            className="group relative h-full shrink-0 cursor-zoom-in overflow-hidden rounded-[18px] border border-white/10 bg-panel outline-none transition-[transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-cream/50 focus-visible:ring-2 focus-visible:ring-cream"
            style={{ aspectRatio: `${t.w} / ${t.h}` }}
          >
            <Image src={t.src!} alt={t.alt!} width={t.w!} height={t.h!} sizes="(min-width: 640px) 320px, 240px" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="designs" aria-labelledby="designs-title" className="relative overflow-x-clip py-24 lg:py-32">
      <div aria-hidden="true" className="absolute left-1/2 top-[60%] -z-10 h-[520px] w-[min(1200px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.12),transparent)]" />

      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
        <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-electric">
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
          {designWork.eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-electric" />
        </p>
        <h2 id="designs-title" className="text-silver text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[58px]">
          <Hl text={designWork.title} />
        </h2>
        <p className="max-w-xl text-[15px] leading-relaxed text-mist sm:text-base">{designWork.body}</p>
      </Reveal>

      {/* Moving strip (drawn twice for a seamless loop) */}
      <div className="marquee-wrap mask-fade-x mt-14 h-[300px] overflow-hidden sm:h-[380px] lg:h-[420px]">
        <div className="marquee h-full" style={{ "--duration": `${designWork.loopSeconds}s` } as CSSProperties}>
          {row(0)}
          {row(1)}
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{designWork.hint}</p>

      {/* Full-size view */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        aria-label={open ? open.alt : "Design"}
        className="fixed inset-0 m-auto h-fit max-h-none w-fit max-w-none overflow-visible bg-transparent p-0 backdrop:bg-[#03050a]/85 backdrop:backdrop-blur-md"
      >
        {open && (
          <div className="relative w-fit">
            <Image
              src={open.src!}
              alt={open.alt!}
              width={open.w!}
              height={open.h!}
              sizes="90vw"
              className="h-auto max-h-[86dvh] w-auto max-w-[90vw] rounded-[18px] object-contain"
            />
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute -right-3 -top-3 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-[#0a1020] shadow-lg transition hover:bg-ice sm:-right-5 sm:-top-5"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}
