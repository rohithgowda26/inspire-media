"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { socialReels } from "@/lib/site";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { CloseIcon } from "./ui/icons";

type Reel = (typeof socialReels.reels)[number];

function ReelsIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M3 8.5h18M8 3l3 5.5M14 3l3 5.5" />
      <path d="M10 12.2v4.6l4-2.3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * One reel card. The video plays silently only while it is on screen
 * (saves data and battery); it never autoplays for visitors who prefer reduced motion.
 */
function ReelCard({ reel, onOpen, hidden }: { reel: Reel; onOpen: () => void; hidden?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={hidden ? -1 : 0}
      aria-label={`Play reel: ${reel.title}`}
      className="group relative aspect-[9/16] h-[340px] shrink-0 cursor-pointer overflow-hidden rounded-[22px] border border-white/10 bg-panel text-left shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] outline-none transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-electric/50 focus-visible:ring-2 focus-visible:ring-electric sm:h-[420px] lg:h-[460px]"
    >
      <video
        ref={ref}
        src={reel.poster ? reel.video : `${reel.video}#t=0.1`}
        poster={reel.poster || undefined}
        muted
        loop
        playsInline
        preload={reel.poster ? "none" : "metadata"}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        <ReelsIcon size={13} /> Reel
      </span>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 scale-90 items-center justify-center rounded-full bg-white/90 text-[#0a1020] opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span className="absolute inset-x-4 bottom-4">
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-electric">{reel.tag}</span>
        <span className="mt-1 block text-[17px] font-semibold leading-tight text-white">{reel.title}</span>
      </span>
    </button>
  );
}

/**
 * "Social Media Content That Drives Growth": heading + a continuously moving strip of reels
 * (pauses on hover; ‹ › arrows step it manually). Tap a reel to watch it with sound in a pop-up player.
 */
export function SocialReels() {
  const [open, setOpen] = useState<Reel | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Moving strip, driven by JS so the arrows can step it: it drifts left on its own,
  // pauses while hovered, and the ‹ › arrows glide it one reel back/forward.
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0); // px the strip has moved left
  const tweenTo = useRef<number | null>(null); // where an arrow click is gliding to
  const hovering = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const half = track.scrollWidth / 2; // width of one copy of the reels
      if (half > 0) {
        if (tweenTo.current !== null) {
          const diff = tweenTo.current - offset.current;
          if (reduced || Math.abs(diff) < 0.5) {
            offset.current = tweenTo.current;
            tweenTo.current = null;
          } else offset.current += diff * 0.12;
        } else if (!hovering.current && !reduced) {
          offset.current += (half / socialReels.loopSeconds) * dt;
        }
        // keep looping seamlessly in both directions
        const wrap = offset.current >= half ? -half : offset.current < 0 ? half : 0;
        if (wrap) {
          offset.current += wrap;
          if (tweenTo.current !== null) tweenTo.current += wrap;
        }
        track.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /** Glide one reel left (-1) or right (+1), landing neatly on a card edge. */
  const step = useCallback((dir: number) => {
    const track = trackRef.current;
    const card = track?.querySelector("button");
    if (!track || !card) return;
    const size = card.getBoundingClientRect().width + 20; // card + gap
    const from = tweenTo.current ?? offset.current;
    tweenTo.current = (dir > 0 ? Math.floor(from / size + 0.001) + 1 : Math.ceil(from / size - 0.001) - 1) * size;
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const reels = socialReels.reels;

  return (
    <section id="reels" aria-labelledby="reels-title" className="relative overflow-x-clip py-24 lg:py-32">
      <div aria-hidden="true" className="absolute left-1/2 top-[55%] -z-10 h-[560px] w-[min(1200px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.14),transparent)]" />

      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
        <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-electric">
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
          {socialReels.eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-electric" />
        </p>
        <h2 id="reels-title" className="text-silver text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[56px]">
          <Hl text={socialReels.title} />
        </h2>
        <p className="max-w-2xl text-[15px] leading-relaxed text-mist sm:text-base">{socialReels.body}</p>
      </Reveal>

      {/* Moving strip (drawn twice for a seamless loop; the copy is hidden from screen readers) */}
      <div
        className="mask-fade-x mt-14 overflow-hidden py-3"
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex gap-5 pr-5">
              {reels.map((r) => (
                <ReelCard key={r.video} reel={r} hidden={copy === 1} onOpen={() => setOpen(r)} />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Manual arrows either side of the hint */}
      <div className="mt-6 flex items-center justify-center gap-4 px-4 sm:gap-6">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous reels"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-electric/60 bg-ink/70 text-ice transition hover:bg-primary hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{socialReels.hint}</p>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next reels"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-electric/60 bg-ink/70 text-ice transition hover:bg-primary hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Pop-up player with sound */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        aria-label={open ? `Reel: ${open.title}` : "Reel"}
        className="fixed inset-0 m-auto h-fit max-h-none w-fit max-w-none overflow-visible bg-transparent p-0 backdrop:bg-[#03050a]/85 backdrop:backdrop-blur-md"
      >
        {open && (
          <div className="relative w-fit">
            <video
              key={open.video}
              src={open.video}
              poster={open.poster || undefined}
              controls
              autoPlay
              playsInline
              className="aspect-[9/16] h-[min(86dvh,760px)] rounded-[22px] bg-black object-cover"
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
