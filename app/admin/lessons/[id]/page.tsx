import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { ArrowUp, ArrowDown, Trash2, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { lessons, lessonBlocks, lessonRevisions, quizzes, quizQuestions } from "@/lib/db/schema";
import { blockAction, setLessonStatus, createQuiz, restoreRevision } from "@/app/actions/admin";
import { validateBlock, BLOCK_LABELS, isBlockType } from "@/lib/lesson/blocks";
import { AdminPage } from "@/components/admin/fields";
import { LessonForm } from "@/components/admin/lesson-form";
import { AddBlockForm, EditBlockForm } from "@/components/admin/block-editor";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/badges";
import { formatDate } from "@/lib/utils";
import { lessonFormOptions } from "../options";

export default async function EditLesson({ params }: PageProps<"/admin/lessons/[id]">) {
  const { id } = await params;
  const lesson = (await db.select().from(lessons).where(eq(lessons.id, id)))[0];
  if (!lesson) notFound();
  const blocks = (await db.select().from(lessonBlocks).where(eq(lessonBlocks.lessonId, id)).orderBy(asc(lessonBlocks.displayOrder)));
  const lessonQuizzes = (await db.select().from(quizzes).where(eq(quizzes.lessonId, id)));
  const qCounts = new Map(
    await Promise.all(lessonQuizzes.map(async (q) => [q.id, (await db.select({ id: quizQuestions.id }).from(quizQuestions).where(eq(quizQuestions.quizId, q.id))).length] as const)),
  );
  const revisions = (await db.select().from(lessonRevisions).where(eq(lessonRevisions.lessonId, id)).orderBy(desc(lessonRevisions.version)).limit(10));
  const now = new Date();
  const scheduled = lesson.status === "published" && lesson.publishedAt && lesson.publishedAt > now;

  return (
    <AdminPage
      title={lesson.title}
      description={`Version ${lesson.version} · updated ${formatDate(lesson.updatedAt)}`}
      actions={
        <div className="flex gap-2">
          <Link href={`/admin/lessons/${id}/preview`} className="btn-secondary"><Eye aria-hidden className="h-4 w-4" /> Preview</Link>
          {lesson.status === "published" && !scheduled && <Link href={`/academy/lessons/${lesson.slug}`} className="btn-secondary">Public page</Link>}
        </div>
      }
    >
      <section className="card mb-8 p-5" aria-labelledby="pub-h">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="pub-h" className="font-semibold">Publication</h2>
          <StatusBadge status={scheduled ? "scheduled" : lesson.status} />
          {lesson.publishedAt && <span className="text-sm text-slate-600">{scheduled ? "Goes live" : "Published"} {lesson.publishedAt.toLocaleString()}</span>}
        </div>
        <ActionForm action={setLessonStatus} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={id} />
          <SubmitButton name="op" value="publish" pendingText="Checking…">{lesson.status === "published" ? "Republish now" : "Publish now"}</SubmitButton>
          <div className="flex items-end gap-2">
            <div>
              <label htmlFor="publishAt" className="label">Schedule for</label>
              <input id="publishAt" name="publishAt" type="datetime-local" className="input" />
            </div>
            <SubmitButton name="op" value="schedule" className="btn-secondary">Schedule</SubmitButton>
          </div>
          {lesson.status === "published" && <SubmitButton name="op" value="unpublish" className="btn-secondary">Unpublish</SubmitButton>}
          {lesson.status !== "archived" && <SubmitButton name="op" value="archive" className="btn-ghost">Archive</SubmitButton>}
        </ActionForm>
        <p className="mt-3 text-xs text-slate-500">Publishing validates every block, requires a last-reviewed date and at least one objective, and saves a revision snapshot. Editing blocks of a published lesson updates the live page immediately.</p>
      </section>

      <section aria-labelledby="blocks-h" className="mb-10">
        <h2 id="blocks-h" className="mb-3 text-lg font-semibold">Content blocks ({blocks.length})</h2>
        <ol className="space-y-4">
          {blocks.map((b, i) => {
            const v = validateBlock(b.blockType, b.contentJson);
            return (
              <li key={b.id} className={`card p-4 ${v.ok ? "" : "border-red-300"}`}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    <span className="mr-2 font-mono text-slate-400">{i + 1}</span>
                    {isBlockType(b.blockType) ? BLOCK_LABELS[b.blockType] : b.blockType}
                    {"title" in b.contentJson && typeof b.contentJson.title === "string" && <span className="ml-2 font-normal text-slate-500">· {b.contentJson.title}</span>}
                  </p>
                  <form action={blockAction} className="flex gap-1">
                    <input type="hidden" name="lessonId" value={id} />
                    <input type="hidden" name="blockId" value={b.id} />
                    <button name="op" value="up" className="btn-ghost btn-sm" aria-label="Move block up" disabled={i === 0}><ArrowUp aria-hidden className="h-4 w-4" /></button>
                    <button name="op" value="down" className="btn-ghost btn-sm" aria-label="Move block down" disabled={i === blocks.length - 1}><ArrowDown aria-hidden className="h-4 w-4" /></button>
                    <button name="op" value="delete" className="btn-ghost btn-sm text-red-700" aria-label="Delete block"><Trash2 aria-hidden className="h-4 w-4" /></button>
                  </form>
                </div>
                {!v.ok && <p role="alert" className="mb-2 rounded bg-red-50 p-2 text-xs text-red-800">Invalid: {v.error}</p>}
                <details>
                  <summary className="cursor-pointer text-sm text-brand-700">Edit content</summary>
                  <div className="mt-2"><EditBlockForm lessonId={id} blockId={b.id} blockType={b.blockType} content={b.contentJson} /></div>
                </details>
              </li>
            );
          })}
        </ol>
        <h3 className="mb-2 mt-6 font-semibold">Add a block</h3>
        <AddBlockForm lessonId={id} quizIds={lessonQuizzes.map((q) => ({ id: q.id, title: q.title }))} />
      </section>

      <section aria-labelledby="quiz-h" className="mb-10">
        <h2 id="quiz-h" className="mb-3 text-lg font-semibold">Quizzes</h2>
        <ul className="card divide-y divide-slate-100">
          {lessonQuizzes.map((q) => (
            <li key={q.id} className="flex items-center justify-between p-3 text-sm">
              <Link href={`/admin/quizzes/${q.id}`} className="text-brand-700 underline">{q.title}</Link>
              <span className="text-slate-500">{qCounts.get(q.id)} questions · pass {q.passThreshold}% · id <code className="text-xs">{q.id}</code></span>
            </li>
          ))}
          {!lessonQuizzes.length && <li className="p-3 text-sm text-slate-500">No quizzes yet.</li>}
        </ul>
        <form action={createQuiz} className="mt-3 flex gap-2">
          <input type="hidden" name="lessonId" value={id} />
          <label htmlFor="quiz-title" className="sr-only">Quiz title</label>
          <input id="quiz-title" name="title" placeholder="Quiz title" className="input max-w-xs" />
          <button className="btn-secondary" type="submit">Create quiz</button>
        </form>
      </section>

      <section aria-labelledby="meta-h" className="mb-10">
        <h2 id="meta-h" className="mb-3 text-lg font-semibold">Lesson details</h2>
        <LessonForm lesson={lesson} {...(await lessonFormOptions())} />
      </section>

      <section aria-labelledby="rev-h">
        <h2 id="rev-h" className="mb-3 text-lg font-semibold">Revisions</h2>
        <ul className="card divide-y divide-slate-100">
          {revisions.map((r) => (
            <li key={r.id} className="flex items-center justify-between p-3 text-sm">
              <span>Version {r.version} · {r.createdAt.toLocaleString()}</span>
              <form action={restoreRevision}>
                <input type="hidden" name="revisionId" value={r.id} />
                <button className="btn-ghost btn-sm" type="submit">Restore blocks from this version</button>
              </form>
            </li>
          ))}
          {!revisions.length && <li className="p-3 text-sm text-slate-500">A revision is saved each time the lesson is published.</li>}
        </ul>
      </section>
    </AdminPage>
  );
}
