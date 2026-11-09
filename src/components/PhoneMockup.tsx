import Image from "next/image";
import type { ReactNode } from "react";
import { clients, processSteps } from "@/lib/site";
import { GrowthGauge } from "./GrowthGauge";
import { PhoneClock } from "./PhoneClock";

/** Phone frame (dynamic island, status bar). Decorative — hidden from assistive tech. */
export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden="true" className={`rounded-[46px] border-[3px] border-[#2b3142] bg-black p-[7px] shadow-[0_40px_90px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.06)] ${className}`}>
      <div className="relative overflow-hidden rounded-[38px] bg-black text-left">
        <div className="absolute left-1/2 top-2.5 z-10 h-6 w-[84px] -translate-x-1/2 rounded-full bg-[#0b0b0b]" />
        <div className="flex items-center justify-between px-6 pb-1 pt-3.5 text-[11px] font-semibold text-white">
          <PhoneClock />
          <span className="flex items-center gap-1">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="#fff"><rect x="0" y="6" width="3" height="4" rx="0.5" /><rect x="4.3" y="4" width="3" height="6" rx="0.5" /><rect x="8.6" y="2" width="3" height="8" rx="0.5" /><rect x="12.9" y="0" width="3" height="10" rx="0.5" /></svg>
            <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="#fff" opacity=".5" /><rect x="2" y="2" width="15" height="7" rx="1.5" fill="#fff" /><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.75" fill="#fff" opacity=".5" /></svg>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Half-ring gauge used on the phone and in the bento (value 0–1 fills the arc). */
export function Gauge({ value, children, className = "" }: { value: number; children?: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 200 112" className="w-full">
        <defs>
          <linearGradient id="gauge-fill" x1="0" x2="1">
            <stop offset="0" stopColor="#1747ff" />
            <stop offset="1" stopColor="#cfe0ff" />
          </linearGradient>
        </defs>
        <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="20" />
        <path
          d="M18 100 A82 82 0 0 1 182 100"
          fill="none"
          stroke="url(#gauge-fill)"
          strokeWidth="20"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - value * 100}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">{children}</div>
    </div>
  );
}

/** Phone screen for the "Ready to grow" section: the strategy-call booking. */
export function CallScreen() {
  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-3 text-white">
      <div className="flex items-center justify-between">
        <span className="flex size-7 items-center justify-center rounded-full border border-white/20">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        </span>
        <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
          <Image src="/brand/inspire-media-mark-white.svg" alt="" width={291} height={178} className="h-2.5 w-auto" />
        </span>
      </div>
      <div>
        <p className="text-[17px] font-bold">Strategy call</p>
        <p className="text-[10px] text-mist">With Inspire Media</p>
        <p className="mt-2 text-[30px] font-bold leading-none">20 min</p>
        <p className="mt-1.5 text-[10px] leading-snug text-mist">Focused on your brand, your numbers and your next 90 days</p>
      </div>
      <div className="flex flex-col gap-2">
        {["Your name", "Brand / business", "Phone number"].map((f) => (
          <div key={f} className="rounded-xl bg-white/[0.07] px-3 py-2.5 text-[10px] text-mist">
            {f}
          </div>
        ))}
      </div>
      <div className="rounded-full bg-ice py-2 text-center text-[11px] font-bold text-[#0a1020]">Book my strategy call</div>
      <div className="grid grid-cols-3 gap-2">
        {["SEO", "Paid Ads", "Content"].map((t) => (
          <span key={t} className="rounded-lg bg-white/[0.06] py-2 text-center text-[9px] text-mist">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Main phone screen: growth summary built only from IM.pdf facts. */
export function GrowthScreen() {
  const byName = (n: string) => clients.find((c) => c.name.startsWith(n))!;
  const avatars = ["Hotel Naveen", "SVT", "Parge", "SLS"].map(byName);
  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-3 text-white">
      <div className="flex items-center justify-between">
        <span className="flex size-7 items-center justify-center rounded-full border border-white/20">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-6 rounded-[3px] bg-electric" />
          <span className="h-5 w-px bg-white/20" />
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
            <Image src="/brand/inspire-media-mark-white.svg" alt="" width={291} height={178} className="h-2.5 w-auto" />
          </span>
        </span>
      </div>
      <div>
        <p className="text-[17px] font-bold">Growth</p>
        <p className="text-[10px] text-mist">Average ROAS</p>
        <p className="mt-1.5 text-[30px] font-bold leading-none">3x</p>
        <p className="mt-1.5 text-[10px] leading-snug text-mist">Average ROAS growth across brands we’ve scaled</p>
      </div>
      <GrowthGauge />
      <div className="rounded-2xl bg-white/[0.06] p-3">
        <p className="text-[11px] font-semibold">Brands</p>
        <div className="mt-2.5 flex justify-between">
          {avatars.map((c) => (
            <span key={c.name} className="flex w-12 flex-col items-center gap-1">
              <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-white/15">
                <Image src={c.logo} alt="" width={c.w} height={c.h} sizes="48px" className="max-h-7 w-auto max-w-8 object-contain" />
              </span>
              <span className="w-full truncate text-center text-[8px] text-mist">{c.name.split(" ")[0]}</span>
            </span>
          ))}
        </div>
        <div className="mx-auto mt-3 w-fit rounded-full bg-ice px-3 py-1 text-[8.5px] font-semibold text-[#0a1020]">Book a strategy call</div>
      </div>
      <div>
        <p className="text-[11px] font-semibold">Process</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {processSteps.slice(0, 2).map((s, i) => (
            <div key={s.title} className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] px-3 py-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[9px] font-bold">0{i + 1}</span>
              <span className="flex flex-col">
                <span className="text-[10px] font-semibold">{s.title}</span>
                <span className="text-[8px] text-mist">{i === 0 ? "Marketing, competitors, opportunities" : "Roadmap for your goals and budget"}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
