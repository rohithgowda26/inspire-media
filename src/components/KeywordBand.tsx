import type { CSSProperties } from "react";

const SERVICES = ["SEO", "Performance Ads", "Creative Content", "Meta Ads", "Google Ads", "Reels", "Brand Storytelling", "Landing Pages"];
const PROCESS = ["Audit", "Strategy", "Execute", "Scale", "Repeat"];

function Strip({ words, className, reverse, duration }: { words: string[]; className: string; reverse?: boolean; duration: string }) {
  const row = (copy: number) => (
    <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="px-5 sm:px-8">{w}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 opacity-80">
            <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
          </svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden py-4 sm:py-5 ${className}`}>
      <div className="marquee" data-reverse={reverse ? "true" : undefined} style={{ "--duration": duration } as CSSProperties}>
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}

/**
 * Two crossing keyword strips: a dark-cream band (services) over an electric-blue band (process).
 * A deliberate contrast moment that breaks the dark page rhythm.
 */
export function KeywordBand() {
  return (
    <section aria-label="What we do" className="relative isolate overflow-x-clip py-16 sm:py-24">
      <h2 className="sr-only">What we do: {SERVICES.join(", ")}</h2>
      <Strip
        words={PROCESS}
        reverse
        duration="38s"
        className="absolute inset-x-[-5%] top-1/2 -z-10 -translate-y-1/2 rotate-[3deg] bg-primary font-display text-[34px] uppercase tracking-[0.02em] text-white/90 sm:text-[52px]"
      />
      <Strip
        words={SERVICES}
        duration="45s"
        className="relative mx-[-5%] -rotate-[2.5deg] bg-cream font-display text-[34px] uppercase tracking-[0.02em] text-[#0a1020] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] sm:text-[52px]"
      />
    </section>
  );
}
