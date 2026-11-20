"use server";

/**
 * Admin CMS mutations. Every action re-checks the caller's role on the server
 * and writes an audit log entry (docs/07 §8).
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq, gt, max, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  schools,
  learningPaths,
  learningPathModules,
  modules,
  lessons,
  lessonBlocks,
  lessonRevisions,
  quizzes,
  quizQuestions,
  interactiveComponents,
  projects,
  projectSubmissions,
  users,
  subscriptions,
  media,
  auditLogs,
  type Role,
} from "@/lib/db/schema";
import { requireEditor, requireAdmin, destroyAllSessionsFor, type CurrentUser } from "@/lib/auth/session";
import { validateBlock, isBlockType } from "@/lib/lesson/blocks";
import { slugify } from "@/lib/utils";
import type { ActionState } from "@/components/ui/form";

/* ------------------------------ helpers ------------------------------ */

async function audit(user: CurrentUser, action: string, entityType: string, entityId?: string | null, details?: Record<string, unknown>) {
  await db.insert(auditLogs).values({ userId: user.id, action, entityType, entityId: entityId ?? null, details: details ?? null });
}

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const status = z.enum(["draft", "published", "archived"]);
const tier = z.enum(["free", "premium"]);
const difficulty = z.enum(["beginner", "intermediate", "advanced"]);
const slugField = z
  .string()
  .trim()
  .max(80)
  .transform((s) => slugify(s))
  .refine((s) => s.length > 0, "Slug is required");

function fail(e: unknown): ActionState {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("UNIQUE")) return { message: "That slug is already in use. Choose another." };
  if (msg.includes("FOREIGN KEY")) return { message: "This item is still referenced by other content. Remove those references first." };
  console.error(e);
  return { message: "Something went wrong while saving." };
}

function zodFail(err: z.ZodError): ActionState {
  return {
    message: "Please fix the highlighted fields.",
    errors: Object.fromEntries(err.issues.map((i) => [String(i.path.join(".") || "form"), i.message])),
  };
}

const refresh = () => revalidatePath("/", "layout");

/* ------------------------------ Schools ------------------------------ */

const schoolSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: slugField,
  description: z.string().trim().max(2000),
  level: z.coerce.number().int().min(1).max(4),
  displayOrder: z.coerce.number().int().min(0).max(999),
  status,
});

export async function saveSchool(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const parsed = schoolSchema.safeParse({ ...Object.fromEntries(fd), slug: fd.get("slug") || fd.get("title") });
  if (!parsed.success) return zodFail(parsed.error);
  const values = { ...parsed.data, outline: lines(fd.get("outline")) };
  let newId = id;
  try {
    if (id) (await db.update(schools).set(values).where(eq(schools.id, id)));
    else newId = (await db.insert(schools).values(values).returning({ id: schools.id }))[0].id;
  } catch (e) {
    return fail(e);
  }
  await audit(user, id ? "update" : "create", "school", newId, { title: values.title, status: values.status });
  refresh();
  if (!id) redirect(`/admin/schools/${newId}`);
  return { ok: true, message: "School saved." };
}

/* ------------------------------ Modules ------------------------------ */

const moduleSchema = z.object({
  schoolId: z.string().min(1, "Choose a school"),
  title: z.string().trim().min(1).max(120),
  slug: slugField,
  description: z.string().trim().max(2000),
  difficulty,
  displayOrder: z.coerce.number().int().min(0).max(999),
  status,
});

export async function saveModule(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const parsed = moduleSchema.safeParse({ ...Object.fromEntries(fd), slug: fd.get("slug") || fd.get("title") });
  if (!parsed.success) return zodFail(parsed.error);
  const values = { ...parsed.data, prerequisites: lines(fd.get("prerequisites")) };
  let newId = id;
  try {
    if (id) (await db.update(modules).set(values).where(eq(modules.id, id)));
    else newId = (await db.insert(modules).values(values).returning({ id: modules.id }))[0].id;
  } catch (e) {
    return fail(e);
  }
  await audit(user, id ? "update" : "create", "module", newId, { title: values.title });
  refresh();
  if (!id) redirect(`/admin/modules/${newId}`);
  return { ok: true, message: "Module saved." };
}

/* ------------------------------ Paths ------------------------------ */

const pathSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: slugField,
  description: z.string().trim().max(2000),
  audience: z.string().trim().max(500),
  difficulty,
  estimatedMinutes: z.coerce.number().int().min(0).max(100_000),
  capstone: z.string().trim().max(1000),
  accessTier: tier,
  displayOrder: z.coerce.number().int().min(0).max(999),
  status,
});

export async function savePath(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const parsed = pathSchema.safeParse({ ...Object.fromEntries(fd), slug: fd.get("slug") || fd.get("title") });
  if (!parsed.success) return zodFail(parsed.error);
  const values = { ...parsed.data, prerequisites: lines(fd.get("prerequisites")), learningOutcomes: lines(fd.get("learningOutcomes")) };
  let newId = id;
  try {
    if (id) (await db.update(learningPaths).set(values).where(eq(learningPaths.id, id)));
    else newId = (await db.insert(learningPaths).values(values).returning({ id: learningPaths.id }))[0].id;
  } catch (e) {
    return fail(e);
  }
  await audit(user, id ? "update" : "create", "learning_path", newId, { title: values.title });
  refresh();
  if (!id) redirect(`/admin/paths/${newId}`);
  return { ok: true, message: "Path saved." };
}

async function renumberPathModules(pathId: string) {
  const rows = (await db.select().from(learningPathModules).where(eq(learningPathModules.learningPathId, pathId)).orderBy(asc(learningPathModules.displayOrder)));
  for (const [i, r] of rows.entries()) await db.update(learningPathModules).set({ displayOrder: i }).where(eq(learningPathModules.id, r.id));
  return rows;
}

export async function pathModuleAction(fd: FormData) {
  const user = await requireEditor();
  const pathId = String(fd.get("pathId") ?? "");
  const op = String(fd.get("op") ?? "");
  const rowId = String(fd.get("rowId") ?? "");
  if (op === "add") {
    const moduleId = String(fd.get("moduleId") ?? "");
    const next = ((await db.select({ m: max(learningPathModules.displayOrder) }).from(learningPathModules).where(eq(learningPathModules.learningPathId, pathId)))[0]?.m ?? -1) + 1;
    await db.insert(learningPathModules).values({ learningPathId: pathId, moduleId, displayOrder: next, isRequired: fd.get("isRequired") !== "off" }).onConflictDoNothing();
  } else if (op === "remove") {
    await db.delete(learningPathModules).where(and(eq(learningPathModules.id, rowId), eq(learningPathModules.learningPathId, pathId)));
  } else if (op === "toggle") {
    const row = (await db.select().from(learningPathModules).where(eq(learningPathModules.id, rowId)))[0];
    if (row) (await db.update(learningPathModules).set({ isRequired: !row.isRequired }).where(eq(learningPathModules.id, rowId)));
  } else if (op === "up" || op === "down") {
    const rows = await renumberPathModules(pathId);
    const i = rows.findIndex((r) => r.id === rowId);
    const j = op === "up" ? i - 1 : i + 1;
    if (i >= 0 && j >= 0 && j < rows.length) {
      await db.update(learningPathModules).set({ displayOrder: j }).where(eq(learningPathModules.id, rows[i].id));
      await db.update(learningPathModules).set({ displayOrder: i }).where(eq(learningPathModules.id, rows[j].id));
    }
  }
  await renumberPathModules(pathId);
  await audit(user, `path_module_${op}`, "learning_path", pathId);
  refresh();
}

/* ------------------------------ Lessons ------------------------------ */

