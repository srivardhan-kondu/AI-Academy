import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLab } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccess } from "@/lib/permissions";
import { isLabKey } from "@/lib/lesson/labs";
import { PageHeader } from "@/components/academy/cards";
import { VisualizationBlock } from "@/components/lesson/blocks/visualization";

export async function generateMetadata({ params }: PageProps<"/labs/[slug]">): Promise<Metadata> {
  const data = await getLab((await params).slug);
  return data ? { title: data.lab.title, description: data.lab.description } : {};
}

export default async function LabPage({ params }: PageProps<"/labs/[slug]">) {
  const data = await getLab((await params).slug);
  if (!data || !isLabKey(data.lab.componentKey)) notFound();
  const user = await getCurrentUser();
  const { lab, usedIn, lessonBlock } = data;
  const componentKey = data.lab.componentKey;
  const allowed = await canAccess(user, lab.accessTier);

  return (
    <>
      <PageHeader eyebrow={`Interactive lab · ${lab.concept}`} title={lab.title} description={lab.description} />
      <div className="container-page max-w-4xl space-y-8 py-10">
        {allowed ? (
          <VisualizationBlock
            content={{
              component: componentKey,
              objective: lessonBlock?.objective ?? lab.description,
              instructions: lessonBlock?.instructions ?? "Change the controls and watch how the result responds.",
              fallback: lessonBlock?.fallback ?? lab.description,
              config: lessonBlock?.config,
            }}
          />
        ) : (
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-8 text-center">
            <h2 className="text-xl font-bold">Premium lab</h2>
            <p className="mt-2 text-slate-700">This lab is part of Premium. Many labs remain free.</p>
            <Link href="/pricing" className="btn-primary mt-4">See Premium details</Link>
          </div>
        )}
        {usedIn.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Learn the concept behind this lab</h2>
            <ul className="mt-2 space-y-1">
              {usedIn.map((l) => (
                <li key={l.slug}><Link href={`/academy/lessons/${l.slug}`} className="font-medium text-brand-700 underline underline-offset-2">{l.title}</Link></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
