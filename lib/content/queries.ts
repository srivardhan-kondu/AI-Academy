import "server-only";
import { and, asc, eq, inArray, like, lte, or, sql, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  schools,
  modules,
  lessons,
  lessonBlocks,
  learningPaths,
  learningPathModules,
  quizzes,
  quizQuestions,
  interactiveComponents,
  projects,
} from "@/lib/db/schema";
import { validateBlock, type ValidBlock, type InvalidBlock } from "@/lib/lesson/blocks";

/* Visibility rules: only published content (and lessons whose scheduled publish
 * time has arrived) is ever returned to public pages. */
const lessonVisible = () =>
  and(eq(lessons.status, "published"), lte(lessons.publishedAt, new Date()));

export type LessonCard = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  accessTier: "free" | "premium";
  moduleId: string;
};

const lessonCardCols = {
  id: lessons.id,
  title: lessons.title,
  slug: lessons.slug,
  summary: lessons.summary,
  difficulty: lessons.difficulty,
  estimatedMinutes: lessons.estimatedMinutes,
  accessTier: lessons.accessTier,
  moduleId: lessons.moduleId,
};

/* ------------------------------ Schools ------------------------------ */

export async function listSchools() {
  const rows = (await db
    .select()
    .from(schools)
    .where(eq(schools.status, "published"))
    .orderBy(asc(schools.level), asc(schools.displayOrder))
    );
  const counts = (await db
    .select({ schoolId: modules.schoolId, n: count(lessons.id) })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(and(lessonVisible(), eq(modules.status, "published")))
    .groupBy(modules.schoolId)
    );
  const map = new Map(counts.map((c) => [c.schoolId, c.n]));
  return rows.map((s) => ({ ...s, lessonCount: map.get(s.id) ?? 0 }));
}

export async function getSchool(slug: string) {
  const school = (await db
    .select()
    .from(schools)
    .where(and(eq(schools.slug, slug), eq(schools.status, "published")))
    )[0];
  if (!school) return null;
  const mods = (await db
    .select()
    .from(modules)
    .where(and(eq(modules.schoolId, school.id), eq(modules.status, "published")))
    .orderBy(asc(modules.displayOrder))
    );
  const lessonRows = mods.length
    ? (await db
        .select(lessonCardCols)
        .from(lessons)
        .where(and(lessonVisible(), inArray(lessons.moduleId, mods.map((m) => m.id))))
        .orderBy(asc(lessons.displayOrder))
        )
    : [];
  return {
    school,
    modules: mods.map((m) => ({ ...m, lessons: lessonRows.filter((l) => l.moduleId === m.id) })),
  };
}

/* ------------------------------ Modules ------------------------------ */

export async function getModule(slug: string) {
  const row = (await db
    .select({ module: modules, school: schools })
    .from(modules)
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .where(and(eq(modules.slug, slug), eq(modules.status, "published"), eq(schools.status, "published")))
    )[0];
  if (!row) return null;
  const lessonRows = (await db
    .select(lessonCardCols)
    .from(lessons)
    .where(and(lessonVisible(), eq(lessons.moduleId, row.module.id)))
    .orderBy(asc(lessons.displayOrder))
    );
  return { ...row, lessons: lessonRows };
}

/* ------------------------------ Paths ------------------------------ */

export async function listPaths() {
  const rows = (await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.status, "published"))
    .orderBy(asc(learningPaths.displayOrder))
    );
  const moduleCounts = (await db
    .select({ pathId: learningPathModules.learningPathId, n: count(learningPathModules.id) })
    .from(learningPathModules)
    .groupBy(learningPathModules.learningPathId)
    );
  const map = new Map(moduleCounts.map((c) => [c.pathId, c.n]));
  return rows.map((p) => ({ ...p, moduleCount: map.get(p.id) ?? 0 }));
}

export async function getPathModules(pathId: string) {
  const mods = (await db
    .select({ module: modules, school: schools, order: learningPathModules.displayOrder, isRequired: learningPathModules.isRequired })
    .from(learningPathModules)
    .innerJoin(modules, eq(modules.id, learningPathModules.moduleId))
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .where(and(eq(learningPathModules.learningPathId, pathId), eq(modules.status, "published")))
    .orderBy(asc(learningPathModules.displayOrder))
    );
  const lessonRows = mods.length
    ? (await db
        .select(lessonCardCols)
        .from(lessons)
        .where(and(lessonVisible(), inArray(lessons.moduleId, mods.map((m) => m.module.id))))
        .orderBy(asc(lessons.displayOrder))
        )
    : [];
  return mods.map((m) => ({
    ...m.module,
    school: m.school,
    isRequired: m.isRequired,
    lessons: lessonRows.filter((l) => l.moduleId === m.module.id),
  }));
}