const lessonSchema = z.object({
  moduleId: z.string().min(1, "Choose a module"),
  title: z.string().trim().min(1).max(160),
  slug: slugField,
  summary: z.string().trim().max(1000),
  difficulty,
  estimatedMinutes: z.coerce.number().int().min(1).max(600),
  accessTier: tier,
  displayOrder: z.coerce.number().int().min(0).max(999),
  lastReviewedAt: z
    .string()
    .optional()
    .transform((s) => (s ? new Date(s) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Invalid date"),
});

function parseReferences(v: FormDataEntryValue | null) {
  const out: { title: string; url: string }[] = [];
  for (const line of lines(v)) {
    const [title, url] = line.split("|").map((s) => s.trim());
    if (!url || !/^https:\/\//.test(url)) throw new Error(`Reference must be "Title | https://url": ${line}`);
    out.push({ title, url });
  }
  return out;
}

export async function saveLesson(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const parsed = lessonSchema.safeParse({ ...Object.fromEntries(fd), slug: fd.get("slug") || fd.get("title") });
  if (!parsed.success) return zodFail(parsed.error);
  let references;
  try {
    references = parseReferences(fd.get("references"));
  } catch (e) {
    return { message: (e as Error).message };
  }
  const values = {
    ...parsed.data,
    learningObjectives: lines(fd.get("learningObjectives")),
    prerequisiteLessonIds: fd.getAll("prerequisiteLessonIds").map(String).filter((x) => x && x !== id),
    references,
    updatedBy: user.id,
  };
  let newId = id;
  try {
    if (id) (await db.update(lessons).set(values).where(eq(lessons.id, id)));
    else newId = (await db.insert(lessons).values({ ...values, createdBy: user.id, status: "draft" }).returning({ id: lessons.id }))[0].id;
  } catch (e) {
    return fail(e);
  }
  await audit(user, id ? "update" : "create", "lesson", newId, { title: values.title });
  refresh();
  if (!id) redirect(`/admin/lessons/${newId}`);
  return { ok: true, message: "Lesson details saved." };
}

/** Publish (now or scheduled), unpublish, or archive a lesson. Publishing validates every block. */
export async function setLessonStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const op = String(fd.get("op") ?? "");
  const lesson = (await db.select().from(lessons).where(eq(lessons.id, id)))[0];
  if (!lesson) return { message: "Lesson not found." };

  if (op === "unpublish" || op === "archive") {
    await db.update(lessons).set({ status: op === "archive" ? "archived" : "draft", updatedBy: user.id }).where(eq(lessons.id, id));
    await audit(user, op, "lesson", id);
    refresh();
    return { ok: true, message: op === "archive" ? "Lesson archived." : "Lesson unpublished (now a draft)." };
  }

  if (op !== "publish" && op !== "schedule") return { message: "Unknown action." };

  // Pre-publication checks (docs/09 §3).
  const blocks = (await db.select().from(lessonBlocks).where(eq(lessonBlocks.lessonId, id)).orderBy(asc(lessonBlocks.displayOrder)));
  const problems: Record<string, string> = {};
  if (blocks.length === 0) problems.blocks = "Add at least one content block.";
  for (const [i, b] of blocks.entries()) {
    const v = validateBlock(b.blockType, b.contentJson);
    if (!v.ok) problems[`block ${i + 1} (${b.blockType})`] = v.error;
    if (v.ok && b.blockType === "quiz") {
      const quizId = (b.contentJson as { quizId: string }).quizId;
      const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, quizId)))[0];
      if (!quiz) problems[`block ${i + 1} (quiz)`] = "Referenced quiz does not exist.";
      else if (!(await db.select({ id: quizQuestions.id }).from(quizQuestions).where(eq(quizQuestions.quizId, quizId)))[0])
        problems[`block ${i + 1} (quiz)`] = "Quiz has no questions.";
    }
  }
  if (!lesson.lastReviewedAt) problems.lastReviewedAt = "Set a last-reviewed date before publishing.";
  if (lesson.learningObjectives.length === 0) problems.learningObjectives = "Add at least one learning objective.";
  if (Object.keys(problems).length) return { message: "This lesson can't be published yet:", errors: problems };

  let publishedAt = new Date();
  if (op === "schedule") {
    const when = new Date(String(fd.get("publishAt") ?? ""));
    if (Number.isNaN(when.getTime()) || when <= new Date()) return { message: "Choose a future date and time to schedule publication." };
    publishedAt = when;
  }
  const version = lesson.version + 1;
  await db.transaction(async (tx) => {
    await tx.update(lessons).set({ status: "published", publishedAt, version, updatedBy: user.id }).where(eq(lessons.id, id));
    await tx.insert(lessonRevisions)
      .values({ lessonId: id, version, createdBy: user.id, snapshotJson: { lesson: { ...lesson, version }, blocks } })
      ;
  });
  await audit(user, op, "lesson", id, { version, publishedAt: publishedAt.toISOString() });
  refresh();
  return { ok: true, message: op === "schedule" ? `Scheduled for ${publishedAt.toLocaleString()}.` : `Published (version ${version}).` };
}

