import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { FloatingContact } from "@/components/FloatingContact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hl } from "@/components/ui/Hl";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { political, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: political.metaTitle,
  description: political.metaDescription,
  alternates: { canonical: "/political-campaigns" },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Political campaigns landing page. All copy lives in src/lib/site.ts → political. */
export default function PoliticalCampaignsPage() {
  return (
    <>
      <Header />
      <main id="main">
        {/* Hero */}
        <section aria-labelledby="pc-title" className="relative isolate overflow-x-clip px-4 pb-20 pt-40 sm:px-6 lg:pb-28 lg:pt-52">
          <div aria-hidden="true" className="absolute left-1/2 top-24 -z-10 h-[520px] w-[min(1100px,130vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.18),transparent)]" />
          <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-electric">
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
              {political.eyebrow}
              <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-electric" />
            </p>
            <h1 id="pc-title" className="text-[44px] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-[72px] lg:text-[88px]">
              <Hl text={political.title} />
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-mist sm:text-[17px]">{political.body}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <a href="#contact" className="btn btn-blue !h-12 !px-6 !text-[15px]">
                {political.cta} <ArrowRightIcon size={15} />
              </a>
              <a href={whatsappUrl("Hi Inspire Media, I'd like to discuss a political campaign.")} target="_blank" rel="noopener noreferrer" className="btn btn-dark !h-12 !px-6 !text-[15px]">
                WhatsApp us
              </a>
            </div>
          </Reveal>
        </section>

        {/* What we do (placeholder sections) */}
        <section aria-label="What we do" className="px-4 pb-24 sm:px-6 lg:pb-32">
          <ul className="mx-auto grid max-w-[1180px] gap-5 sm:grid-cols-2">
            {political.sections.map((s, i) => (
              <Reveal as="li" key={s.title} delay={(i % 2) * 100} className="card flex flex-col gap-4 p-7 sm:p-9">
                <span className="font-mono text-[12px] tracking-[0.14em] text-electric">{pad(i + 1)}</span>
                <h2 className="text-[26px] font-medium tracking-[-0.03em] text-white sm:text-[32px]">{s.title}</h2>
                <p className="text-[15px] leading-relaxed text-mist">{s.body}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <Contact />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}
