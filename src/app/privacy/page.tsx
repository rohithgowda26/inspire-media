import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles the information you share through this website.`,
  alternates: { canonical: "/privacy" },
};

// NOTE: A plain-language starting point. Please have it reviewed before launch.
export default function PrivacyPage() {
  const { contact } = site;
  return (
    <>
      <Header />
      <main id="main" className="px-4 pb-24 pt-36 sm:px-6 lg:px-10 lg:pt-44">
        <article className="mx-auto flex max-w-3xl flex-col gap-6 text-base leading-relaxed text-mist [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-white">
          <p className="text-[13px] font-semibold text-electric">Legal</p>
          <h1 className="text-silver text-5xl font-semibold tracking-[-0.035em] sm:text-6xl">Privacy policy</h1>

          <p>
            This page explains what information {site.name} collects through this website and how it is used.
          </p>

          <h2>What we collect</h2>
          <p>
            When you submit a form on this site we receive the details you enter — such as your name, brand, phone number,
            email address, city, the service you’re interested in, budget range and any message. We don’t ask for
            sensitive personal information.
          </p>

          <h2>How we use it</h2>
          <p>
            We use your details only to respond to your enquiry and arrange a strategy call. We don’t sell or rent your
            information. Form submissions are delivered to our inbox through an email delivery service.
          </p>

          <h2>Cookies and local storage</h2>
          <p>
            The site stores a small note in your browser so the strategy-call popup isn’t shown again after you close it
            or submit your details. It isn’t used to identify you.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask us to update or delete the information you’ve shared by emailing{" "}
            <a href={`mailto:${contact.email}`} className="text-electric hover:text-white">
              {contact.email}
            </a>{" "}
            or calling{" "}
            <a href={`tel:${contact.primaryPhone.tel}`} className="text-electric hover:text-white">
              {contact.primaryPhone.display}
            </a>
            .
          </p>

          <h2>Contact</h2>
          <p>
            {site.name}, {contact.address.line1}, {contact.address.city} – {contact.address.postalCode}.
          </p>

          <Link href="/" className="btn btn-dark mt-6 self-start">
            ← Back to home
          </Link>
        </article>
      </main>
      <Footer />
    </>
  );
}
