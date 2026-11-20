import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { quizzes, quizQuestions, lessons } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";

export default async function AdminQuizzes() {
  const rows = (await db.select({ q: quizzes, lessonTitle: lessons.title, lessonId: lessons.id }).from(quizzes).leftJoin(lessons, eq(lessons.id, quizzes.lessonId)));
  const counts = new Map((await db.select({ id: quizQuestions.quizId, n: count() }).from(quizQuestions).groupBy(quizQuestions.quizId)).map((r) => [r.id, r.n]));
  return (
    <AdminPage title="Quizzes" description="Create quizzes from a lesson's editor page. Answer keys are only ever used on the server.">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Quiz</th><th>Lesson</th><th>Questions</th><th>Pass mark</th></tr></thead>
          <tbody>
            {rows.map(({ q, lessonTitle, lessonId }) => (
              <tr key={q.id}>
                <td><Link href={`/admin/quizzes/${q.id}`} className="font-medium text-brand-700 underline">{q.title}</Link></td>
                <td>{lessonId ? <Link href={`/admin/lessons/${lessonId}`} className="underline">{lessonTitle}</Link> : "—"}</td>
                <td>{counts.get(q.id) ?? 0}</td>
                <td>{q.passThreshold}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