export async function restoreRevision(fd: FormData) {
  const user = await requireEditor();
  const revId = String(fd.get("revisionId") ?? "");
  const rev = (await db.select().from(lessonRevisions).where(eq(lessonRevisions.id, revId)))[0];
  if (!rev) return;
  const snap = rev.snapshotJson as { blocks: { blockType: string; displayOrder: number; contentJson: Record<string, unknown> }[] };
  await db.transaction(async (tx) => {
    await tx.delete(lessonBlocks).where(eq(lessonBlocks.lessonId, rev.lessonId));
    for (const b of snap.blocks) {
      await tx.insert(lessonBlocks).values({ lessonId: rev.lessonId, blockType: b.blockType, displayOrder: b.displayOrder, contentJson: b.contentJson });
    }
  });
  await audit(user, "restore_revision", "lesson", rev.lessonId, { version: rev.version });
  refresh();
}

/* ------------------------------ Blocks ------------------------------ */

function parseJson(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
}

export async function saveBlock(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const lessonId = String(fd.get("lessonId") ?? "");
  const blockId = String(fd.get("blockId") ?? "");
  const type = String(fd.get("blockType") ?? "");
  if (!isBlockType(type)) return { message: `Unsupported block type "${type}".` };
  const json = parseJson(String(fd.get("content") ?? ""));
  if (!json.ok) return { message: json.error };
  const v = validateBlock(type, json.value);
  if (!v.ok) return { message: "Block content is invalid:", errors: { content: v.error } };
  if (type === "quiz") {
    const quizId = (v.content as { quizId: string }).quizId;
    if (!(await db.select({ id: quizzes.id }).from(quizzes).where(eq(quizzes.id, quizId)))[0]) return { message: "Quiz not found. Create the quiz first and use its ID." };
  }
  if (blockId) {
    const existing = (await db.select().from(lessonBlocks).where(and(eq(lessonBlocks.id, blockId), eq(lessonBlocks.lessonId, lessonId))))[0];
    if (!existing) return { message: "Block not found." };
    await db.update(lessonBlocks).set({ contentJson: v.content, blockType: type, version: existing.version + 1 }).where(eq(lessonBlocks.id, blockId));
  } else {
    const next = ((await db.select({ m: max(lessonBlocks.displayOrder) }).from(lessonBlocks).where(eq(lessonBlocks.lessonId, lessonId)))[0]?.m ?? -1) + 1;
    await db.insert(lessonBlocks).values({ lessonId, blockType: type, contentJson: v.content, displayOrder: next });
  }
  await db.update(lessons).set({ updatedBy: user.id }).where(eq(lessons.id, lessonId));
  await audit(user, blockId ? "update_block" : "add_block", "lesson", lessonId, { type });
  refresh();
  return { ok: true, message: blockId ? "Block saved." : "Block added." };
}

export async function blockAction(fd: FormData) {
  const user = await requireEditor();
  const lessonId = String(fd.get("lessonId") ?? "");
  const blockId = String(fd.get("blockId") ?? "");
  const op = String(fd.get("op") ?? "");
  const rows = (await db.select().from(lessonBlocks).where(eq(lessonBlocks.lessonId, lessonId)).orderBy(asc(lessonBlocks.displayOrder)));
  const i = rows.findIndex((r) => r.id === blockId);
  if (i < 0) return;
  if (op === "delete") {
    await db.delete(lessonBlocks).where(eq(lessonBlocks.id, blockId));
    rows.splice(i, 1);
  } else if (op === "up" || op === "down") {
    const j = op === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= rows.length) return;
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  for (const [idx, r] of rows.entries()) await db.update(lessonBlocks).set({ displayOrder: idx }).where(eq(lessonBlocks.id, r.id));
  await audit(user, `block_${op}`, "lesson", lessonId);
  refresh();
}

/* ------------------------------ Quizzes ------------------------------ */

