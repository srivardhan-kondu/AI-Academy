import type { Metadata } from "next";
import { PageHeader } from "@/components/academy/cards";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { sendContact } from "@/app/actions/contact";

export const metadata: Metadata = { title: "Contact", description: "Send feedback, report a content error or ask about workshops." };

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const topic = (await searchParams).topic;
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" description="Report a content error, share feedback, or ask about workshops and institutional training." />
      <div className="container-page max-w-xl py-10">
        <ActionForm action={sendContact} className="card space-y-4 p-6">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" name="name" required maxLength={100} className="input" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="topic" className="label">Topic</label>
            <select id="topic" name="topic" className="input" defaultValue={typeof topic === "string" ? topic : "general"}>
              <option value="general">General question</option>
              <option value="feedback">Feedback</option>
              <option value="content-error">Report a content error</option>
              <option value="workshops">Workshops & institutions</option>
              <option value="premium-waitlist">Premium waitlist</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="label">Message</label>
            <textarea id="message" name="message" required minLength={10} maxLength={5000} className="input min-h-32" />
          </div>
          <div className="hidden" aria-hidden>
            <label htmlFor="website">Leave this empty</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <SubmitButton pendingText="Sending…">Send message</SubmitButton>
        </ActionForm>
        <p className="mt-4 text-xs text-slate-500">We only use your email to reply to this message.</p>
      </div>
    </>
  );
}
