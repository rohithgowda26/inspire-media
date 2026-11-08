import { handleContact } from "@/lib/contact-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// All secrets are read here, on the server only. Nothing below is ever sent to the browser.
export async function POST(request: Request) {
  return handleContact(request, {
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY,
  });
}
