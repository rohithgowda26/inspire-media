import { home, site } from "@/lib/site";
import { CountUp } from "./ui/CountUp";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";

/** Reference stats layout: sticky statement left, gradient numbers right. */
export function About() {
  const a = home.about;
  return (
    <section id="about" aria-labelledby="about-title" className="px-4 py-28 sm:px-6 lg:py-40">
      <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-2 lg:gap-12">
        <Reveal className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
          <h2 id="about-title" className="text-silver text-[44px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[68px]">
            <Hl text={a.title} />
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed tracking-[0.01em] text-mist">
            <strong className="font-semibold text-white">{site.name}</strong> {a.body}
          </p>
        </Reveal>

        <ul className="flex flex-col gap-14 lg:gap-20 lg:pt-4">
          {a.stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 80} className={`flex flex-col gap-4 ${i === 1 ? "lg:pl-10" : ""}`}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="order-2 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[28px]">{s.label}</h3>
                <p className="text-stat order-1 text-[64px] font-semibold leading-none tracking-[-0.04em] sm:text-[84px]">
                  <CountUp to={s.value} />
                  {s.unit}
                </p>
              </div>
              <p className="max-w-md text-[15px] leading-relaxed tracking-[0.01em] text-mist">{s.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