export async function createQuiz(fd: FormData) {
  const user = await requireEditor();
  const lessonId = String(fd.get("lessonId") ?? "");
  const title = String(fd.get("title") ?? "").trim() || "Knowledge check";
  const quiz = (await db.insert(quizzes).values({ lessonId, title }).returning({ id: quizzes.id }))[0];
  await audit(user, "create", "quiz", quiz.id, { lessonId });
  redirect(`/admin/quizzes/${quiz.id}`);
}

export async function saveQuiz(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const parsed = z
    .object({ title: z.string().trim().min(1).max(160), passThreshold: z.coerce.number().int().min(1).max(100) })
    .safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodFail(parsed.error);
  await db.update(quizzes).set(parsed.data).where(eq(quizzes.id, id));
  await audit(user, "update", "quiz", id);
  return { ok: true, message: "Quiz saved." };
}

const questionSchema = z
  .object({
    questionType: z.enum(["single", "multiple", "true_false"]),
    prompt: z.string().trim().min(1).max(1000),
    explanation: z.string().trim().min(1, "Explain the answer — learners see this after submitting").max(2000),
    points: z.coerce.number().int().min(1).max(10),
  });

export async function saveQuestion(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const quizId = String(fd.get("quizId") ?? "");
  const questionId = String(fd.get("questionId") ?? "");
  const parsed = questionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodFail(parsed.error);
  const options = parsed.data.questionType === "true_false" ? ["True", "False"] : lines(fd.get("options"));
  if (options.length < 2 || options.length > 8) return { message: "Provide between 2 and 8 options (one per line)." };
  const answerKey = String(fd.get("answers") ?? "")
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((n) => Number(n) - 1);
  if (!answerKey.length || answerKey.some((n) => !Number.isInteger(n) || n < 0 || n >= options.length))
    return { message: `Correct answers must be option numbers between 1 and ${options.length}.` };
  if (parsed.data.questionType !== "multiple" && answerKey.length !== 1) return { message: "Single-answer questions need exactly one correct option." };
  const values = { ...parsed.data, optionsJson: options, answerKey: [...new Set(answerKey)] };
  if (questionId) {
    await db.update(quizQuestions).set(values).where(and(eq(quizQuestions.id, questionId), eq(quizQuestions.quizId, quizId)));
  } else {
    const next = ((await db.select({ m: max(quizQuestions.displayOrder) }).from(quizQuestions).where(eq(quizQuestions.quizId, quizId)))[0]?.m ?? -1) + 1;
    await db.insert(quizQuestions).values({ ...values, quizId, displayOrder: next });
  }
  await audit(user, questionId ? "update_question" : "add_question", "quiz", quizId);
  return { ok: true, message: "Question saved." };
}

export async function deleteQuestion(fd: FormData) {
  const user = await requireEditor();
  const id = String(fd.get("questionId") ?? "");
  const quizId = String(fd.get("quizId") ?? "");
  await db.delete(quizQuestions).where(and(eq(quizQuestions.id, id), eq(quizQuestions.quizId, quizId)));
  await audit(user, "delete_question", "quiz", quizId);
  revalidatePath(`/admin/quizzes/${quizId}`);
}

/* ------------------------------ Labs ------------------------------ */

export async function saveLab(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const parsed = z
    .object({ title: z.string().trim().min(1).max(120), concept: z.string().trim().max(120), description: z.string().trim().max(1000), accessTier: tier, status, displayOrder: z.coerce.number().int().min(0).max(999) })
    .safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodFail(parsed.error);
  await db.update(interactiveComponents).set(parsed.data).where(eq(interactiveComponents.id, id));
  await audit(user, "update", "interactive_component", id);
  refresh();
  return { ok: true, message: "Lab saved." };
}

/* ------------------------------ Projects ------------------------------ */

const projectSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slugField,
  description: z.string().trim().max(1000),
  difficulty,
  estimatedHours: z.coerce.number().int().min(1).max(200),
  instructions: z.string().max(30_000),
  sourceUrl: z.string().trim().max(500).refine((u) => !u || u.startsWith("https://"), "Use an https:// URL").optional(),
  accessTier: tier,
  displayOrder: z.coerce.number().int().min(0).max(999),
  status,
});

