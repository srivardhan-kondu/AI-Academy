import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { quizzes, quizQuestions } from "@/lib/db/schema";
import { saveQuiz, saveQuestion, deleteQuestion } from "@/app/actions/admin";
import { AdminPage, Field, Area, Select } from "@/components/admin/fields";
import { ActionForm, SubmitButton } from "@/components/ui/form";

const TYPES = [
  { value: "single", label: "Single choice" },
  { value: "multiple", label: "Multiple select" },
  { value: "true_false", label: "True / false" },
];

function QuestionForm({ quizId, q }: { quizId: string; q?: typeof quizQuestions.$inferSelect }) {
  return (
    <ActionForm action={saveQuestion} className="space-y-3">
      <input type="hidden" name="quizId" value={quizId} />
      <input type="hidden" name="questionId" value={q?.id ?? ""} />
      <Area name="prompt" label="Question" defaultValue={q?.prompt} rows={2} required />
      <div className="grid gap-3 md:grid-cols-3">
        <Select name="questionType" label="Type" defaultValue={q?.questionType ?? "single"} options={TYPES} />
        <Field name="answers" label="Correct option number(s)" defaultValue={q ? q.answerKey.map((n) => n + 1).join(", ") : ""} hint="e.g. 2 or 1, 3" required />
        <Field name="points" label="Points" type="number" min={1} max={10} defaultValue={q?.points ?? 1} />
      </div>
      <Area name="options" label="Options (one per line; ignored for true/false)" defaultValue={q?.optionsJson.join("\n")} rows={4} />
      <Area name="explanation" label="Explanation shown after submitting" defaultValue={q?.explanation} rows={2} required />
      <SubmitButton className="btn-secondary btn-sm">{q ? "Save question" : "Add question"}</SubmitButton>
    </ActionForm>
  );
}

export default async function EditQuiz({ params }: PageProps<"/admin/quizzes/[id]">) {
  const { id } = await params;
  const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, id)))[0];
  if (!quiz) notFound();
  const qs = (await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, id)).orderBy(asc(quizQuestions.displayOrder)));
  return (
    <AdminPage title={`Quiz: ${quiz.title}`} description={`Quiz ID (use in a lesson's quiz block): ${quiz.id}`} actions={quiz.lessonId ? <Link href={`/admin/lessons/${quiz.lessonId}`} className="btn-secondary">Back to lesson</Link> : null}>
      <ActionForm action={saveQuiz} className="card flex flex-wrap items-end gap-3 p-5">
        <input type="hidden" name="id" value={id} />
        <div className="flex-1"><Field name="title" label="Title" defaultValue={quiz.title} required /></div>
        <div className="w-40"><Field name="passThreshold" label="Pass mark (%)" type="number" min={1} max={100} defaultValue={quiz.passThreshold} /></div>
        <SubmitButton>Save</SubmitButton>
      </ActionForm>
      <ol className="mt-6 space-y-4">
        {qs.map((q, i) => (
          <li key={q.id} className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Question {i + 1}</p>
              <form action={deleteQuestion}>
                <input type="hidden" name="quizId" value={id} />
                <input type="hidden" name="questionId" value={q.id} />
                <button className="btn-ghost btn-sm text-red-700" type="submit">Delete</button>
              </form>
            </div>
            <QuestionForm quizId={id} q={q} />
          </li>
        ))}
      </ol>
      <div className="card mt-6 p-5">
        <h2 className="mb-3 font-semibold">Add a question</h2>
        <QuestionForm quizId={id} />
      </div>
    </AdminPage>
  );
}
