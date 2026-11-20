import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons, lessonProgress, quizzes, quizAttempts, searchMisses } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";

export default async function AdminAnalytics() {
  const lessonRows = (await db
    .select({
      id: lessons.id,
      title: lessons.title,
      starts: count(lessonProgress.id),
      completions: sql<number>`sum(case when ${lessonProgress.status} = 'completed' then 1 else 0 end)`.mapWith(Number),
      avgProgress: sql<number>`avg(${lessonProgress.progressPercent})`.mapWith(Number),
    })
    .from(lessons)
    .leftJoin(lessonProgress, eq(lessonProgress.lessonId, lessons.id))
    .where(eq(lessons.status, "published"))
    .groupBy(lessons.id)
    .orderBy(desc(count(lessonProgress.id)))
    );
  const quizRows = (await db
    .select({
      title: quizzes.title,
      attempts: count(quizAttempts.id),
      passRate: sql<number>`avg(case when ${quizAttempts.passed} then 100.0 else 0 end)`.mapWith(Number),
      avgScore: sql<number>`avg(100.0 * ${quizAttempts.score} / nullif(${quizAttempts.totalPoints}, 0))`.mapWith(Number),
      learners: sql<number>`count(distinct ${quizAttempts.userId})`.mapWith(Number),
    })
    .from(quizzes)
    .leftJoin(quizAttempts, eq(quizAttempts.quizId, quizzes.id))
    .groupBy(quizzes.id)
    .orderBy(desc(count(quizAttempts.id)))
    );
  const misses = (await db.select({ q: searchMisses.query, n: count() }).from(searchMisses).groupBy(searchMisses.query).orderBy(desc(count())).limit(20));

  return (
    <AdminPage title="Learning analytics" description="Use these numbers to improve explanations — low completion or low quiz scores point at lessons that need work. Interaction counts alone are not proof of learning.">
      <h2 className="mb-2 text-lg font-semibold">Lessons</h2>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Lesson</th><th>Starts</th><th>Completions</th><th>Completion rate</th><th>Avg. progress (drop-off)</th></tr></thead>
          <tbody>
            {lessonRows.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{r.starts}</td>
                <td>{r.completions ?? 0}</td>
                <td>{r.starts ? `${Math.round(((r.completions ?? 0) / r.starts) * 100)}%` : "—"}</td>
                <td>{r.avgProgress != null ? `${Math.round(r.avgProgress)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-2 mt-8 text-lg font-semibold">Quizzes</h2>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Quiz</th><th>Attempts</th><th>Learners</th><th>Pass rate</th><th>Avg. score</th></tr></thead>
          <tbody>
            {quizRows.map((r) => (
              <tr key={r.title}>
                <td>{r.title}</td>
                <td>{r.attempts}</td>
                <td>{r.learners}</td>
                <td>{r.attempts ? `${Math.round(r.passRate)}%` : "—"}</td>
                <td>{r.attempts ? `${Math.round(r.avgScore)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-2 mt-8 text-lg font-semibold">Searches with no results</h2>
      {misses.length ? (
        <ul className="card divide-y divide-slate-100">{misses.map((m) => <li key={m.q} className="flex justify-between p-3 text-sm"><span>{m.q}</span><span className="text-slate-500">{m.n}×</span></li>)}</ul>
      ) : <p className="text-sm text-slate-500">None recorded yet.</p>}
    </AdminPage>
  );
}
