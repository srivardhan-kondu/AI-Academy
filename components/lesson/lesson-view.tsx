import Link from "next/link";
import { ChevronRight, ArrowRight, Lock, Info, Check, CircleCheckBig, ExternalLink, SquareCheck } from "lucide-react";
import { DifficultyBadge, DurationBadge, TierBadge } from "@/components/ui/badges";
import { LessonBlock } from "./lesson-renderer";
import { ProgressTracker } from "./progress-tracker";
import { LessonProgressBar, LessonToc } from "./lesson-nav";
import { NestedDiagram } from "./blocks/diagram";
import { BookmarkButton, CompleteLessonButton } from "./lesson-actions";
import { buildSections, type LessonSection } from "@/lib/lesson/sections";
import { cn } from "@/lib/utils";
import type { getLesson, RenderableBlock, ClientQuiz } from "@/lib/content/queries";
import type { BlockContent } from "@/lib/lesson/blocks";

type LessonData = NonNullable<Awaited<ReturnType<typeof getLesson>>>;

const ICON = { strokeWidth: 1.5, "aria-hidden": true } as const;
const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

function reviewedLabel(d: Date | null | undefined) {
  if (!d) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** The first nested diagram doubles as the lesson's "map" in the header. */
function heroDiagram(blocks: RenderableBlock[]): BlockContent<"diagram"> | null {
  for (const b of blocks) {
    if (!("invalid" in b) && b.type === "diagram" && b.content.layout === "nested") return b.content;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

export function LessonHeader({ data, diagram, children }: { data: LessonData; diagram?: BlockContent<"diagram"> | null; children?: React.ReactNode }) {
  const { lesson, module, school, position } = data;
  const reviewed = reviewedLabel(lesson.lastReviewedAt);
  return (
    <header className="container-page">
      <div className="border-b border-line pt-6 pb-10 sm:pb-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.9062rem] text-ink-2">
            <li>
              <Link href="/academy" className="hover:text-ink">Academy</Link>
            </li>
            <li aria-hidden><ChevronRight {...ICON} className="h-3 w-3 text-ink-3" /></li>
            <li>
              <Link href={`/academy/schools/${school.slug}`} className="hover:text-ink">{school.title}</Link>
            </li>
            <li aria-hidden><ChevronRight {...ICON} className="h-3 w-3 text-ink-3" /></li>
            <li>
              <Link href={`/academy/modules/${module.slug}`} className="hover:text-ink" aria-current="page">{module.title}</Link>
            </li>
          </ol>
        </nav>

        <div className={cn("mt-6 grid gap-10", diagram && "lg:grid-cols-[minmax(0,1fr)_20.625rem] lg:items-center xl:gap-16")}>
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-weak px-3 py-1 text-[0.875rem] font-semibold text-brand">
              <SquareCheck {...ICON} className="h-3.5 w-3.5" />
              {module.title}
              {position && (
                <>
                  <span aria-hidden>·</span> Lesson {position.index} of {position.total}
                </>
              )}
            </p>
            <h1 className="mt-4 max-w-[17ch] text-[2.625rem] leading-[1.06] font-semibold tracking-[-0.025em] text-balance text-ink sm:text-[3.375rem]">
              {lesson.title}
            </h1>
            <p className="mt-5 max-w-[34rem] font-serif text-[1.375rem] leading-[1.55] text-pretty text-ink-2 italic sm:text-[1.4375rem]">{lesson.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <DifficultyBadge level={lesson.difficulty} />
              <DurationBadge minutes={lesson.estimatedMinutes} suffix=" read" />
              <TierBadge tier={lesson.accessTier} />
              {reviewed && <span className="chip">Reviewed {reviewed}</span>}
              {children}
            </div>
          </div>

          {diagram && (
            <figure className="hidden lg:block">
              <NestedDiagram nodes={diagram.nodes} label={diagram.description} size="sm" />
              <figcaption className="mt-3 text-[0.875rem] leading-snug text-ink-3">
                {NUMBER_WORDS[diagram.nodes.length] ?? diagram.nodes.length} layers, one inside the next: the map you&apos;ll build in this lesson.
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Section chrome                                                     */
/* ------------------------------------------------------------------ */

function SectionHeading({ id, number, title, interactive }: { id: string; number: number; title: string; interactive?: boolean }) {
  return (
    <h2 id={`${id}-title`} className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-[1.625rem] leading-[1.2] font-semibold tracking-[-0.02em] text-ink sm:text-[2rem]">
      <span className="section-no translate-y-[-2px]">{String(number).padStart(2, "0")}</span>
      <span>{title}</span>
      {interactive && (
        <span className="inline-flex translate-y-[-4px] items-center gap-1 self-center rounded-full bg-brand-weak px-2.5 py-0.5 text-[0.8438rem] font-semibold tracking-normal text-brand">
          <span aria-hidden className="text-[0.9062rem] leading-none">+</span> Interactive
        </span>
      )}
    </h2>
  );
}

function ContinueLink({ to }: { to: { id: string; title: string } }) {
  return (
    <div className="mt-12">
      <a href={`#${to.id}`} className="group inline-flex items-center gap-2 border-t border-line pt-4 pr-6 text-[1.0312rem] font-semibold text-brand hover:text-brand-700">
        Continue: {to.title}
        <ArrowRight {...ICON} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

type TocSection = { id: string; title: string };

/* ------------------------------------------------------------------ */
/* Objectives (section 01)                                            */
/* ------------------------------------------------------------------ */

function Objectives({ data }: { data: LessonData }) {
  const { lesson, prerequisites } = data;
  return (
    <div className="space-y-8">
      {lesson.learningObjectives.length > 0 && (
        <ul className="space-y-3.5">
          {lesson.learningObjectives.map((o) => (
            <li key={o} className="flex gap-3.5">
              <span aria-hidden className="mt-[4px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-weak text-brand">
                <Check strokeWidth={2} className="h-3.5 w-3.5" />
              </span>
              <span className="max-w-[62ch] font-serif text-[1.25rem] leading-[1.55] text-ink">{o}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex max-w-[30.625rem] gap-3 rounded-[12px] bg-surface-2 px-4 py-3.5 text-[1rem] leading-[1.5] text-ink-2">
        <Info {...ICON} className="mt-[3px] h-4 w-4 shrink-0 text-brand-2" />
        {prerequisites.length ? (
          <p>
            <span className="font-semibold text-ink">Before you start:</span> this lesson builds on{" "}
            {prerequisites.map((p, i) => (
              <span key={p.id}>
                {i > 0 && (i === prerequisites.length - 1 ? " and " : ", ")}
                <Link href={`/academy/lessons/${p.slug}`} className="font-medium text-brand underline decoration-brand-2/40 underline-offset-2 hover:decoration-brand-2">
                  {p.title}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : (
          <p>
            <span className="font-semibold text-ink">Before you start:</span> nothing. No prior lessons needed. This is a good starting point.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson page                                                        */
/* ------------------------------------------------------------------ */

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
  const { lesson, module, next } = data;
  const resumable = progress && progress.status !== "completed" && progress.lastBlockId && progress.progressPercent > 10;

  const content = buildSections(blocks);
  const objectives: LessonSection<RenderableBlock> = { id: "goals", title: "Your goals", kind: "reading", blocks: [], headingBlockId: null };
  const all = [objectives, ...content];
  const toc: TocSection[] = all.map((s) => ({ id: s.id, title: s.title }));
  const ctx = { quizzes, passedQuizIds, showErrors: preview };

  return (
    <article className="pb-24">
      <LessonHeader data={data} diagram={heroDiagram(blocks)}>
        {!preview && <BookmarkButton type="lesson" id={lesson.id} initial={bookmarked} signedIn={!!user} />}
      </LessonHeader>

      <LessonProgressBar sections={toc} lessonTitle={lesson.title} moduleTitle={module.title} />

      <div className="container-page grid gap-12 pt-12 lg:grid-cols-[14.375rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <div className="sticky top-[9.375rem] space-y-8">
            <LessonToc sections={toc} />
            {next && (
              <Link href={`/academy/lessons/${next.slug}`} className="card block p-4 transition-colors hover:border-brand-2">
                <span className="text-[0.875rem] font-medium text-ink-2">Next up</span>
                <span className="mt-1.5 block font-serif text-[1.1562rem] leading-[1.35] text-ink">{next.title}</span>
              </Link>
            )}
            {progress?.status === "completed" && (
              <p className="flex items-center gap-2 text-[0.9062rem] font-medium text-good">
                <CircleCheckBig {...ICON} className="h-4 w-4" /> You&apos;ve completed this lesson
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0 max-w-[50.75rem]">
          {resumable && (
            <a
              href={`#block-${progress.lastBlockId}`}
              className="mb-12 flex items-center justify-between gap-4 rounded-[12px] border border-brand-2/30 bg-brand-weak px-5 py-3.5 text-[1rem] font-medium text-brand"
            >
              Welcome back. You were {progress.progressPercent}% through this lesson.
              <span className="flex shrink-0 items-center gap-1 font-semibold">
                Resume <ArrowRight {...ICON} className="h-4 w-4" />
              </span>
            </a>
          )}

          <div className="space-y-24">
            {all.map((section, i) => {
              const nextSection = all[i + 1];
              return (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-[8.75rem]">
                  <SectionHeading id={section.id} number={i + 1} title={section.id === "goals" ? "By the end, you'll be able to" : section.title} interactive={section.kind === "interactive"} />
                  <div className="mt-6 space-y-10">
                    {section.id === "goals" ? (
                      <Objectives data={data} />
                    ) : (
                      section.blocks.map((b) => <LessonBlock key={b.id} block={b} hideTitle={b.id === section.headingBlockId} {...ctx} />)
                    )}
                  </div>
                  {nextSection && <ContinueLink to={{ id: nextSection.id, title: nextSection.title }} />}
                </section>
              );
            })}
          </div>

          <section className="mt-24 rounded-[16px] border border-line bg-surface p-6 sm:p-8" aria-label="Lesson completion">
            {user && !preview ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-[1.375rem] font-semibold text-ink">Finished reading?</h2>
                  <p className="mt-1 font-serif text-[1.1562rem] text-ink-2">Mark the lesson complete to track it on your dashboard.</p>
                </div>
                <CompleteLessonButton lessonId={lesson.id} completed={progress?.status === "completed"} />
              </div>
            ) : preview ? (
              <p className="text-sm text-ink-2">Completion controls are hidden in preview.</p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-[1.375rem] font-semibold text-ink">Keep your progress</h2>
                  <p className="mt-1 font-serif text-[1.1562rem] text-ink-2">A free account saves your progress, quiz results and bookmarks.</p>
                </div>
                <Link href={`/signup?next=/academy/lessons/${lesson.slug}`} className="btn-primary px-5 py-2.5">
                  Create a free account
                </Link>
              </div>
            )}
          </section>

          {lesson.references.length > 0 && (
            <section aria-labelledby="refs" className="mt-14">
              <h2 id="refs" className="text-[1.375rem] font-semibold text-ink">References &amp; further reading</h2>
              <ul className="mt-4 border-t border-line">
                {lesson.references.map((r) => (
                  <li key={r.url} className="border-b border-line">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 py-3.5 font-serif text-[1.1562rem] text-ink hover:text-brand"
                    >
                      {r.title}
                      <ExternalLink {...ICON} className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-brand" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {next && (
            <Link href={`/academy/lessons/${next.slug}`} className="group mt-14 flex items-center justify-between gap-6 rounded-[16px] border border-line bg-surface p-6 transition-colors hover:border-brand-2">
              <span>
                <span className="text-[0.9062rem] font-semibold text-brand-2">Next lesson</span>
                <span className="mt-1 block text-[1.375rem] font-semibold tracking-[-0.01em] text-ink">{next.title}</span>
                {next.summary && <span className="mt-1.5 block max-w-[60ch] font-serif text-[1.1562rem] leading-[1.5] text-ink-2">{next.summary}</span>}
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-surface transition-transform group-hover:translate-x-0.5">
                <ArrowRight {...ICON} className="h-4 w-4" />
              </span>
            </Link>
          )}
        </div>
      </div>
      {user && !preview && <ProgressTracker lessonId={lesson.id} blockIds={blocks.map((b) => b.id)} enabled />}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Locked (premium) lesson                                            */
/* ------------------------------------------------------------------ */

export function LockedLesson({ data }: { data: LessonData }) {
  return (
    <article className="pb-24">
      <LessonHeader data={data} />
      <div className="container-page">
        <div className="mx-auto max-w-[47.5rem] space-y-12 pt-12">
          <section aria-labelledby="goals-title">
            <SectionHeading id="goals" number={1} title="By the end, you'll be able to" />
            <div className="mt-6">
              <Objectives data={data} />
            </div>
          </section>
          <div className="rounded-[16px] border border-line bg-surface p-8 text-center sm:p-10">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-amber-weak text-amber-ink">
              <Lock {...ICON} className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-[1.6875rem] font-semibold tracking-[-0.02em] text-ink">This is a Premium lesson</h2>
            <p className="mx-auto mt-2 max-w-[46ch] font-serif text-[1.2188rem] leading-[1.6] text-ink-2">
              You can see what it covers above. The full explanation, interactive lab and knowledge check are part of Premium. Foundational lessons stay free.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/pricing" className="btn-primary px-5 py-2.5">See Premium details</Link>
              <Link href="/academy" className="btn-secondary px-5 py-2.5">Browse free lessons</Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
