import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { hasPremium } from "@/lib/permissions";
import { dashboardData } from "@/lib/progress";
import { leavePath } from "@/app/actions/learning";
import { ProgressBar, StatusBadge } from "@/components/ui/badges";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  const data = await dashboardData(user.id);
  const sp = await searchParams;
  const premium = await hasPremium(user);

  return (
    <div className="space-y-10">
      {sp.error === "forbidden" && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">You don&apos;t have permission to view that page.</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5 md:col-span-2">
          <h2 className="font-semibold text-slate-900">Continue learning</h2>
          {data.continueLesson ? (
            <Link href={`/academy/lessons/${data.continueLesson.lesson.slug}${data.continueLesson.progress.lastBlockId ? `#block-${data.continueLesson.progress.lastBlockId}` : ""}`} className="mt-3 flex items-center justify-between rounded-xl bg-brand-50 p-4 ring-1 ring-brand-200 hover:bg-brand-100">
              <span>
                <span className="block font-semibold text-slate-900">{data.continueLesson.lesson.title}</span>
                <span className="text-sm text-slate-600">{data.continueLesson.progress.progressPercent}% read · last visited {formatDate(data.continueLesson.progress.updatedAt)}</span>
              </span>
              <ArrowRight aria-hidden className="h-5 w-5 text-brand-700" />
            </Link>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              Nothing in progress. <Link href="/get-started" className="font-semibold text-brand-700 underline">Find a path</Link> or <Link href="/academy" className="font-semibold text-brand-700 underline">browse the Academy</Link>.
            </p>
          )}
        </div>
        <div className="card grid grid-cols-2 gap-3 p-5">
          <div><p className="text-xs text-slate-500">Lessons completed</p><p className="text-3xl font-bold">{data.completedCount}</p></div>
          <div><p className="text-xs text-slate-500">Paths enrolled</p><p className="text-3xl font-bold">{data.enrollments.length}</p></div>
          <div className="col-span-2"><p className="text-xs text-slate-500">Plan</p><p className="font-semibold">{premium ? "Premium" : "Free"}{!premium && <Link href="/pricing" className="ml-2 text-sm font-normal text-brand-700 underline">What&apos;s in Premium?</Link>}</p></div>
        </div>
      </div>

      <section aria-labelledby="enrol-h">
        <h2 id="enrol-h" className="text-xl font-bold">Your learning paths</h2>
        {data.enrollments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">You haven&apos;t enrolled in a path yet. <Link href="/academy/paths" className="font-semibold text-brand-700 underline">Browse paths</Link>.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {data.enrollments.map(({ path, enrollment, progress }) => (
              <div key={path.id} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/academy/paths/${path.slug}`} className="font-semibold text-slate-900 hover:text-brand-700">{path.title}</Link>
                  <StatusBadge status={enrollment.status === "completed" ? "completed" : "in_progress"} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{progress.completed} of {progress.total} lessons completed</p>
                <div className="mt-2"><ProgressBar percent={progress.percent} label={`${path.title} progress`} /></div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  {progress.nextLesson ? (
                    <Link href={`/academy/lessons/${progress.nextLesson.slug}`} className="btn-primary btn-sm">Next: {progress.nextLesson.title}</Link>
                  ) : <span className="text-sm font-medium text-emerald-700">All available lessons complete 🎉</span>}
                  <form action={leavePath}>
                    <input type="hidden" name="pathId" value={path.id} />
                    <button type="submit" className="btn-ghost btn-sm text-slate-500">Leave path</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="recent-h" className="card p-5">
          <h2 id="recent-h" className="font-semibold">Recent lessons</h2>
          {data.recent.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {data.recent.slice(0, 8).map(({ lesson, progress }) => (
                <li key={lesson.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link href={`/academy/lessons/${lesson.slug}`} className="truncate text-slate-800 hover:text-brand-700">{lesson.title}</Link>
                  <StatusBadge status={progress.status} />
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-600">No lessons started yet.</p>}
        </section>
        <section aria-labelledby="quiz-h" className="card p-5">
          <h2 id="quiz-h" className="font-semibold">Quiz history</h2>
          {data.attempts.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {data.attempts.map(({ attempt, quizTitle }) => (
                <li key={attempt.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="truncate">{quizTitle}</span>
                  <span className={`shrink-0 font-mono ${attempt.passed ? "text-emerald-700" : "text-amber-700"}`}>
                    {attempt.score}/{attempt.totalPoints} {attempt.passed ? "✓ passed" : "· retry"}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-600">No quiz attempts yet.</p>}
        </section>
      </div>
    </div>
  );
}
