import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Trophy, Users, CheckCircle2 } from "lucide-react";
import { getPath } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getProgressMap, isEnrolled, pathProgress } from "@/lib/progress";
import { enrollInPath } from "@/app/actions/learning";
import { LessonCard, PageHeader } from "@/components/academy/cards";
import { DifficultyBadge, TierBadge, ProgressBar } from "@/components/ui/badges";
import { formatMinutes } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/form";

export async function generateMetadata({ params }: PageProps<"/academy/paths/[slug]">): Promise<Metadata> {
  const data = await getPath((await params).slug);
  return data ? { title: data.path.title, description: data.path.description } : {};
}

export default async function PathPage({ params }: PageProps<"/academy/paths/[slug]">) {
  const data = await getPath((await params).slug);
  if (!data) notFound();
  const { path, modules } = data;
  const user = await getCurrentUser();
  const enrolled = user ? await isEnrolled(user.id, path.id) : false;
  const prog = user ? await pathProgress(user.id, path.id) : null;
  const progress = user ? await getProgressMap(user.id) : new Map();

  return (
    <>
      <PageHeader eyebrow="Learning path" title={path.title} description={path.description}>
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={path.difficulty} />
          <span className="badge bg-slate-100 text-slate-700 ring-1 ring-slate-200">Estimated effort: {formatMinutes(path.estimatedMinutes)}</span>
          <TierBadge tier={path.accessTier} />
        </div>
        <div className="mt-5">
          {!user ? (
            <Link href={`/signup?next=/academy/paths/${path.slug}`} className="btn-primary">Sign up free to enrol</Link>
          ) : enrolled ? (
            <div className="max-w-md space-y-2">
              <p className="flex items-center gap-2 font-medium text-emerald-700"><CheckCircle2 aria-hidden className="h-4 w-4" /> You&apos;re enrolled: {prog?.completed}/{prog?.total} lessons done</p>
              <ProgressBar percent={prog?.percent ?? 0} label="Path progress" />
              {prog?.nextLesson && <Link href={`/academy/lessons/${prog.nextLesson.slug}`} className="btn-primary mt-2">Continue: {prog.nextLesson.title}</Link>}
            </div>
          ) : (
            <form action={enrollInPath}>
              <input type="hidden" name="pathId" value={path.id} />
              <SubmitButton pendingText="Enrolling…">Enrol in this path</SubmitButton>
            </form>
          )}
        </div>
      </PageHeader>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
        <ol className="space-y-8">
          {modules.map((m, i) => (
            <li key={m.id}>
              <p className="text-xs font-semibold text-slate-500">Step {i + 1} · {m.school.title}{!m.isRequired && " · optional"}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                <Link href={`/academy/modules/${m.slug}`} className="hover:text-brand-700">{m.title}</Link>
              </h2>
              <p className="mt-1 text-slate-600">{m.description}</p>
              <div className="mt-3 space-y-3">
                {m.lessons.length ? m.lessons.map((l) => <LessonCard key={l.id} lesson={l} status={progress.get(l.id)?.status} />) : (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Lessons coming soon.</p>
                )}
              </div>
            </li>
          ))}
        </ol>
        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Users aria-hidden className="h-4 w-4 text-brand-600" /> Who it&apos;s for</h2>
            <p className="mt-2 text-sm text-slate-700">{path.audience}</p>
            {path.prerequisites.length > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold">Prerequisites</h3>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">{path.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul>
              </>
            )}
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">What you&apos;ll be able to do</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              {path.learningOutcomes.map((o) => <li key={o} className="flex gap-2"><CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{o}</li>)}
            </ul>
          </div>
          <div className="card border-amber-200 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Trophy aria-hidden className="h-4 w-4 text-amber-600" /> Capstone project</h2>
            <p className="mt-2 text-sm text-slate-800">{path.capstone}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
