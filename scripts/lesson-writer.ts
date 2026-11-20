/**
 * Shared helpers for writing seed content to the database.
 * Used by both scripts/seed.ts (fresh databases) and scripts/sync-content.ts (live databases).
 */
import type { DB } from "../lib/db";
import * as s from "../lib/db/schema";
import { validateBlock } from "../lib/lesson/blocks";
import type { SeedLesson } from "../content/types";
import { mlLessons } from "../content/lessons/machine-learning";
import { foundationLessons } from "../content/lessons/foundations";
import { genAiLessons } from "../content/lessons/genai";
import { mlePythonFundamentalsLessons } from "../content/lessons/mle-python-fundamentals";

/** Every authored lesson, in seeding order. Add new lesson files here. */
export const ALL_LESSONS: SeedLesson[] = [
  ...foundationLessons,
  ...mlLessons,
  ...genAiLessons,
  ...mlePythonFundamentalsLessons,
];

export const REVIEWED = new Date("2026-11-15T00:00:00Z");

type Writer = Pick<DB, "insert">;

/** Validates every block up front so bad content fails before anything is written. */
export function assertLessonValid(l: SeedLesson) {
  l.blocks.forEach((b, i) => {
    const content = b.type === "quiz" ? { quizId: "placeholder" } : b.content;
    const v = validateBlock(b.type, content);
    if (!v.ok) throw new Error(`Invalid ${b.type} block #${i + 1} in ${l.slug}: ${v.error}`);
  });
  for (const [i, q] of l.quiz.questions.entries()) {
    const n = q.type === "true_false" ? 2 : (q.options?.length ?? 0);
    if (n < 2) throw new Error(`Quiz question ${i + 1} in ${l.slug} needs at least two options`);
    if (!q.answer.length || q.answer.some((a) => a < 0 || a >= n)) {
      throw new Error(`Quiz question ${i + 1} in ${l.slug} has an out-of-range answer`);
    }
    if (q.type !== "multiple" && q.answer.length !== 1) {
      throw new Error(`Quiz question ${i + 1} in ${l.slug} must have exactly one answer`);
    }
  }
}

/** Inserts one lesson with its quiz, questions, blocks and first revision. */
export async function insertLesson(
  db: Writer,
  l: SeedLesson,
  opts: { lessonId: string; moduleId: string; prerequisiteIds: string[]; authorId: string | null },
) {
  assertLessonValid(l);
  const { lessonId, moduleId, prerequisiteIds, authorId } = opts;

  await db.insert(s.lessons).values({
    id: lessonId,
    moduleId,
    slug: l.slug,
    title: l.title,
    summary: l.summary,
    difficulty: l.difficulty,
    estimatedMinutes: l.minutes,
    accessTier: l.tier ?? "free",
    learningObjectives: l.objectives,
    prerequisiteLessonIds: prerequisiteIds,
    references: l.references,
    displayOrder: l.order,
    status: "published",
    version: 1,
    publishedAt: REVIEWED,
    lastReviewedAt: REVIEWED,
    createdBy: authorId,
    updatedBy: authorId,
  });

  const quiz = (
    await db
      .insert(s.quizzes)
      .values({ lessonId, title: l.quiz.title, passThreshold: l.quiz.passThreshold ?? 66 })
      .returning({ id: s.quizzes.id })
  )[0];
  for (const [i, q] of l.quiz.questions.entries()) {
    await db.insert(s.quizQuestions).values({
      quizId: quiz.id,
      questionType: q.type,
      prompt: q.prompt,
      optionsJson: q.type === "true_false" ? ["True", "False"] : q.options!,
      answerKey: q.answer,
      explanation: q.explanation,
      displayOrder: i,
    });
  }

  const blockRows = l.blocks.map((b, i) => {
    const content = b.type === "quiz" ? { quizId: quiz.id } : b.content;
    const v = validateBlock(b.type, content);
    if (!v.ok) throw new Error(`Invalid ${b.type} block #${i + 1} in ${l.slug}: ${v.error}`);
    return { lessonId, blockType: b.type, displayOrder: i, contentJson: v.content };
  });
  await db.insert(s.lessonBlocks).values(blockRows);
  await db.insert(s.lessonRevisions).values({
    lessonId,
    version: 1,
    createdBy: authorId,
    snapshotJson: { lesson: { slug: l.slug, title: l.title }, blocks: blockRows },
  });
}
