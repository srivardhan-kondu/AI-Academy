"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  quizzes,
  quizAttempts,
  bookmarks,
  userEnrollments,
  learningPaths,
  lessonBlocks,
  projects,
  projectSubmissions,
  type BookmarkType,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccess, isStaff } from "@/lib/permissions";
import { getLesson } from "@/lib/content/queries";
import { gradeQuiz, type GradeResult } from "@/lib/assessment/grade";
import { recordProgress, completeLesson, awardAchievements } from "@/lib/progress";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { ActionState } from "@/components/ui/form";

/** Server-side check that a user may interact with a lesson (published + entitled). */
async function accessibleLesson(lessonId: string) {
  const user = await getCurrentUser();
  const lesson = await getLesson({ id: lessonId }, { preview: isStaff(user) });
  if (!lesson || !await canAccess(user, lesson.lesson.accessTier)) return null;
  return { user, lesson };
}

export async function saveProgress(lessonId: string, blockId: string, percent: number) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!rateLimit(`progress:${user.id}`, 120, 60_000)) return;
  if (typeof percent !== "number" || !Number.isFinite(percent)) return;
  const ctx = await accessibleLesson(lessonId);
  if (!ctx) return;
  const block = (await db
    .select({ id: lessonBlocks.id })
    .from(lessonBlocks)
    .where(and(eq(lessonBlocks.id, blockId), eq(lessonBlocks.lessonId, lessonId)))
    )[0];
  if (!block) return;
  await recordProgress(user.id, lessonId, blockId, percent);
}

export async function markLessonComplete(lessonId: string): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Sign in to save your progress." };
  const ctx = await accessibleLesson(lessonId);
  if (!ctx) return { message: "This lesson is not available." };
  const res = await completeLesson(user.id, lessonId);
  if (!res.ok) return { message: res.reason };
  revalidatePath("/dashboard");
  revalidatePath(`/academy/lessons/${ctx.lesson.lesson.slug}`);
  return { ok: true, message: "Lesson complete — nice work!" };
}

const answersSchema = z.record(z.string().max(64), z.array(z.number().int().min(0).max(20)).max(20));

export async function submitQuiz(
  quizId: string,
  answers: Record<string, number[]>,
): Promise<{ error: string } | (GradeResult & { saved: boolean })> {
  const ip = await clientIp();
  const user = await getCurrentUser();
  if (!rateLimit(`quiz:${user?.id ?? ip}`, 30, 10 * 60_000)) {
    return { error: "You're submitting very quickly. Take a moment to review the explanations, then try again." };
  }
  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success) return { error: "Invalid answers." };

  const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, quizId)))[0];
  if (!quiz?.lessonId) return { error: "Quiz not found." };
  const ctx = await accessibleLesson(quiz.lessonId);
  if (!ctx) return { error: "This quiz is not available." };

  const result = await gradeQuiz(quizId, parsed.data);
  if (!result) return { error: "Quiz not found." };

  if (user) {
    await db.insert(quizAttempts)
      .values({
        userId: user.id,
        quizId,
        score: result.score,
        totalPoints: result.totalPoints,
        passed: result.passed,
        answersJson: parsed.data,
      })
      ;
    if (result.passed) await awardAchievements(user.id);
    revalidatePath("/dashboard");
  }
  return { ...result, saved: Boolean(user) };
}

const bookmarkTypes = ["lesson", "project", "lab", "path"] as const;

export async function toggleBookmark(resourceType: BookmarkType, resourceId: string): Promise<{ bookmarked: boolean } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in to save bookmarks." };
  if (!bookmarkTypes.includes(resourceType) || typeof resourceId !== "string" || resourceId.length > 64) {
    return { error: "Invalid bookmark." };
  }
  const existing = (await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.resourceType, resourceType), eq(bookmarks.resourceId, resourceId)))
    )[0];
  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
  } else {
    await db.insert(bookmarks).values({ userId: user.id, resourceType, resourceId });
  }
  revalidatePath("/dashboard/bookmarks");
  return { bookmarked: !existing };
}

export async function enrollInPath(formData: FormData) {
  const user = await getCurrentUser();
  const pathId = String(formData.get("pathId") ?? "");
  const path = (await db.select().from(learningPaths).where(and(eq(learningPaths.id, pathId), eq(learningPaths.status, "published"))))[0];
  if (!user || !path) return;
  const existing = (await db
    .select()
    .from(userEnrollments)
    .where(and(eq(userEnrollments.userId, user.id), eq(userEnrollments.learningPathId, pathId)))
    )[0];
  if (existing) {
    await db.update(userEnrollments).set({ status: "active" }).where(eq(userEnrollments.id, existing.id));
  } else {
    await db.insert(userEnrollments).values({ userId: user.id, learningPathId: pathId });
  }
  revalidatePath(`/academy/paths/${path.slug}`);
  revalidatePath("/dashboard");
}

export async function leavePath(formData: FormData) {
  const user = await getCurrentUser();
  const pathId = String(formData.get("pathId") ?? "");
  if (!user) return;
  await db.update(userEnrollments)
    .set({ status: "left" })
    .where(and(eq(userEnrollments.userId, user.id), eq(userEnrollments.learningPathId, pathId)))
    ;
  revalidatePath("/dashboard");
  revalidatePath("/academy/paths", "layout");
}

const submissionSchema = z.object({
  projectId: z.string().min(1).max(64),
  submissionUrl: z
    .string()
    .trim()
    .url("Enter a valid URL (for example your GitHub repository)")
    .refine((u) => u.startsWith("https://"), "Use an https:// link"),
  notes: z.string().trim().max(2000).optional(),
});

export async function submitProject(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Sign in to submit a project." };
  if (!rateLimit(`submission:${user.id}`, 10, 60 * 60_000)) return { message: "Too many submissions. Please try again later." };
  const parsed = submissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Invalid submission." };
  const project = (await db.select().from(projects).where(and(eq(projects.id, parsed.data.projectId), eq(projects.status, "published"))))[0];
  if (!project) return { message: "Project not found." };
  if (!await canAccess(user, project.accessTier)) return { message: "This project requires Premium." };
  await db.insert(projectSubmissions)
    .values({ userId: user.id, projectId: project.id, submissionUrl: parsed.data.submissionUrl, notes: parsed.data.notes || null })
    ;
  revalidatePath(`/projects/${project.slug}`);
  return { ok: true, message: "Submission received. You'll see feedback here once it's reviewed." };
}
