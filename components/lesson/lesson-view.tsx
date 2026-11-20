import Link from "next/link";
import { ChevronRight, Target, ListChecks, CalendarCheck, ArrowRight, Lock, BookOpen } from "lucide-react";
import { DifficultyBadge, DurationBadge, TierBadge } from "@/components/ui/badges";
import { LessonRenderer } from "./lesson-renderer";
import { ProgressTracker } from "./progress-tracker";
import { BookmarkButton, CompleteLessonButton } from "./lesson-actions";
import { formatDate } from "@/lib/utils";
import type { getLesson, RenderableBlock, ClientQuiz } from "@/lib/content/queries";

type LessonData = NonNullable<Awaited<ReturnType<typeof getLesson>>>;

export function LessonHeader({ data, children }: { data: LessonData; children?: React.ReactNode }) {
  const { lesson, module, school } = data;
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-page py-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <Link href="/academy" className="hover:text-slate-900">Academy</Link>
          <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          <Link href={`/academy/schools/${school.slug}`} className="hover:text-slate-900">{school.title}</Link>
          <ChevronRight aria-hidden className="h-3.5 w-3.5" />
          <Link href={`/academy/modules/${module.slug}`} className="hover:text-slate-900">{module.title}</Link>
        </nav>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{lesson.title}</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">{lesson.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DifficultyBadge level={lesson.difficulty} />
          <DurationBadge minutes={lesson.estimatedMinutes} />
          <TierBadge tier={lesson.accessTier} />
          <span className="badge bg-slate-50 text-slate-600 ring-1 ring-slate-200">
            <CalendarCheck aria-hidden className="h-3 w-3" /> Last reviewed {formatDate(lesson.lastReviewedAt)}
          </span>
          {children}
        </div>
      </div>
    </header>
  );
}

export function LessonIntro({ data }: { data: LessonData }) {
  const { lesson, prerequisites } = data;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {lesson.learningObjectives.length > 0 && (
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Target aria-hidden className="h-4 w-4 text-brand-600" /> By the end you will be able to
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {lesson.learningObjectives.map((o) => (
              <li key={o} className="flex gap-2">
                <ListChecks aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {o}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <BookOpen aria-hidden className="h-4 w-4 text-brand-600" /> Before you start
        </h2>
        {prerequisites.length ? (
          <>
            <p className="mt-2 text-sm text-slate-600">This lesson builds on:</p>
            <ul className="mt-2 space-y-1 text-sm">
              {prerequisites.map((p) => (
                <li key={p.id}>
                  <Link href={`/academy/lessons/${p.slug}`} className="font-medium text-brand-700 underline underline-offset-2">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600">No prerequisites — this lesson is a good starting point.</p>
        )}
      </div>
    </div>
  );
}

export function LessonView({
  data,
  blocks,
  quizzes,
  user,
  progress,
  passedQuizIds,
  bookmarked,
  preview = false,
}: {
  data: LessonData;
  blocks: RenderableBlock[];
  quizzes: Record<string, ClientQuiz>;
  user: { id: string } | null;
  progress: { status: string; lastBlockId: string | null; progressPercent: number } | null;
  passedQuizIds: string[];
  bookmarked: boolean;
  preview?: boolean;
}) {
  const { lesson, next } = data;
  const resumable = progress && progress.status !== "completed" && progress.lastBlockId && progress.progressPercent > 10;
  return (
    <article>
      <LessonHeader data={data}>
        {!preview && <BookmarkButton type="lesson" id={lesson.id} initial={bookmarked} signedIn={!!user} />}
      </LessonHeader>
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 max-w-3xl space-y-10">
          {resumable && (
            <a href={`#block-${progress.lastBlockId}`} className="flex items-center justify-between rounded-xl bg-brand-50 p-4 text-sm font-medium text-brand-800 ring-1 ring-brand-200">
              Welcome back — you were {progress.progressPercent}% through this lesson.
              <span className="flex items-center gap-1">Resume <ArrowRight aria-hidden className="h-4 w-4" /></span>
            </a>
          )}
          <LessonIntro data={data} />
          <LessonRenderer blocks={blocks} quizzes={quizzes} passedQuizIds={passedQuizIds} showErrors={preview} />

          <section className="card p-6" aria-label="Lesson completion">
            {user && !preview ? (
              <CompleteLessonButton lessonId={lesson.id} completed={progress?.status === "completed"} />
            ) : preview ? (
              <p className="text-sm text-slate-600">Completion controls are hidden in preview.</p>
            ) : (
              <p className="text-sm text-slate-700">
                <Link href={`/signup?next=/academy/lessons/${lesson.slug}`} className="font-semibold text-brand-700 underline">Create a free account</Link>{" "}
                to save your progress, quiz results and bookmarks.
              </p>
            )}
          </section>

          {lesson.references.length > 0 && (
            <section aria-labelledby="refs">
              <h2 id="refs" className="text-xl font-bold text-slate-900">References and further reading</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
                {lesson.references.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline underline-offset-2">{r.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {next && (
            <Link href={`/academy/lessons/${next.slug}`} className="card flex items-center justify-between p-5 hover:border-brand-300">
              <span>
                <span className="eyebrow">Continue learning</span>
                <span className="mt-1 block text-lg font-semibold text-slate-900">{next.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{next.summary}</span>
              </span>
              <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-brand-600" />
            </Link>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="card p-4">
              <p className="text-sm font-semibold text-slate-900">Learning loop</p>
              <ol className="mt-2 space-y-1 text-sm text-slate-600">
                {["Understand", "Visualize", "Experiment", "Implement", "Practice", "Apply"].map((s, i) => (
                  <li key={s}>{i + 1}. {s}</li>
                ))}
              </ol>
            </div>
            {progress && (
              <div className="card p-4 text-sm">
                <p className="font-semibold text-slate-900">Your progress</p>
                <p className="mt-1 text-slate-600">{progress.status === "completed" ? "Completed ✓" : `${progress.progressPercent}% read`}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
      {user && !preview && (
        <ProgressTracker lessonId={lesson.id} blockIds={blocks.map((b) => b.id)} enabled />
      )}
    </article>
  );
}

export function LockedLesson({ data }: { data: LessonData }) {
  return (
    <article>
      <LessonHeader data={data} />
      <div className="container-page max-w-3xl space-y-8 py-10">
        <LessonIntro data={data} />
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-8 text-center">
          <Lock aria-hidden className="mx-auto h-8 w-8 text-violet-700" />
          <h2 className="mt-3 text-xl font-bold text-slate-900">This is a Premium lesson</h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-700">
            You can see what it covers above. The full explanation, interactive lab and knowledge check are part of Premium. Foundational lessons stay free.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/pricing" className="btn-primary">See Premium details</Link>
            <Link href="/academy" className="btn-secondary">Browse free lessons</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
