import Link from "next/link";
import { count, desc, eq, lt, or, isNull, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { schools, learningPaths, modules, lessons, users, quizAttempts, projectSubmissions, contactMessages, lessonProgress, auditLogs } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { formatDate } from "@/lib/utils";

const n = (q: { n: number } | undefined) => q?.n ?? 0;

/** Published lessons not reviewed in the last six months (docs/09 §4). */
async function staleLessons() {
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  return (await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.status, "published"), or(isNull(lessons.lastReviewedAt), lt(lessons.lastReviewedAt, sixMonthsAgo))))
    );
}

export default async function AdminHome() {
  const stats = [
    { label: "Schools", value: n((await db.select({ n: count() }).from(schools))[0]), href: "/admin/schools" },
    { label: "Paths", value: n((await db.select({ n: count() }).from(learningPaths))[0]), href: "/admin/paths" },
    { label: "Modules", value: n((await db.select({ n: count() }).from(modules))[0]), href: "/admin/modules" },
    { label: "Published lessons", value: n((await db.select({ n: count() }).from(lessons).where(eq(lessons.status, "published")))[0]), href: "/admin/lessons" },
    { label: "Draft lessons", value: n((await db.select({ n: count() }).from(lessons).where(eq(lessons.status, "draft")))[0]), href: "/admin/lessons" },
    { label: "Learners", value: n((await db.select({ n: count() }).from(users))[0]), href: "/admin/users" },
    { label: "Lesson completions", value: n((await db.select({ n: count() }).from(lessonProgress).where(eq(lessonProgress.status, "completed")))[0]), href: "/admin/analytics" },
    { label: "Quiz attempts", value: n((await db.select({ n: count() }).from(quizAttempts))[0]), href: "/admin/analytics" },
    { label: "Submissions to review", value: n((await db.select({ n: count() }).from(projectSubmissions).where(eq(projectSubmissions.status, "submitted")))[0]), href: "/admin/projects" },
    { label: "Messages", value: n((await db.select({ n: count() }).from(contactMessages))[0]), href: "/admin/messages" },
  ];
  const stale = await staleLessons();
  const recent = (await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8));

  return (
    <AdminPage title="Overview" description="Create and publish content without code changes. Only published content is visible to learners.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 hover:border-brand-300">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">Content freshness</h2>
          <p className="mt-1 text-sm text-slate-600">Published lessons not reviewed in the last 6 months.</p>
          {stale.length ? (
            <ul className="mt-3 space-y-1 text-sm">{stale.map((l) => <li key={l.id}><Link href={`/admin/lessons/${l.id}`} className="text-brand-700 underline">{l.title}</Link> · reviewed {formatDate(l.lastReviewedAt)}</li>)}</ul>
          ) : <p className="mt-3 text-sm text-emerald-700">All published lessons are within their review window.</p>}
        </section>
        <section className="card p-5">
          <h2 className="font-semibold">Recent admin activity</h2>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {recent.map((r) => <li key={r.id}>{formatDate(r.createdAt)} — {r.action} {r.entityType}</li>)}
            {!recent.length && <li className="text-slate-500">No activity yet.</li>}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
}
