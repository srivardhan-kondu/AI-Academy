import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers, CircleDashed } from "lucide-react";
import { DifficultyBadge, DurationBadge, TierBadge } from "@/components/ui/badges";
import type { LessonCard as LessonCardT } from "@/lib/content/queries";
import { LEVEL_NAMES, formatMinutes } from "@/lib/utils";

export function LessonCard({ lesson, status }: { lesson: LessonCardT; status?: "completed" | "in_progress" }) {
  return (
    <Link href={`/academy/lessons/${lesson.slug}`} className="card group flex items-start gap-4 p-4 transition hover:border-brand-300 hover:shadow">
      <span className="mt-0.5" aria-hidden>
        {status === "completed" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : status === "in_progress" ? (
          <CircleDashed className="h-5 w-5 text-amber-600" />
        ) : (
          <CircleDashed className="h-5 w-5 text-slate-300" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900 group-hover:text-brand-700">{lesson.title}</span>
        <span className="mt-1 block text-sm text-slate-600">{lesson.summary}</span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          <DifficultyBadge level={lesson.difficulty} />
          <DurationBadge minutes={lesson.estimatedMinutes} />
          <TierBadge tier={lesson.accessTier} />
          {status && <span className="sr-only">{status === "completed" ? "Completed" : "In progress"}</span>}
        </span>
      </span>
    </Link>
  );
}

export function SchoolCard({
  school,
}: {
  school: { slug: string; title: string; description: string; level: number; displayOrder: number; lessonCount: number; outline: string[] };
}) {
  return (
    <Link href={`/academy/schools/${school.slug}`} className="card group flex flex-col p-5 transition hover:border-brand-300 hover:shadow">
      <span className="eyebrow">
        School {String(school.displayOrder).padStart(2, "0")} · {LEVEL_NAMES[school.level]}
      </span>
      <span className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{school.title}</span>
      <span className="mt-1 line-clamp-3 flex-1 text-sm text-slate-600">{school.description}</span>
      <span className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          {school.lessonCount > 0 ? `${school.lessonCount} lesson${school.lessonCount === 1 ? "" : "s"} available` : "Lessons coming soon"} · {school.outline.length} topics planned
        </span>
        <ArrowRight aria-hidden className="h-4 w-4 text-brand-600" />
      </span>
    </Link>
  );
}

export function PathCard({
  path,
}: {
  path: { slug: string; title: string; description: string; audience: string; difficulty: "beginner" | "intermediate" | "advanced"; estimatedMinutes: number; accessTier: "free" | "premium"; moduleCount: number };
}) {
  return (
    <Link href={`/academy/paths/${path.slug}`} className="card group flex flex-col p-5 transition hover:border-brand-300 hover:shadow">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
        <Layers aria-hidden className="h-3.5 w-3.5" /> Learning path
      </span>
      <span className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{path.title}</span>
      <span className="mt-1 flex-1 text-sm text-slate-600">{path.description}</span>
      <span className="mt-2 text-xs text-slate-500">For: {path.audience}</span>
      <span className="mt-3 flex flex-wrap gap-1.5">
        <DifficultyBadge level={path.difficulty} />
        <span className="badge bg-slate-100 text-slate-700 ring-1 ring-slate-200">{formatMinutes(path.estimatedMinutes)} · {path.moduleCount} modules</span>
        <TierBadge tier={path.accessTier} />
      </span>
    </Link>
  );
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="container-page py-10">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-3xl text-lg text-slate-600">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}

