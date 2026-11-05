"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { growthIntro, site } from "@/lib/site";
import { Reveal } from "./ui/Reveal";

const profiles = growthIntro.profiles;
const N = profiles.length;
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

const TILE_LABELS = ["Ad creative", "Reel", "Carousel", "Story"];
const HIGHLIGHTS = ["Offers", "Reels", "Updates", "Contact"];

/**
 * Instagram-style profile card (dark, like Instagram on the web), built from the client's
 * logo, name, category and brand colours. Shown until a real screenshot is set in site.ts.
 * Sizes use container units (cqw) so it scales with the card.
 */
function ProfileCard({ p }: { p: (typeof profiles)[number] }) {
  const c = p.client;
  const [accent, dark] = p.colors;
  const username = p.handle || c.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
  return (
    <div className="@container flex h-full flex-col bg-black text-left text-white">
      {/* Header: avatar + name + buttons */}
      <div className="flex items-center gap-[4cqw] px-[4.5cqw] pt-[4cqw]">
        <span className="shrink-0 rounded-full bg-[conic-gradient(from_200deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)] p-[0.6cqw]">
          <span className="flex size-[14cqw] items-center justify-center overflow-hidden rounded-full border-[0.6cqw] border-black bg-white p-[1.6cqw]">
            <Image src={c.logo} alt="" width={c.w} height={c.h} sizes="80px" className="max-h-full w-auto object-contain" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-[1.6cqw]">
            <span className="truncate text-[3.3cqw] font-semibold">{username}</span>
            <span className="shrink-0 rounded-[1.2cqw] bg-[#0095f6] px-[2.6cqw] py-[0.9cqw] text-[2.3cqw] font-semibold">Follow</span>
            <span className="shrink-0 rounded-[1.2cqw] bg-white/[0.14] px-[2.6cqw] py-[0.9cqw] text-[2.3cqw] font-semibold">Message</span>
          </span>
          <span className="mt-[1.2cqw] block truncate text-[2.7cqw] font-semibold">{c.name}</span>
          <span className="block truncate text-[2.4cqw] text-white/55">{p.category}</span>
          <span className="block truncate text-[2.4cqw] text-[#e0f1ff]">Growth by {site.contact.instagram.handle}</span>
        </span>
      </div>

      {/* Story highlights */}
      <div className="flex gap-[4cqw] px-[5cqw] pt-[3cqw]">
        {HIGHLIGHTS.map((h, i) => (
          <span key={h} className="flex flex-col items-center gap-[0.8cqw]">
            <span
              className="flex size-[8cqw] items-center justify-center rounded-full border-[0.4cqw] border-white/25"
              style={{ background: `radial-gradient(circle at 35% 30%, ${i % 2 ? dark : accent}, #111)` }}
            >
              <span className="size-[2.4cqw] rounded-full bg-white/70" />
            </span>
            <span className="text-[1.9cqw] text-white/80">{h}</span>
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-[2.4cqw] flex justify-center gap-[10cqw] border-t border-white/10 text-[1.8cqw] font-semibold uppercase tracking-[0.12em] text-white/45">
        <span className="-mt-px border-t border-white pt-[1.2cqw] text-white">▦ Posts</span>
        <span className="pt-[1.2cqw]">▶ Reels</span>
        <span className="pt-[1.2cqw]">◫ Tagged</span>
      </div>

      {/* Posts */}
      <div className="mt-[1.6cqw] grid flex-1 grid-cols-4 gap-[0.5cqw]">
        {TILE_LABELS.map((label, i) => (
          <span
            key={label}
            className="relative flex flex-col items-center justify-center overflow-hidden"
            style={{
              background:
                i % 2 === 0
                  ? `linear-gradient(160deg, ${accent} 0%, ${dark} 100%)`
                  : `radial-gradient(120% 90% at 30% 20%, ${dark} 0%, #050505 75%)`,
            }}
          >
            {i === 1 && <span className="absolute right-[1.4cqw] top-[1.2cqw] text-[2.4cqw]">▶</span>}
            {i === 2 && <span className="absolute right-[1.4cqw] top-[1.2cqw] text-[2.2cqw]">❐</span>}
            <span className={`flex items-center justify-center rounded-full bg-white/90 p-[1.2cqw] ${i % 2 === 0 ? "size-[11cqw]" : "size-[8cqw]"}`}>
              <Image src={c.logo} alt="" width={c.w} height={c.h} sizes="60px" className="max-h-full w-auto object-contain" />
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-[1.2cqw] pb-[1cqw] pt-[3cqw] text-center text-[1.9cqw] font-semibold">
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
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
 * a fanned deck of client Instagram profiles with ‹ › controls on the right.
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

  const current = profiles[active];

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

        {/* Fanned deck of client Instagram profiles */}
        <div
          className="relative mx-auto w-full max-w-[520px]"
          onFocus={() => (paused.current = true)}
          onBlur={() => (paused.current = false)}
        >
          <div className="relative mx-auto aspect-[16/11] w-[78%]" aria-live="polite">
            {profiles.map((p, i) => {
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
              const card = (
                <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-[0_30px_70px_-25px_rgb(0_0_0/0.9)]">
                  {p.image ? (
                    <Image src={p.image} alt={`${p.client.name} on Instagram`} fill sizes="(min-width: 1024px) 420px, 80vw" className="object-cover object-top" />
                  ) : (
                    <ProfileCard p={p} />
                  )}
                </div>
              );
              return (
                <div
                  key={p.client.name}
                  aria-hidden={d !== 0}
                  className="absolute inset-0 transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={style}
                >
                  {p.handle && d === 0 ? (
                    <a
                      href={`https://www.instagram.com/${p.handle}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.client.name} on Instagram (@${p.handle})`}
                      className="block h-full w-full"
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous client"
            className="absolute left-0 top-1/2 z-[60] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-electric/60 bg-ink/70 text-ice backdrop-blur transition hover:bg-primary hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next client"
            className="absolute right-0 top-1/2 z-[60] flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-electric/60 bg-ink/70 text-ice backdrop-blur transition hover:bg-primary hover:text-white"
          >
            ›
          </button>

          <p className="relative z-[60] mt-14 flex items-center justify-center gap-2 text-center text-[13px] text-mist">
            <InstagramIcon size={14} />
            <span className="font-semibold text-white">{current.client.name}</span>
            <span className="text-muted">
              {active + 1} / {N}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
