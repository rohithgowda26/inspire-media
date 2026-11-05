"use client";

import { useRef, useState, type ReactNode } from "react";
import { prefillLead } from "@/lib/events";
import { home, services } from "@/lib/site";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { ArrowRightIcon, CloseIcon } from "./ui/icons";
import { ContentTable, RoasGauge, TestBars, VisibilityChart } from "./Widgets";

type Service = (typeof services)[number];
const byId = (id: Service["id"]) => services.find((s) => s.id === id)!;

function CardText({ title, body, onMore }: { title: string; body: string; onMore?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h3 className="text-xl font-semibold tracking-[-0.01em] text-white sm:text-[22px]">{title}</h3>
      <p className="max-w-sm text-[14px] leading-relaxed tracking-[0.01em] text-mist">{body}</p>
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          aria-haspopup="dialog"
          className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-electric transition-colors hover:text-white"
        >
          Learn more <ArrowRightIcon size={13} />
        </button>
      )}
    </div>
  );
}

function Card({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal variant="tilt" delay={delay} className={`card flex flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-1 ${className}`}>
      {children}
    </Reveal>
  );
}

/** "Every rupee tracked…" statement + bento of four widget cards. */
export function Services() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<Service | null>(null);
  const open = (id: Service["id"]) => {
    setCurrent(byId(id));
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const b = home.bento;

  return (
    <section id="services" aria-labelledby="services-title" className="relative px-4 pb-28 pt-10 sm:px-6 lg:pb-36">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-16">
        <Reveal as="h2" id="services-title" className="text-center text-[36px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[56px]">
          <span className="text-silver block"><Hl text={home.statement[0]} /></span>
          <span className="text-silver block"><Hl text={home.statement[1]} /></span>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Row 1 */}
          <Card className="gap-8 p-5 sm:p-8 lg:col-span-7">
            <ContentTable />
            <CardText title={b.content.title} body={b.content.body} onMore={() => open("content")} />
          </Card>
          <Card delay={120} className="gap-8 p-5 sm:p-8 lg:col-span-5">
            <TestBars />
            <CardText title={b.ads.title} body={b.ads.body} onMore={() => open("paid-ads")} />
          </Card>

          {/* Row 2 */}
          <Card className="items-center justify-between gap-8 p-5 sm:p-8 lg:col-span-5">
            <RoasGauge />
            <CardText title={b.roas.title} body={b.roas.body} />
          </Card>
          <Card delay={120} className="gap-8 pt-8 lg:col-span-7">
            <div className="px-5 sm:px-8">
              <CardText title={b.seo.title} body={b.seo.body} onMore={() => open("seo")} />
            </div>
            <div className="-mb-6 ml-5 sm:ml-12">
              <VisibilityChart />
            </div>
          </Card>
        </div>
      </div>

      {/* Service detail — native <dialog>: focus trap, Esc and backdrop handled by the browser */}
      <dialog
        ref={dialogRef}
        aria-labelledby="service-dialog-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="card m-auto w-[min(640px,calc(100%-24px))] p-0 text-white"
      >
        {current && (
          <div className="flex flex-col gap-5 p-6 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-electric">{current.subtitle}</p>
                <h3 id="service-dialog-title" className="mt-1 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                  {current.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.07] transition-colors hover:bg-white/[0.14]"
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <p className="text-lg font-semibold">{current.punch}</p>
            <p className="text-[15px] leading-relaxed text-mist">{current.body}</p>
            <ul className="flex flex-wrap gap-2" aria-label={`${current.title} capabilities`}>
              {current.tags.map((t) => (
                <li key={t} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[12px] text-mist">
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  close();
                  prefillLead({ service: current.formValue });
                }}
                className="btn btn-white"
              >
                Discuss {current.title} for my brand
              </button>
              <button type="button" onClick={close} className="btn btn-dark">
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
