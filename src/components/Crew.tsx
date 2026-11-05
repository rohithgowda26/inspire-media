import Image from "next/image";
import { crew } from "@/lib/site";
import { Reveal } from "./ui/Reveal";

type Member = (typeof crew.members)[number];

const pad = (n: number) => String(n).padStart(2, "0");

function altText(m: Member, founder: boolean) {
  if (m.name) return `${m.name}${m.role ? `, ${m.role}` : ""}, Inspire Media`;
  return founder ? "Inspire Media founder & CEO" : "Inspire Media crew member";
}

/** Photo with the name and designation directly under it. */
function PhotoWithName({ m, founder, sizes }: { m: Member; founder: boolean; sizes: string }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="mask-reveal relative aspect-[4/5] overflow-hidden rounded-[22px] border border-white/[0.09] bg-panel shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)]">
        <Image
          src={m.photo}
          alt={altText(m, founder)}
          fill
          sizes={sizes}
          className="object-cover object-center grayscale-[35%] transition-[filter,scale] duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0 [@media(hover:none)]:grayscale-0"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(165deg,rgb(23_71_255/0.25)_0%,transparent_45%)] mix-blend-soft-light transition-opacity duration-700 group-hover:opacity-0" />
      </div>
      <figcaption className="px-1">
        <span className={`block font-semibold leading-tight tracking-[-0.02em] ${founder ? "text-[22px] sm:text-[26px]" : "text-[15px] sm:text-[17px]"} ${m.name ? "text-white" : "italic text-white/50"}`}>
          {m.name || "Name to be added"}
        </span>
        {m.role && (
          <span className="mt-1.5 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-electric sm:text-[10.5px]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-electric shadow-[0_0_10px_#287bff]" />
            {m.role}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

function QuoteMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 26" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M0 26V15.6C0 6.9 4.4 1.7 13.1 0l1.6 3.6C10 5 7.6 7.8 7.3 12H14v14H0zm19.3 0V15.6C19.3 6.9 23.7 1.7 32.4 0L34 3.6c-4.7 1.4-7.1 4.2-7.4 8.4h6.7v14h-14z" />
    </svg>
  );
}

/**
 * "Meet our crew": every person shown with their photo, name and designation under it,
 * and their own statement beside it. The founder leads in a larger feature row.
 */
export function Crew() {
  const [founder, ...team] = crew.members;

  return (
    <section id="crew" aria-labelledby="crew-title" className="relative isolate overflow-x-clip px-4 py-24 sm:px-6 lg:py-32">
      <div aria-hidden="true" className="absolute left-[-10%] top-[22%] -z-10 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.13),transparent)]" />
      <div aria-hidden="true" className="absolute bottom-[8%] right-[-8%] -z-10 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(40_123_255/0.10),transparent)]" />

      <div className="mx-auto max-w-[1180px]">
        {/* Heading */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <Reveal className="flex flex-col gap-5 lg:col-span-7">
            <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-electric">
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
              {crew.eyebrow}
            </p>
            <h2 id="crew-title" className="text-[40px] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[64px] lg:text-[72px]">
              {crew.titleStart}
              <span className="mt-2 block"><mark className="hl">{crew.titleAccent}</mark></span>
            </h2>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-5 lg:pb-4">
            <p className="max-w-md text-[15px] leading-relaxed text-mist sm:text-base">{crew.body}</p>
          </Reveal>
        </div>

        {/* Founder — photo with name & designation under it, statement beside it */}
        <Reveal className="group mt-14 grid items-center gap-8 sm:mt-20 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <PhotoWithName m={founder} founder sizes="(min-width: 640px) 440px, 100vw" />
          <div className="relative">
            <span aria-hidden="true" className="pointer-events-none absolute -top-16 right-0 select-none font-display text-[150px] leading-none text-transparent [-webkit-text-stroke:1px_rgb(207_224_255/0.14)] lg:-top-24 lg:text-[220px]">
              01
            </span>
            <QuoteMark className="relative mb-6 w-11 text-electric" />
            <blockquote className="relative text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[34px] lg:text-[46px]">
              {founder.statement}
            </blockquote>
            <p className="relative mt-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              <span aria-hidden="true" className="h-px w-10 bg-electric" />
              {[founder.name, founder.role].filter(Boolean).join(" · ")}
            </p>
          </div>
        </Reveal>

        {/* Team — each block: photo (name & designation under it) + their statement beside it */}
        <ul className="mt-20 grid gap-5 md:grid-cols-2 lg:mt-28 lg:gap-6">
          {team.map((m, k) => (
            <Reveal
              as="li"
              key={m.photo}
              delay={(k % 2) * 120}
              className={`group grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-4 rounded-[28px] border border-white/[0.07] bg-[linear-gradient(160deg,#0f1628_0%,#090d18_100%)] p-3.5 transition-colors hover:border-electric/35 sm:gap-6 sm:p-5 ${
                k % 2 === 1 ? "md:translate-y-14" : ""
              } ${k === team.length - 1 && team.length % 2 === 1 ? "md:col-span-2 md:mx-auto md:w-[calc(50%-10px)] md:translate-y-14" : ""}`}
            >
              <PhotoWithName m={m} founder={false} sizes="(min-width: 768px) 240px, 45vw" />
              <div className="flex h-full flex-col justify-center gap-4 pr-1 sm:pr-2">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted">{pad(k + 2)}</span>
                <QuoteMark className="w-7 text-electric" />
                <blockquote className="text-[15px] font-medium leading-snug tracking-[-0.01em] text-ice sm:text-[19px] lg:text-[21px]">
                  {m.statement}
                </blockquote>
                <span aria-hidden="true" className="block h-px w-8 bg-electric transition-[width] duration-500 group-hover:w-16" />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