export async function getPath(slug: string) {
  const path = (await db
    .select()
    .from(learningPaths)
    .where(and(eq(learningPaths.slug, slug), eq(learningPaths.status, "published")))
    )[0];
  if (!path) return null;
  return { path, modules: await getPathModules(path.id) };
}

/* ------------------------------ Lessons ------------------------------ */

export type ClientQuestion = {
  id: string;
  questionType: "single" | "multiple" | "true_false";
  prompt: string;
  options: string[];
  points: number;
};
export type ClientQuiz = { id: string; title: string; passThreshold: number; questions: ClientQuestion[] };

/** Quiz data safe for the browser: the answer key is never included. */
export async function getQuizForClient(quizId: string): Promise<ClientQuiz | null> {
  const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, quizId)))[0];
  if (!quiz) return null;
  const questions = (await db
    .select({
      id: quizQuestions.id,
      questionType: quizQuestions.questionType,
      prompt: quizQuestions.prompt,
      options: quizQuestions.optionsJson,
      points: quizQuestions.points,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId))
    .orderBy(asc(quizQuestions.displayOrder))
    );
  return { id: quiz.id, title: quiz.title, passThreshold: quiz.passThreshold, questions };
}

export type RenderableBlock = ValidBlock | (InvalidBlock & { invalid: true });

export async function loadBlocks(lessonId: string): Promise<RenderableBlock[]> {
  const rows = (await db
    .select()
    .from(lessonBlocks)
    .where(eq(lessonBlocks.lessonId, lessonId))
    .orderBy(asc(lessonBlocks.displayOrder))
    );
  return rows.map((r) => {
    const v = validateBlock(r.blockType, r.contentJson);
    if (v.ok) return { id: r.id, type: r.blockType, content: v.content } as ValidBlock;
    return { id: r.id, type: r.blockType, error: v.error, invalid: true as const };
  });
}

/**
 * Load a full lesson. With `preview: true` (staff only — the caller must check),
 * draft and scheduled lessons are returned too.
 */
export async function getLesson(by: { slug: string } | { id: string }, opts: { preview?: boolean } = {}) {
  const where = "slug" in by ? eq(lessons.slug, by.slug) : eq(lessons.id, by.id);
  const row = (await db
    .select({ lesson: lessons, module: modules, school: schools })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .where(opts.preview ? where : and(where, lessonVisible()))
    )[0];
  if (!row) return null;

  const prerequisites = row.lesson.prerequisiteLessonIds.length
    ? (await db
        .select(lessonCardCols)
        .from(lessons)
        .where(and(inArray(lessons.id, row.lesson.prerequisiteLessonIds), lessonVisible()))
        )
    : [];

  const siblings = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(eq(lessons.moduleId, row.module.id), lessonVisible()))
    .orderBy(asc(lessons.displayOrder));
  const index = siblings.findIndex((s) => s.id === row.lesson.id);
  const position = index >= 0 ? { index: index + 1, total: siblings.length } : null;

  return { ...row, prerequisites, position, next: await getNextLesson(row.lesson.id) };
}

/** Next lesson: next in module, otherwise first lesson of the next module in the same school. */
export async function getNextLesson(lessonId: string): Promise<LessonCard | null> {
  const current = (await db.select().from(lessons).where(eq(lessons.id, lessonId)))[0];
  if (!current) return null;
  const mod = (await db.select().from(modules).where(eq(modules.id, current.moduleId)))[0];
  if (!mod) return null;
  const sameModule = (await db
    .select(lessonCardCols)
    .from(lessons)
    .where(and(lessonVisible(), eq(lessons.moduleId, mod.id), sql`${lessons.displayOrder} > ${current.displayOrder}`))
    .orderBy(asc(lessons.displayOrder))
    .limit(1)
    )[0];
  if (sameModule) return sameModule;
  const laterModules = (await db
    .select({ id: modules.id })
    .from(modules)
    .where(and(eq(modules.schoolId, mod.schoolId), eq(modules.status, "published"), sql`${modules.displayOrder} > ${mod.displayOrder}`))
    .orderBy(asc(modules.displayOrder))
    );
  for (const m of laterModules) {
    const first = (await db
      .select(lessonCardCols)
      .from(lessons)
      .where(and(lessonVisible(), eq(lessons.moduleId, m.id)))
      .orderBy(asc(lessons.displayOrder))
      .limit(1)
      )[0];
    if (first) return first;
  }
  return null;
}

