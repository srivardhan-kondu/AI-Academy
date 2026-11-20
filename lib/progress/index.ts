import "server-only";
import { and, desc, eq, inArray, sql, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  lessonProgress,
  lessonBlocks,
  quizAttempts,
  achievements,
  userAchievements,
  userEnrollments,
  learningPaths,
  lessons,
  quizzes,
} from "@/lib/db/schema";
import { getPathModules } from "@/lib/content/queries";

/** Minimum share of the lesson a learner must reach before completion is allowed. */
export const COMPLETION_PROGRESS_THRESHOLD = 80;

export async function getProgress(userId: string, lessonId: string) {
  return (
    (await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
      )[0] ?? null
  );
}

export async function getProgressMap(userId: string, lessonIds?: string[]) {
  const rows = (await db
    .select()
    .from(lessonProgress)
    .where(
      lessonIds?.length
        ? and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds))
        : eq(lessonProgress.userId, userId),
    )
    );
  return new Map(rows.map((r) => [r.lessonId, r]));
}

export async function recordProgress(userId: string, lessonId: string, blockId: string, percent: number) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const existing = await getProgress(userId, lessonId);
  if (!existing) {
    await db.insert(lessonProgress)
      .values({ userId, lessonId, lastBlockId: blockId, progressPercent: pct })
      ;
    return;
  }
  await db.update(lessonProgress)
    .set({
      lastBlockId: blockId,
      progressPercent: Math.max(existing.progressPercent, pct),
      updatedAt: new Date(),
    })
    .where(eq(lessonProgress.id, existing.id))
    ;
}

/** Quiz ids embedded in a lesson's quiz blocks. */
export async function lessonQuizIds(lessonId: string): Promise<string[]> {
  const rows = (await db
    .select({ content: lessonBlocks.contentJson })
    .from(lessonBlocks)
    .where(and(eq(lessonBlocks.lessonId, lessonId), eq(lessonBlocks.blockType, "quiz")))
    );
  return rows.map((r) => (r.content as { quizId?: string }).quizId).filter((x): x is string => !!x);
}

export async function hasPassedQuiz(userId: string, quizId: string) {
  return Boolean(
    (await db
      .select({ id: quizAttempts.id })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId), eq(quizAttempts.passed, true)))
      )[0],
  );
}

/** Completion rule: reached most of the lesson AND passed every quiz in it. */
export async function completionStatus(userId: string, lessonId: string) {
  const progress = await getProgress(userId, lessonId);
  const quizIds = await lessonQuizIds(lessonId);
  const passed = await Promise.all(quizIds.map((q) => hasPassedQuiz(userId, q)));
  const pendingQuizzes = quizIds.filter((_, i) => !passed[i]);
  const reached = (progress?.progressPercent ?? 0) >= COMPLETION_PROGRESS_THRESHOLD;
  return {
    completed: progress?.status === "completed",
    reached,
    pendingQuizzes,
    canComplete: reached && pendingQuizzes.length === 0,
  };
}

export async function completeLesson(userId: string, lessonId: string): Promise<{ ok: boolean; reason?: string }> {
  const status = await completionStatus(userId, lessonId);
  if (status.completed) return { ok: true };
  if (!status.reached) return { ok: false, reason: "Work through the lesson before marking it complete." };
  if (status.pendingQuizzes.length) return { ok: false, reason: "Pass the knowledge check to complete this lesson." };
  await db.update(lessonProgress)
    .set({ status: "completed", progressPercent: 100, completedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    ;
  await updateEnrollmentCompletion(userId);
  await awardAchievements(userId);
  return { ok: true };
}

/* ------------------------------ Enrollments ------------------------------ */

export async function pathProgress(userId: string, pathId: string) {
  const mods = await getPathModules(pathId);
  const lessonIds = mods.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = await getProgressMap(userId, lessonIds);
  const completed = lessonIds.filter((id) => progress.get(id)?.status === "completed").length;
  const nextLesson = mods.flatMap((m) => m.lessons).find((l) => progress.get(l.id)?.status !== "completed") ?? null;
  return {
    total: lessonIds.length,
    completed,
    percent: lessonIds.length ? Math.round((completed / lessonIds.length) * 100) : 0,
    nextLesson,
  };
}

async function updateEnrollmentCompletion(userId: string) {
  const enrolled = (await db.select().from(userEnrollments).where(eq(userEnrollments.userId, userId)));
  for (const e of enrolled) {
    if (e.status !== "active") continue;
    const p = await pathProgress(userId, e.learningPathId);
    if (p.total > 0 && p.completed === p.total) {
      await db.update(userEnrollments).set({ status: "completed" }).where(eq(userEnrollments.id, e.id));
    }
  }
}

export async function getEnrollments(userId: string) {
  const rows = await db
    .select({ enrollment: userEnrollments, path: learningPaths })
    .from(userEnrollments)
    .innerJoin(learningPaths, eq(learningPaths.id, userEnrollments.learningPathId))
    .where(and(eq(userEnrollments.userId, userId), sql`${userEnrollments.status} != 'left'`))
    .orderBy(desc(userEnrollments.enrolledAt));
  return Promise.all(rows.map(async (r) => ({ ...r, progress: await pathProgress(userId, r.path.id) })));
}

export async function isEnrolled(userId: string, pathId: string) {
  return Boolean(
    (await db
      .select({ id: userEnrollments.id })
      .from(userEnrollments)
      .where(
        and(
          eq(userEnrollments.userId, userId),
          eq(userEnrollments.learningPathId, pathId),
          sql`${userEnrollments.status} != 'left'`,
        ),
      )
      )[0],
  );
}

/* ------------------------------ Achievements ------------------------------ */

export async function awardAchievements(userId: string) {
  const all = (await db.select().from(achievements));
  const have = new Set(
    (await db.select({ id: userAchievements.achievementId }).from(userAchievements).where(eq(userAchievements.userId, userId))).map((r) => r.id),
  );
  const lessonsDone =
    (await db.select({ n: count() }).from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed"))))[0]?.n ?? 0;
  const quizzesPassed =
    (await db
      .select({ n: sql<number>`count(distinct ${quizAttempts.quizId})`.mapWith(Number) })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.passed, true)))
      )[0]?.n ?? 0;
  const pathsDone =
    (await db.select({ n: count() }).from(userEnrollments).where(and(eq(userEnrollments.userId, userId), eq(userEnrollments.status, "completed"))))[0]?.n ?? 0;

  for (const a of all) {
    if (have.has(a.id)) continue;
    const c = a.criteriaJson;
    const earned =
      (c.type === "lessons_completed" && lessonsDone >= c.count) ||
      (c.type === "quizzes_passed" && quizzesPassed >= c.count) ||
      (c.type === "path_completed" && pathsDone >= 1);
    if (earned) (await db.insert(userAchievements).values({ userId, achievementId: a.id }).onConflictDoNothing());
  }
}

/* ------------------------------ Dashboard ------------------------------ */

export async function dashboardData(userId: string) {
  const recent = (await db
    .select({ progress: lessonProgress, lesson: lessons })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .where(eq(lessonProgress.userId, userId))
    .orderBy(desc(lessonProgress.updatedAt))
    .limit(20)
    );
  const attempts = (await db
    .select({ attempt: quizAttempts, quizTitle: quizzes.title })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.completedAt))
    .limit(10)
    );
  return {
    continueLesson: recent.find((r) => r.progress.status === "in_progress") ?? null,
    recent,
    completedCount:
      (await db
        .select({ n: count() })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed")))
        )[0]?.n ?? 0,
    attempts,
    enrollments: await getEnrollments(userId),
  };
}
