import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/academy/cards";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPremium } from "@/lib/permissions";

export const metadata: Metadata = { title: "Free & Premium", description: "Meaningful free education, with Premium for depth, advanced practice and structured career preparation." };

const FREE = [
  "Foundational learning paths",
  "Foundational lessons and knowledge checks",
  "Most interactive labs",
  "Selected project guides",
  "Student dashboard, bookmarks and progress tracking",
];
const PREMIUM = [
  "Everything in Free",
  "Advanced lessons in GenAI, RAG and transformers",
  "Premium interactive labs",
  "Advanced projects with submission review",
  "Advanced assessments",
  "Structured career preparation (coming soon)",
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  const premium = await hasPremium(user);
  return (
    <>
      <PageHeader eyebrow="Free & Premium" title="Learn for free. Go deeper with Premium." description="The free tier is designed to help you make real progress, not to tease you. Premium adds depth, advanced practice and feedback." />
      <div className="container-page grid max-w-4xl gap-6 py-12 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-bold">Free</h2>
          <p className="mt-1 text-3xl font-bold">€0</p>
          <ul className="mt-5 space-y-2">{FREE.map((f) => <li key={f} className="flex gap-2 text-sm"><Check aria-hidden className="h-4 w-4 shrink-0 text-emerald-600" />{f}</li>)}</ul>
          <Link href={user ? "/dashboard" : "/signup"} className="btn-secondary mt-6 w-full">{user ? "Go to your dashboard" : "Create a free account"}</Link>
        </div>
        <div className="card border-2 border-violet-300 p-6">
          <h2 className="text-xl font-bold">Premium</h2>
          <p className="mt-1 text-sm text-slate-600">Pricing is being validated with a small pilot group before launch.</p>
          <ul className="mt-5 space-y-2">{PREMIUM.map((f) => <li key={f} className="flex gap-2 text-sm"><Check aria-hidden className="h-4 w-4 shrink-0 text-violet-600" />{f}</li>)}</ul>
          {premium ? (
            <p className="mt-6 rounded-lg bg-violet-50 p-3 text-center text-sm font-medium text-violet-900">You have Premium access.</p>
          ) : (
            <Link href="/contact?topic=premium-waitlist" className="btn-primary mt-6 w-full">Join the Premium pilot waitlist</Link>
          )}
        </div>
      </div>
      <div className="container-page max-w-3xl pb-8 text-sm text-slate-600">
        <h2 className="text-lg font-semibold text-slate-900">Our commitments</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Introductory explanations stay free. Locked content is clearly labelled before you start it.</li>
          <li>Your progress and learning history are never deleted if a subscription ends.</li>
          <li>Renewal, cancellation and refund terms will be stated clearly before you pay. No fake countdowns.</li>
          <li>Premium access is verified on our servers on every request.</li>
        </ul>
      </div>
    </>
  );
}
