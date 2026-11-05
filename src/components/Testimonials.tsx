import Image from "next/image";
import type { CSSProperties } from "react";
import { testimonials } from "@/lib/site";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";

type Item = (typeof testimonials.items)[number];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="16" height="16" viewBox="0 0 24 24" fill={n <= rating ? "#f5c518" : "rgb(255 255 255 / 0.15)"} aria-hidden="true">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ t }: { t: Item }) {
  const c = t.client;
  const placeholder = !t.quote;
  return (
    <figure className="flex w-[300px] shrink-0 flex-col gap-4 rounded-[22px] border border-white/[0.08] bg-[linear-gradient(160deg,#121a30_0%,#0b1020_100%)] p-6 shadow-[0_20px_50px_-30px_rgb(0_0_0/0.9)] transition-colors hover:border-electric/40 sm:w-[380px]">
      <div className="flex min-h-5 items-center justify-between">
        {t.rating > 0 ? (
          <Stars rating={t.rating} />
        ) : (
          <svg width="26" height="20" viewBox="0 0 34 26" fill="#287bff" aria-hidden="true">
            <path d="M0 26V15.6C0 6.9 4.4 1.7 13.1 0l1.6 3.6C10 5 7.6 7.8 7.3 12H14v14H0zm19.3 0V15.6C19.3 6.9 23.7 1.7 32.4 0L34 3.6c-4.7 1.4-7.1 4.2-7.4 8.4h6.7v14h-14z" />
          </svg>
        )}
        {placeholder && (
          <span className="rounded-full bg-electric/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-electric">Awaiting approval</span>
        )}
      </div>
      <blockquote className="flex-1">
        {placeholder ? (
          <p className="text-[14.5px] italic leading-relaxed text-muted">
            {c.name}’s review will appear here once they approve it.
          </p>
        ) : (
          <p className="text-[14.5px] leading-relaxed text-ice/90">“{t.quote}”</p>
        )}
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-white/[0.07] pt-4">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black p-1 ring-1 ring-white/15">
          <Image src={c.logo} alt="" width={c.w} height={c.h} sizes="40px" className="max-h-full w-auto object-contain" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold text-white">{t.name || c.name}</span>
          <span className="block truncate text-[12.5px] text-mist">
            {t.name ? `${t.role ? `${t.role}, ` : ""}${c.name}` : "Inspire Media client"}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** One scrolling row. The cards are drawn twice so the loop is seamless; the copy is hidden from screen readers. */
function Row({ items, reverse, duration }: { items: readonly Item[]; reverse?: boolean; duration: string }) {
  return (
    <div className="marquee-wrap mask-fade-x overflow-hidden py-2">
      <div className="marquee" data-reverse={reverse ? "true" : undefined} style={{ "--duration": duration } as CSSProperties}>
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex gap-5 pr-5">
            {items.map((t) => (
              <ReviewCard key={t.client.name} t={t} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * "What clients say": two rows of review cards drifting in opposite directions (pause on hover).
 * Edit the reviews in src/lib/site.ts → testimonials.
 */
export function Testimonials() {
  const half = Math.ceil(testimonials.items.length / 2);
  const rowA = testimonials.items.slice(0, half);
  const rowB = testimonials.items.slice(half);

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="relative overflow-x-clip py-24 lg:py-32">
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[min(1100px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.12),transparent)]" />
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
        <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-electric">
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
          {testimonials.eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-electric" />
        </p>
        <h2 id="testimonials-title" className="text-silver text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[60px]">
          <Hl text={testimonials.title} />
        </h2>
        <p className="max-w-xl text-[15px] leading-relaxed text-mist">{testimonials.body}</p>
      </Reveal>

      <div className="mt-14 flex flex-col gap-5">
        {/* Top row drifts right, bottom row drifts left. Lower duration = faster. */}
        <Row items={rowA} duration="24s" reverse />
        <Row items={rowB} duration="26s" />
      </div>
    </section>
  );
}
