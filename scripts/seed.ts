import { eq } from "drizzle-orm";
import type { DB } from "../lib/db";
import * as s from "../lib/db/schema";
import { hashPassword } from "../lib/auth/password";
import { validateBlock } from "../lib/lesson/blocks";
import { SCHOOLS, MODULES, PATHS, LABS, ACHIEVEMENTS } from "../content/curriculum";
import { PROJECTS } from "../content/projects";
import { foundationLessons } from "../content/lessons/foundations";
import { mlLessons } from "../content/lessons/machine-learning";
import { genAiLessons } from "../content/lessons/genai";

const REVIEWED = new Date("2026-11-15T00:00:00Z");

export async function seed(db: DB) {
  /* Admin user */
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@academy.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe-Admin-123";
  const adminId = crypto.randomUUID();
  await db.insert(s.users).values({ id: adminId, email, passwordHash: await hashPassword(password), role: "admin" });
  await db.insert(s.userProfiles).values({ userId: adminId, displayName: "Admin" });

  /* Schools */
  const schoolIds = new Map<string, string>();
  for (const sc of SCHOOLS) {
    const row = (await db
      .insert(s.schools)
      .values({ title: sc.title, slug: sc.slug, description: sc.description, level: sc.level, displayOrder: sc.n, outline: [...sc.outline], status: "published" })
      .returning({ id: s.schools.id })
      )[0];
    schoolIds.set(sc.slug, row.id);
  }

  /* Modules */
  const moduleIds = new Map<string, string>();
  for (const m of MODULES) {
    const row = (await db
      .insert(s.modules)
      .values({ schoolId: schoolIds.get(m.school)!, slug: m.slug, title: m.title, description: m.description, difficulty: m.difficulty, displayOrder: m.order, status: "published" })
      .returning({ id: s.modules.id })
      )[0];
    moduleIds.set(m.slug, row.id);
  }

  /* Lessons, blocks and quizzes */
  const lessons = [...foundationLessons, ...mlLessons, ...genAiLessons];
  const lessonIds = new Map<string, string>();
  for (const l of lessons) {
    lessonIds.set(l.slug, crypto.randomUUID());
  }
  for (const l of lessons) {
    const lessonId = lessonIds.get(l.slug)!;
    const moduleId = moduleIds.get(l.module);
    if (!moduleId) throw new Error(`Unknown module ${l.module} for lesson ${l.slug}`);
    const prereqs = (l.prerequisites ?? []).map((p) => {
      const id = lessonIds.get(p);
      if (!id) throw new Error(`Unknown prerequisite ${p} for ${l.slug}`);
      return id;
    });
    await db.insert(s.lessons)
      .values({
        id: lessonId,
        moduleId,
        slug: l.slug,
        title: l.title,
        summary: l.summary,
        difficulty: l.difficulty,
        estimatedMinutes: l.minutes,
        accessTier: l.tier ?? "free",
        learningObjectives: l.objectives,
        prerequisiteLessonIds: prereqs,
        references: l.references,
        displayOrder: l.order,
        status: "published",
        version: 1,
        publishedAt: REVIEWED,
        lastReviewedAt: REVIEWED,
        createdBy: adminId,
        updatedBy: adminId,
      })
      ;

    const quiz = (await db
      .insert(s.quizzes)
      .values({ lessonId, title: l.quiz.title, passThreshold: l.quiz.passThreshold ?? 66 })
      .returning({ id: s.quizzes.id })
      )[0];
    for (const [i, q] of l.quiz.questions.entries()) {
      await db.insert(s.quizQuestions)
        .values({
          quizId: quiz.id,
          questionType: q.type,
          prompt: q.prompt,
          optionsJson: q.type === "true_false" ? ["True", "False"] : q.options!,
          answerKey: q.answer,
          explanation: q.explanation,
          displayOrder: i,
        })
        ;
    }

    const blockRows = l.blocks.map((b, i) => {
      const content = b.type === "quiz" ? { quizId: quiz.id } : b.content;
      const v = validateBlock(b.type, content);
      if (!v.ok) throw new Error(`Invalid ${b.type} block #${i + 1} in ${l.slug}: ${v.error}`);
      return { lessonId, blockType: b.type, displayOrder: i, contentJson: v.content };
    });
    await db.insert(s.lessonBlocks).values(blockRows);
    await db.insert(s.lessonRevisions)
      .values({ lessonId, version: 1, createdBy: adminId, snapshotJson: { lesson: { slug: l.slug, title: l.title }, blocks: blockRows } })
      ;
  }

  /* Learning paths */
  for (const p of PATHS) {
    const path = (await db
      .insert(s.learningPaths)
      .values({
        slug: p.slug,
        title: p.title,
        description: p.description,
        audience: p.audience,
        difficulty: p.difficulty,
        estimatedMinutes: p.minutes,
        prerequisites: [...p.prerequisites],
        learningOutcomes: [...p.outcomes],
        capstone: p.capstone,
        accessTier: p.tier,
        displayOrder: p.order,
        status: "published",
      })
      .returning({ id: s.learningPaths.id })
      )[0];
    for (const [i, m] of p.modules.entries()) {
      await db.insert(s.learningPathModules).values({ learningPathId: path.id, moduleId: moduleIds.get(m)!, displayOrder: i });
    }
  }

  /* Labs */
  for (const [i, lab] of LABS.entries()) {
    await db.insert(s.interactiveComponents)
      .values({ title: lab.title, slug: lab.slug, componentKey: lab.key, concept: lab.concept, description: lab.description, displayOrder: i, status: "published", accessTier: "free" })
      ;
  }

  /* Projects */
  for (const p of PROJECTS) {
    await db.insert(s.projects)
      .values({
        slug: p.slug,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        estimatedHours: p.hours,
        prerequisites: [...p.prerequisites],
        expectedOutcomes: [...p.outcomes],
        instructions: p.instructions,
        accessTier: p.tier,
        displayOrder: p.order,
        status: "published",
      })
      ;
  }

  /* Achievements */
  for (const a of ACHIEVEMENTS) {
    await db.insert(s.achievements).values({ key: a.key, title: a.title, description: a.description, criteriaJson: a.criteria });
  }

  const n = (await db.select().from(s.lessons).where(eq(s.lessons.status, "published"))).length;
  console.log(`• Seeded ${SCHOOLS.length} schools, ${MODULES.length} modules, ${n} lessons, ${PATHS.length} paths, ${LABS.length} labs, ${PROJECTS.length} projects`);
  console.log(`• Admin account: ${email} / ${password}  ← change this password after first sign-in`);
}