export async function listPublishedLessons() {
  return (await db
    .select({ ...lessonCardCols, updatedAt: lessons.updatedAt, moduleTitle: modules.title })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(lessonVisible())
    .orderBy(asc(lessons.title))
    );
}

export async function getLessonCardsByIds(ids: string[]) {
  if (!ids.length) return [];
  return (await db.select(lessonCardCols).from(lessons).where(and(inArray(lessons.id, ids), lessonVisible())));
}

/* ------------------------------ Labs ------------------------------ */

export async function listLabs() {
  return (await db
    .select()
    .from(interactiveComponents)
    .where(eq(interactiveComponents.status, "published"))
    .orderBy(asc(interactiveComponents.displayOrder))
    );
}

export async function getLab(slug: string) {
  const lab = (await db
    .select()
    .from(interactiveComponents)
    .where(and(eq(interactiveComponents.slug, slug), eq(interactiveComponents.status, "published")))
    )[0];
  if (!lab) return null;
  // Lessons that use this lab.
  const usedIn = (await db
    .select({ title: lessons.title, slug: lessons.slug, contentJson: lessonBlocks.contentJson })
    .from(lessonBlocks)
    .innerJoin(lessons, eq(lessons.id, lessonBlocks.lessonId))
    .where(and(eq(lessonBlocks.blockType, "visualization"), lessonVisible()))
    )
    .filter((r) => (r.contentJson as { component?: string }).component === lab.componentKey);
  const firstBlock = usedIn[0]?.contentJson as
    | { objective?: string; instructions?: string; fallback?: string; config?: Record<string, unknown> }
    | undefined;
  return {
    lab,
    usedIn: Array.from(new Map(usedIn.map((u) => [u.slug, { title: u.title, slug: u.slug }])).values()),
    lessonBlock: firstBlock,
  };
}

/* ------------------------------ Projects ------------------------------ */

export async function listProjects() {
  return (await db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.displayOrder))
    );
}

export async function getProject(slug: string) {
  return (
    (await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
      )[0] ?? null
  );
}

/* ------------------------------ Search ------------------------------ */

export type SearchResult = { kind: "School" | "Path" | "Module" | "Lesson" | "Lab" | "Project"; title: string; href: string; snippet: string };

/**
 * Case-insensitive ILIKE search across published content.
 * (On PostgreSQL, replace with full-text search per docs/06 §7.)
 */
export async function searchContent(q: string): Promise<SearchResult[]> {
  const term = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const L = (col: Parameters<typeof like>[0]) => sql`${col} ILIKE ${term} ESCAPE '\\'`;
  const results: SearchResult[] = [];

  (await db.select().from(schools)
    .where(and(eq(schools.status, "published"), or(L(schools.title), L(schools.description))))
    )
    .forEach((s) => results.push({ kind: "School", title: s.title, href: `/academy/schools/${s.slug}`, snippet: s.description }));

  (await db.select().from(learningPaths)
    .where(and(eq(learningPaths.status, "published"), or(L(learningPaths.title), L(learningPaths.description), L(learningPaths.audience))))
    )
    .forEach((p) => results.push({ kind: "Path", title: p.title, href: `/academy/paths/${p.slug}`, snippet: p.description }));

  (await db.select().from(modules)
    .where(and(eq(modules.status, "published"), or(L(modules.title), L(modules.description))))
    )
    .forEach((m) => results.push({ kind: "Module", title: m.title, href: `/academy/modules/${m.slug}`, snippet: m.description }));

  (await db.select().from(lessons)
    .where(and(lessonVisible(), or(L(lessons.title), L(lessons.summary))))
    )
    .forEach((l) => results.push({ kind: "Lesson", title: l.title, href: `/academy/lessons/${l.slug}`, snippet: l.summary }));

  (await db.select().from(interactiveComponents)
    .where(and(eq(interactiveComponents.status, "published"), or(L(interactiveComponents.title), L(interactiveComponents.description), L(interactiveComponents.concept))))
    )
    .forEach((c) => results.push({ kind: "Lab", title: c.title, href: `/labs/${c.slug}`, snippet: c.description }));

  (await db.select().from(projects)
    .where(and(eq(projects.status, "published"), or(L(projects.title), L(projects.description))))
    )
    .forEach((p) => results.push({ kind: "Project", title: p.title, href: `/projects/${p.slug}`, snippet: p.description }));

  const order = { Lesson: 0, Lab: 1, Path: 2, Module: 3, School: 4, Project: 5 } as const;
  return results.sort((a, b) => order[a.kind] - order[b.kind]).slice(0, 50);
}
