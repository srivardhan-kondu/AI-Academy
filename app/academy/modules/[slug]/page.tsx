import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getModule } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getProgressMap } from "@/lib/progress";
import { LessonCard, PageHeader } from "@/components/academy/cards";
import { DifficultyBadge, ProgressBar } from "@/components/ui/badges";
import { formatMinutes } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/academy/modules/[slug]">): Promise<Metadata> {
  const data = await getModule((await params).slug);
  return data ? { title: data.module.title, description: data.module.description } : {};
}

export default async function ModulePage({ params }: PageProps<"/academy/modules/[slug]">) {
  const data = await getModule((await params).slug);
  if (!data) notFound();
  const user = await getCurrentUser();
  const progress = user ? await getProgressMap(user.id, data.lessons.map((l) => l.id)) : new Map();
  const done = data.lessons.filter((l) => progress.get(l.id)?.status === "completed").length;
  const minutes = data.lessons.reduce((s, l) => s + l.estimatedMinutes, 0);

  return (
    <>
      <PageHeader eyebrow={data.school.title} title={data.module.title} description={data.module.description}>
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={data.module.difficulty} />
          <span className="badge bg-slate-100 text-slate-700 ring-1 ring-slate-200">{data.lessons.length} lessons · {formatMinutes(minutes)}</span>
          <Link href={`/academy/schools/${data.school.slug}`} className="text-sm font-medium text-brand-700">← Back to {data.school.title}</Link>
        </div>
        {data.module.prerequisites.length > 0 && (
          <p className="mt-3 text-sm text-slate-600"><strong>Prerequisites:</strong> {data.module.prerequisites.join(", ")}</p>
        )}
      </PageHeader>
      <div className="container-page max-w-3xl space-y-4 py-10">
        {user && data.lessons.length > 0 && (
          <div className="card p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">{done} of {data.lessons.length} lessons completed</p>
            <ProgressBar percent={Math.round((done / data.lessons.length) * 100)} label="Module progress" />
          </div>
        )}
        {data.lessons.length ? (
          data.lessons.map((l, i) => (
            <div key={l.id} className="flex items-start gap-3">
              <span className="mt-4 w-6 shrink-0 text-right font-mono text-sm text-slate-400">{i + 1}</span>
              <div className="flex-1"><LessonCard lesson={l} status={progress.get(l.id)?.status} /></div>
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-600">Lessons for this module are coming soon.</p>
        )}
      </div>
    </>
  );
}
