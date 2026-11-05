"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { clients, home } from "@/lib/site";
import { GrowthScreen, PhoneFrame } from "./PhoneMockup";
import { QuickCapture } from "./QuickCapture";

/** Logos for the "Trusted by" row (shown monochrome, colour on hover). */
const trusted = [0, 2, 3, 4, 7, 8, 10, 11].map((i) => clients[i]);

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Scroll-driven hero (reference behaviour):
 * the headline is pinned while the phone in front of it scrolls up and out under the nav;
 * then the headline rises and the intro, phone-number box and client logos fade in.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const restRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStaticMode(true);
      return;
    }
    const section = sectionRef.current!;
    let frame = 0;

    const update = () => {
      const vh = window.innerHeight;
      const range = section.offsetHeight - vh; // scroll distance while pinned
      const p = clamp(-section.getBoundingClientRect().top / range);
      const pA = clamp(p / 0.55); // phone travels up and out
      const pB = clamp((p - 0.5) / 0.35); // headline rises, intro fades in
      const pC = clamp((p - 0.7) / 0.3); // logos fade in

      const phone = phoneRef.current!;
      const navBottom = window.innerWidth < 640 ? 64 : 72;
      const start = navBottom + 8;
      const end = -(phone.offsetHeight + 40);
      phone.style.transform = `translate3d(-50%, ${start + (end - start) * easeInOut(pA)}px, 0)`;

      const titleH = titleRef.current!.offsetHeight;
      const center = vh * (0.5 - 0.2 * easeOut(pB));
      blockRef.current!.style.transform = `translate3d(0, ${center - titleH / 2}px, 0)`;

      const rest = restRef.current!;
      rest.style.opacity = String(pB);
      rest.style.transform = `translate3d(0, ${(1 - pB) * 28}px, 0)`;
      rest.style.visibility = pB > 0.02 ? "visible" : "hidden";

      const logos = logosRef.current!;
      logos.style.opacity = String(pC);
      logos.style.transform = `translate3d(0, ${(1 - pC) * 30}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const title = (
    <h1 ref={titleRef} className="text-hero text-[64px] font-semibold leading-[1] tracking-[-0.045em] sm:text-[120px] lg:text-[164px]">
      {home.hero.title}
    </h1>
  );
  const rest = (
    <>
      <p className="mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-mist sm:text-base">{home.hero.body}</p>
      <div className="mt-8">
        <QuickCapture />
      </div>
    </>
  );
  const logos = (
    <div className="mx-auto w-full max-w-6xl px-4 text-center">
      <ul className="grid grid-cols-4 items-center gap-x-6 gap-y-6 sm:grid-cols-8" aria-label="Clients">
        {trusted.map((c) => (
          <li key={c.name} className="flex justify-center">
            <Image
              src={c.logo}
              alt={c.name}
              width={c.w}
              height={c.h}
              sizes="80px"
              className="h-9 w-auto max-w-[72px] object-contain opacity-45 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[13px] text-muted">{home.hero.trusted}</p>
    </div>
  );
  const glow = (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-[18%] -z-10 h-[520px] w-[min(1100px,120vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.16),transparent)]"
    />
  );

  // Reduced motion: a plain, static hero (no pinning, no phone travel)
  if (staticMode) {
    return (
      <section id="top" aria-label="Introduction" className="relative isolate overflow-hidden px-4 pb-20 pt-36 text-center sm:px-6 sm:pt-44">
        {glow}
        {title}
        {rest}
        <div className="mt-16">{logos}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="top" aria-label="Introduction" className="relative h-[230svh]">
      <div className="sticky top-0 isolate h-[100svh] overflow-hidden">
        {glow}

        {/* Headline (pinned) + intro that fades in below it */}
        <div ref={blockRef} className="absolute inset-x-0 top-0 px-4 text-center will-change-transform sm:px-6" style={{ transform: "translate3d(0, 38svh, 0)" }}>
          {title}
          <div ref={restRef} style={{ opacity: 0, visibility: "hidden" }}>
            {rest}
          </div>
        </div>

        {/* Phone in front of the headline; scrolls up and out under the nav */}
        <div
          ref={phoneRef}
          className="pointer-events-none absolute left-1/2 top-0 z-10 w-[min(220px,calc((100svh_-_110px)/2.1))] will-change-transform sm:w-[min(270px,calc((100svh_-_110px)/2.1))] lg:w-[min(300px,calc((100svh_-_110px)/2.1))]"
          style={{ transform: "translate3d(-50%, 80px, 0)" }}
        >
          {/* Normal smartphone proportions (about 9 : 19), never taller than the screen */}
          <PhoneFrame className="flex aspect-[9/19] flex-col [&>div]:flex-1">
            <GrowthScreen />
          </PhoneFrame>
        </div>

        <div ref={logosRef} className="absolute inset-x-0 bottom-[7svh]" style={{ opacity: 0 }}>
          {logos}
        </div>
      </div>
    </section>
  );
}