export async function saveProject(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const parsed = projectSchema.safeParse({ ...Object.fromEntries(fd), slug: fd.get("slug") || fd.get("title") });
  if (!parsed.success) return zodFail(parsed.error);
  const values = { ...parsed.data, sourceUrl: parsed.data.sourceUrl || null, prerequisites: lines(fd.get("prerequisites")), expectedOutcomes: lines(fd.get("expectedOutcomes")) };
  let newId = id;
  try {
    if (id) (await db.update(projects).set(values).where(eq(projects.id, id)));
    else newId = (await db.insert(projects).values(values).returning({ id: projects.id }))[0].id;
  } catch (e) {
    return fail(e);
  }
  await audit(user, id ? "update" : "create", "project", newId);
  refresh();
  if (!id) redirect(`/admin/projects/${newId}`);
  return { ok: true, message: "Project saved." };
}

export async function reviewSubmission(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const id = String(fd.get("submissionId") ?? "");
  const parsed = z.object({ status: z.enum(["submitted", "reviewed", "needs_changes"]), feedback: z.string().trim().max(5000) }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodFail(parsed.error);
  await db.update(projectSubmissions).set({ status: parsed.data.status, feedback: parsed.data.feedback || null }).where(eq(projectSubmissions.id, id));
  await audit(user, "review", "project_submission", id, { status: parsed.data.status });
  return { ok: true, message: "Feedback saved." };
}

/* ------------------------------ Users (admin only) ------------------------------ */

export async function setUserRole(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get("userId") ?? "");
  const role = String(fd.get("role") ?? "") as Role;
  if (!["student", "editor", "admin"].includes(role)) return;
  if (id === admin.id && role !== "admin") {
    const others = (await db.select({ id: users.id }).from(users).where(and(eq(users.role, "admin"), ne(users.id, admin.id))));
    if (!others.length) return; // never remove the last admin
  }
  await db.update(users).set({ role }).where(eq(users.id, id));
  await destroyAllSessionsFor(id); // force re-authentication with new privileges
  await audit(admin, "set_role", "user", id, { role });
  revalidatePath("/admin/users");
}

/** Manual premium grant (until a payment provider is integrated). Server-side entitlement only. */
export async function setPremium(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get("userId") ?? "");
  const grant = fd.get("grant") === "1";
  if (grant) {
    const now = new Date();
    const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    await db.insert(subscriptions).values({ userId: id, provider: "manual", plan: "premium", status: "active", currentPeriodStart: now, currentPeriodEnd: end });
  } else {
    await db.update(subscriptions)
      .set({ status: "canceled", currentPeriodEnd: new Date() })
      .where(and(eq(subscriptions.userId, id), eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, new Date())))
      ;
  }
  await audit(admin, grant ? "grant_premium" : "revoke_premium", "user", id);
  revalidatePath("/admin/users");
}

/* ------------------------------ Media ------------------------------ */

const ALLOWED_MEDIA: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};
const MAX_BYTES = 5 * 1024 * 1024;

function sniff(buf: Buffer): string | null {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.subarray(0, 3).toString() === "GIF") return "image/gif";
  if (buf.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  return null;
}

export async function uploadMedia(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireEditor();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { message: "Choose a file to upload." };
  if (file.size > MAX_BYTES) return { message: "Files must be 5 MB or smaller." };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf); // trust file contents, not the browser-provided type; bytes are stored in Neon
  if (!type || !ALLOWED_MEDIA[type]) return { message: "Only PNG, JPEG, WebP, GIF and PDF files are allowed." };
  const storedName = `${crypto.randomUUID()}.${ALLOWED_MEDIA[type]}`;
  await db.insert(media)
    .values({ fileName: file.name.slice(0, 200), storedName, mimeType: type, data: buf, size: file.size, altText: String(fd.get("altText") ?? "").slice(0, 500) || null, uploadedBy: user.id })
    ;
  await audit(user, "upload", "media", storedName, { fileName: file.name });
  revalidatePath("/admin/media");
  return { ok: true, message: `Uploaded. Use /media/${storedName} in image or resource blocks.` };
}

export async function deleteMedia(fd: FormData) {
  const user = await requireEditor();
  const id = String(fd.get("id") ?? "");
  const row = (await db.select().from(media).where(eq(media.id, id)))[0];
  if (!row) return;
  await db.delete(media).where(eq(media.id, id));
  await audit(user, "delete", "media", row.storedName);
  revalidatePath("/admin/media");
}
