import Link from "next/link";
import type { Metadata } from "next";
import { FlaskConical, ArrowRight } from "lucide-react";
import { listLabs } from "@/lib/content/queries";
import { PageHeader } from "@/components/academy/cards";
import { TierBadge } from "@/components/ui/badges";

export const metadata: Metadata = { title: "Interactive labs", description: "Manipulate AI concepts directly: neurons, gradient descent, clustering, tokenization, attention and more." };

export default async function LabsPage() {
  const labs = await listLabs();
  return (
    <>
      <PageHeader eyebrow="Interactive labs" title="Don't just read about it. Experiment." description="Each lab has a clear goal, useful defaults, a reset button, a guided challenge and a written explanation that works without interaction." />
      <div className="container-page grid gap-4 py-10 md:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => (
          <Link key={lab.id} href={`/labs/${lab.slug}`} className="card group flex flex-col p-5 hover:border-brand-300 hover:shadow">
            <span className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><FlaskConical aria-hidden className="h-5 w-5" /></span>
              <TierBadge tier={lab.accessTier} />
            </span>
            <span className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{lab.title}</span>
            <span className="text-xs font-medium text-slate-500">{lab.concept}</span>
            <span className="mt-2 flex-1 text-sm text-slate-600">{lab.description}</span>
            <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-700">Open lab <ArrowRight aria-hidden className="h-4 w-4" /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
