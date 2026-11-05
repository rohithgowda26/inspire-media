import Image from "next/image";
import { home, processSteps } from "@/lib/site";
import { GrowthScreen, PhoneFrame } from "./PhoneMockup";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";

function IconTile({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`absolute flex size-20 items-center justify-center rounded-[22px] bg-white text-[#0a1020] shadow-[0_20px_40px_-12px_rgb(0_0_0/0.6)] ${className}`}>
      {children}
    </span>
  );
}

/** Reference lower section (light there, deep navy here): bento + process cards. */
export function Partner() {
  return (
    <section id="process" aria-labelledby="partner-title" className="relative bg-navy px-4 pb-24 pt-[340px] sm:px-6 sm:pt-[300px]">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-14">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <h2 id="partner-title" className="text-silver max-w-3xl text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[60px]">
            <Hl text={home.partner.title} />
          </h2>
          <p className="max-w-lg text-[15px] leading-relaxed tracking-[0.01em] text-mist">{home.partner.body}</p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-4">
          {/* Full funnel: tilted service tiles */}
          <Reveal variant="tilt" className="card flex min-h-[340px] flex-col justify-between overflow-hidden !bg-[#0d1730] p-6">
            <div aria-hidden="true" className="relative h-44">
              <IconTile className="left-2 top-4 -rotate-12">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1747ff" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></svg>
              </IconTile>
              <IconTile className="left-20 top-0 rotate-6 !bg-primary !text-white">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l14-6v14L3 13z" /><path d="M7 13v5" /></svg>
              </IconTile>
              <IconTile className="left-12 top-20 rotate-12">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#1747ff"><path d="M8 5v14l11-7z" /></svg>
              </IconTile>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold tracking-[-0.01em]">Full-funnel thinking</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-mist">SEO, ads and content, planned and measured together.</p>
            </div>
          </Reveal>

          {/* Glowing brand card */}
          <Reveal variant="tilt" delay={100} className="card relative flex min-h-[340px] items-center justify-center overflow-hidden !border-white/10 md:col-span-2">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_90%_at_50%_50%,#1747ff_0%,#0b1640_45%,#04060d_100%)]" />
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[520px] -translate-x-[78%] -translate-y-1/2 rounded-full border border-white/40" />
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[520px] -translate-x-[22%] -translate-y-1/2 rounded-full border border-white/40" />
            <div className="relative flex flex-col items-center gap-5 px-6 text-center">
              <span className="flex size-28 items-center justify-center rounded-[30px] bg-white/10 ring-1 ring-white/25 backdrop-blur-md">
                <Image src="/brand/inspire-media-mark-white.svg" alt="" width={291} height={178} className="w-16" />
              </span>
              <p className="text-lg font-semibold">
                We don’t just market your brand. <span className="text-ice">We grow it.</span>
              </p>
            </div>
          </Reveal>

          {/* Reporting: phone peeking in */}
          <Reveal variant="tilt" delay={200} className="card flex min-h-[340px] flex-col justify-between overflow-hidden !bg-[#0d1730] pt-6">
            <div className="px-6 text-center">
              <h3 className="text-xl font-semibold tracking-[-0.01em]">Transparent reporting</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-mist">Data-driven and easy to read — every rupee accountable.</p>
            </div>
            <div className="relative mx-auto mt-6 h-48 w-[210px] overflow-hidden">
              <PhoneFrame>
                <GrowthScreen />
              </PhoneFrame>
            </div>
          </Reveal>
        </div>

        {/* Process: four small cards (reference feature cards) */}
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Our process">
          {processSteps.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i * 90}
              className="group flex flex-col items-center gap-2 rounded-[22px] bg-white/[0.04] px-5 py-7 text-center ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.07]"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-[13px] font-bold text-electric transition-colors group-hover:bg-primary group-hover:text-white">
                {i + 1}
              </span>
              <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">{s.title}</h3>
              <p className="text-[14px] leading-relaxed tracking-[0.01em] text-mist">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
