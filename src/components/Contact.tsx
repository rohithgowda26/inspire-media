import { home, site, whatsappUrl } from "@/lib/site";
import { LeadForm } from "./LeadForm";
import { Reveal } from "./ui/Reveal";
import { Hl } from "./ui/Hl";
import { ChatIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon } from "./ui/icons";

/** Strategy-call form and every contact route from IM.pdf, in the navy section. */
export function Contact() {
  const { contact } = site;
  const routes = [
    {
      label: "Call",
      icon: PhoneIcon,
      content: (
        <span className="flex flex-col">
          {contact.phones.map((p) => (
            <a key={p.tel} href={`tel:${p.tel}`} className="hover:text-ice">
              {p.display}
            </a>
          ))}
        </span>
      ),
    },
    {
      label: "WhatsApp",
      icon: ChatIcon,
      content: (
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-ice">
          {contact.primaryPhone.display}
        </a>
      ),
    },
    {
      label: "Email",
      icon: MailIcon,
      content: (
        <a href={`mailto:${contact.email}`} className="break-all hover:text-ice">
          {contact.email}
        </a>
      ),
    },
    {
      label: "Instagram",
      icon: InstagramIcon,
      content: (
        <a href={contact.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-ice">
          {contact.instagram.handle}
        </a>
      ),
    },
    {
      label: "Office",
      icon: PinIcon,
      content: (
        <address className="not-italic">
          {contact.address.line1}, {contact.address.city} – {contact.address.postalCode}
        </address>
      ),
    },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-navy px-4 pb-24 sm:px-6">
      <Reveal variant="tilt" className="card mx-auto grid max-w-[1080px] gap-10 !bg-[linear-gradient(180deg,#111a33,#0c1428)] p-6 sm:p-10 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <h2 id="contact-title" className="text-silver text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[44px]">
            <Hl text={home.contact.title} />
          </h2>
          <p className="text-[15px] leading-relaxed tracking-[0.01em] text-mist">{home.contact.body}</p>
          <ul className="flex flex-col divide-y divide-white/[0.06]">
            {routes.map(({ label, icon: Icon, content }) => (
              <li key={label} className="flex items-start gap-3.5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-ice">
                  <Icon size={16} />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[12px] text-muted">{label}</span>
                  <span className="text-[15px] leading-relaxed">{content}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <LeadForm source="contact" />
        </div>
      </Reveal>
    </section>
  );
}
