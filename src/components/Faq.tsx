import { faq, site, whatsappUrl } from "@/lib/site";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { ChatIcon, PhoneIcon, PlusIcon } from "./ui/icons";

/** Frequently asked questions: accordion (native <details>) + FAQPage structured data for Google. */
export function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const phone = site.contact.primaryPhone;

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-[1232px] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-16">
        <Reveal className="flex flex-col items-start gap-5 lg:sticky lg:top-28 lg:self-start">
          <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-electric">
            <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
            {faq.eyebrow}
          </p>
          <h2 id="faq-title" className="text-silver text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[56px]">
            <Hl text={faq.title} />
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-mist">{faq.body}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-blue !h-11 gap-2 !px-5">
              <ChatIcon size={16} /> WhatsApp us
            </a>
            <a href={`tel:${phone.tel}`} className="btn btn-dark !h-11 gap-2 !px-5">
              <PhoneIcon size={15} /> {phone.display}
            </a>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3">
          {faq.items.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details name="faq" className="group rounded-[20px] border border-white/[0.07] bg-white/[0.025] transition-colors open:border-electric/30 open:bg-[#0e1426] hover:border-white/15">
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-mono text-[12px] text-electric">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 text-[16px] font-semibold tracking-[-0.01em] text-white sm:text-[17px]">{f.q}</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white transition-transform duration-300 group-open:rotate-45 group-open:bg-primary">
                    <PlusIcon size={14} />
                  </span>
                </summary>
                <p className="px-5 pb-6 pl-[3.25rem] text-[15px] leading-relaxed text-mist sm:px-6 sm:pl-[3.6rem]">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        // Static, trusted content from site.ts — safe to serialise.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
