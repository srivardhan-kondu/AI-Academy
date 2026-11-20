import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, desc, eq } from "drizzle-orm";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { projectSubmissions } from "@/lib/db/schema";
import { getProject } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccess } from "@/lib/permissions";
import { submitProject } from "@/app/actions/learning";
import { PageHeader } from "@/components/academy/cards";
import { DifficultyBadge, TierBadge } from "@/components/ui/badges";
import { Markdown } from "@/components/ui/markdown";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const p = await getProject((await params).slug);
  return p ? { title: p.title, description: p.description } : {};
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const user = await getCurrentUser();
  const allowed = await canAccess(user, project.accessTier);
  const submissions = user
    ? (await db.select().from(projectSubmissions).where(and(eq(projectSubmissions.userId, user.id), eq(projectSubmissions.projectId, project.id))).orderBy(desc(projectSubmissions.submittedAt)))
    : [];

  return (
    <>
      <PageHeader eyebrow={`Project · about ${project.estimatedHours} hours`} title={project.title} description={project.description}>
        <div className="flex gap-2"><DifficultyBadge level={project.difficulty} /><TierBadge tier={project.accessTier} /></div>
      </PageHeader>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {allowed ? (
            <Markdown>{project.instructions}</Markdown>
          ) : (
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-8 text-center">
              <h2 className="text-xl font-bold">Premium project</h2>
              <p className="mt-2 text-slate-700">The step-by-step guide and submission review for this project are part of Premium.</p>
              <Link href="/pricing" className="btn-primary mt-4">See Premium details</Link>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold">Prerequisites</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{project.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Expected outcomes</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {project.expectedOutcomes.map((o) => <li key={o} className="flex gap-2"><CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{o}</li>)}
            </ul>
            {project.sourceUrl && (
              <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">Starter resources <ExternalLink aria-hidden className="h-3.5 w-3.5" /></a>
            )}
          </div>
          {allowed && (
            <div className="card p-5">
              <h2 className="font-semibold">Submit your project</h2>
              {user ? (
                <ActionForm action={submitProject} className="mt-3 space-y-3">
                  <input type="hidden" name="projectId" value={project.id} />
                  <div>
                    <label htmlFor="submissionUrl" className="label">Link to your work</label>
                    <input id="submissionUrl" name="submissionUrl" type="url" required placeholder="https://github.com/you/project" className="input" />
                  </div>
                  <div>
                    <label htmlFor="notes" className="label">Notes for the reviewer (optional)</label>
                    <textarea id="notes" name="notes" maxLength={2000} className="input min-h-20" />
                  </div>
                  <SubmitButton pendingText="Submitting…">Submit</SubmitButton>
                </ActionForm>
              ) : (
                <p className="mt-2 text-sm text-slate-700"><Link href={`/login?next=/projects/${project.slug}`} className="font-semibold text-brand-700 underline">Sign in</Link> to submit your work for feedback.</p>
              )}
              {submissions.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  {submissions.map((s) => (
                    <li key={s.id}>
                      <div className="flex items-center justify-between gap-2"><span className="truncate">{formatDate(s.submittedAt)}</span><span className="badge bg-slate-100 capitalize text-slate-700 ring-1 ring-slate-200">{s.status.replace("_", " ")}</span></div>
                      {s.feedback && <p className="mt-1 rounded bg-slate-50 p-2 text-slate-700">{s.feedback}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
