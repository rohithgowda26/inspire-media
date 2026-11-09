"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { growthIntro, site } from "@/lib/site";
import { Reveal } from "./ui/Reveal";

const posts = growthIntro.posts;
const N = posts.length;
const IG_URL = site.contact.instagram.url;
const AUTOPLAY_MS = growthIntro.autoplaySeconds * 1000;

/** Types each word out, pauses, deletes it, then moves to the next. */
function useTypewriter(words: readonly string[]) {
  const [text, setText] = useState<string>(words[0]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0;
    let i = words[0].length;
    let deleting = false;
    let timer = 0;
    const tick = () => {
      const word = words[w];
      if (!deleting && i === word.length) {
        deleting = true;
        timer = window.setTimeout(tick, 1800);
        return;
      }
      if (deleting && i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
      }
      i += deleting ? -1 : 1;
      setText(words[w].slice(0, i));
      timer = window.setTimeout(tick, deleting ? 40 : 85);
    };
    timer = window.setTimeout(tick, 1800);
    return () => window.clearTimeout(timer);
  }, [words]);
  return text;
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Below the hero: "We grow brands through <typed word>" on the left,
 * a fanned deck of Inspire Media's own Instagram posts with ‹ › controls on the right.
 */
export function GrowthIntro() {
  const word = useTypewriter(growthIntro.words);
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  const go = useCallback((dir: number) => setActive((a) => (a + dir + N) % N), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!paused.current && document.visibilityState === "visible") go(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [go]);

  const current = posts[active];

  return (
    <section id="intro" aria-labelledby="intro-title" className="relative isolate overflow-x-clip px-4 py-24 sm:px-6 lg:py-32">
      {/* Perspective grid floor */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%] overflow-hidden [perspective:700px] [mask-image:linear-gradient(to_top,transparent,#000_30%,#000_55%,transparent)]">
        <div className="absolute inset-x-[-50%] bottom-[-10%] h-[160%] origin-bottom [transform:rotateX(62deg)] bg-[linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_top,#000_10%,transparent_75%)]" />
      </div>
      <div aria-hidden="true" className="absolute right-[8%] top-1/2 -z-10 size-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.16),transparent)]" />

      <div className="mx-auto grid max-w-[1232px] items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
        {/* Copy */}
        <Reveal className="flex flex-col items-start gap-5">
          <p className="flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3.5 py-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-mist">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-electric shadow-[0_0_10px_#287bff]" />
            {growthIntro.eyebrow}
          </p>
          <h2 id="intro-title" className="text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[58px]">
            {growthIntro.titleStart}
            <span className="mt-1 block min-h-[1.15em] text-[32px] tracking-[-0.03em] sm:text-[44px]">
              <mark className="hl">{word}</mark>
              <span aria-hidden="true" className="caret" />
            </span>
            <span className="sr-only">{growthIntro.words.join(" ")}</span>
          </h2>
          <p className="max-w-xl text-[15px] leading-relaxed text-mist sm:text-[17px]">{growthIntro.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a href={growthIntro.primary.href} className="btn btn-blue !h-12 !px-6 !text-[15px]">
              {growthIntro.primary.label}
            </a>
            <a href={growthIntro.secondary.href} className="btn btn-dark !h-12 !px-6 !text-[15px]">
              {growthIntro.secondary.label}
            </a>
          </div>
        </Reveal>

        {/* Fanned deck of Inspire Media Instagram posts */}
        <div
          className="relative mx-auto w-full max-w-[520px]"
          onFocus={() => (paused.current = true)}
          onBlur={() => (paused.current = false)}
        >
          <div className="relative mx-auto aspect-[4/5] w-[64%] max-w-[340px]" aria-live="polite">
            {posts.map((p, i) => {
              let d = i - active;
              if (d > N / 2) d -= N;
              if (d < -N / 2) d += N;
              const ad = Math.abs(d);
              const upcoming = d > 0; // upcoming cards fan out up-left, previous ones down-right
              const style: CSSProperties =
                d === 0
                  ? { transform: "none", opacity: 1, zIndex: 50, filter: "none", transformOrigin: "50% 50%" }
                  : {
                      transformOrigin: upcoming ? "100% 100%" : "0% 0%",
                      transform: `rotate(${9 * ad}deg) scale(${1 - ad * 0.03})`,
                      opacity: ad <= 4 ? 0.78 - ad * 0.14 : 0,
                      zIndex: 50 - ad,
                      filter: `grayscale(0.7) blur(${ad * 0.5}px)`,
                    };
              return (
                <div
                  key={p.src}
                  aria-hidden={d !== 0}
                  className="absolute inset-0 transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={style}
                >
                  <a
                    href={IG_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={d === 0 ? 0 : -1}
                    aria-label={`${p.title} — see more on Instagram (${site.contact.instagram.handle})`}
                    className="block h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-[0_30px_70px_-25px_rgb(0_0_0/0.9)]"
                  >
                    <Image src={p.src} alt={p.title} width={800} height={1000} sizes="(min-width: 1024px) 340px, 64vw" priority={i < 2} className="h-full w-full object-cover" />
                  </a>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous post"
            className="absolute left-0 top-1/2 z-[60] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-electric/60 bg-ink/70 text-ice backdrop-blur transition hover:bg-primary hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next post"
            className="absolute right-0 top-1/2 z-[60] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-electric/60 bg-ink/70 text-ice backdrop-blur transition hover:bg-primary hover:text-white"
          >
            ›
          </button>

          <p className="relative z-[60] mt-14 flex items-center justify-center gap-2 text-center text-[13px] text-mist">
            <InstagramIcon size={14} />
            <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-ice">
              {site.contact.instagram.handle}
            </a>
            <span className="hidden text-mist sm:inline">· {current.title}</span>
            <span className="text-muted">
              {active + 1} / {N}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
