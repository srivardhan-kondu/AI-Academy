import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSchool } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getProgressMap } from "@/lib/progress";
import { LessonCard, PageHeader } from "@/components/academy/cards";
import { DifficultyBadge } from "@/components/ui/badges";
import { LEVEL_NAMES } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/academy/schools/[slug]">): Promise<Metadata> {
  const data = await getSchool((await params).slug);
  return data ? { title: data.school.title, description: data.school.description } : {};
}

export default async function SchoolPage({ params }: PageProps<"/academy/schools/[slug]">) {
  const data = await getSchool((await params).slug);
  if (!data) notFound();
  const user = await getCurrentUser();
  const progress = user ? await getProgressMap(user.id) : new Map();
  const { school, modules } = data;
  const hasLessons = modules.some((m) => m.lessons.length);

  return (
    <>
      <PageHeader eyebrow={`School ${String(school.displayOrder).padStart(2, "0")} · Level ${school.level}: ${LEVEL_NAMES[school.level]}`} title={school.title} description={school.description} />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-10">
          {modules.map((m) => (
            <section key={m.id} aria-labelledby={`m-${m.id}`}>
              <div className="flex flex-wrap items-center gap-3">
                <h2 id={`m-${m.id}`} className="text-xl font-bold text-slate-900">
                  <Link href={`/academy/modules/${m.slug}`} className="hover:text-brand-700">{m.title}</Link>
                </h2>
                <DifficultyBadge level={m.difficulty} />
              </div>
              <p className="mt-1 text-slate-600">{m.description}</p>
              <div className="mt-4 space-y-3">
                {m.lessons.length ? (
                  m.lessons.map((l) => <LessonCard key={l.id} lesson={l} status={progress.get(l.id)?.status} />)
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Lessons for this module are being written and reviewed.</p>
                )}
              </div>
            </section>
          ))}
          {!hasLessons && (
            <p className="rounded-xl bg-amber-50 p-5 text-amber-900">
              Lessons for this school are in production. We publish lessons only after technical, accessibility and editorial review. Explore the curriculum outline to see what&apos;s coming.
            </p>
          )}
        </div>
        <aside>
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900">Curriculum outline</h2>
            <p className="mt-1 text-xs text-slate-500">All topics planned for this school.</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
              {school.outline.map((t) => <li key={t}>{t}</li>)}
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}
