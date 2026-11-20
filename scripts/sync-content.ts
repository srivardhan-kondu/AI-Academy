/**
 * Adds new curriculum content to an existing (already seeded) database.
 *
 *   npm run content:sync            # dry run: prints what would change, writes nothing
 *   npm run content:sync -- --apply # apply the changes
 *
 * Safe for live databases:
 *   - Inserts modules and lessons whose slug is not in the database yet.
 *   - Never modifies or deletes existing lessons, so CMS edits are preserved.
 *   - Aligns each learning path's module list and order with content/curriculum.ts
 *     (only for paths that already exist; learner progress is stored per lesson and is unaffected).
 * Each lesson is written in its own transaction.
 */
import { and, eq, inArray } from "drizzle-orm";
import { MODULES, PATHS } from "../content/curriculum";
import { ALL_LESSONS, assertLessonValid, insertLesson } from "./lesson-writer";

async function main() {
  const apply = process.argv.includes("--apply");
  const { db, pool } = await import("../lib/db");
  const s = await import("../lib/db/schema");
  const log = (msg: string) => console.log(`${apply ? "•" : "[dry run]"} ${msg}`);

  // Validate everything before touching the database.
  ALL_LESSONS.forEach(assertLessonValid);

  const schoolIds = new Map((await db.select({ id: s.schools.id, slug: s.schools.slug }).from(s.schools)).map((r) => [r.slug, r.id]));
  const moduleIds = new Map((await db.select({ id: s.modules.id, slug: s.modules.slug }).from(s.modules)).map((r) => [r.slug, r.id]));
  const lessonIds = new Map((await db.select({ id: s.lessons.id, slug: s.lessons.slug }).from(s.lessons)).map((r) => [r.slug, r.id]));
  const admin = (await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.role, "admin")).limit(1))[0];

  /* 1. Modules */
  for (const m of MODULES) {
    if (moduleIds.has(m.slug)) continue;
    const schoolId = schoolIds.get(m.school);
    if (!schoolId) throw new Error(`School ${m.school} for module ${m.slug} is not in the database`);
    log(`add module ${m.slug} (${m.title})`);
    if (apply) {
      const row = (await db
        .insert(s.modules)
        .values({ schoolId, slug: m.slug, title: m.title, description: m.description, difficulty: m.difficulty, displayOrder: m.order, status: "published" })
        .returning({ id: s.modules.id }))[0];
      moduleIds.set(m.slug, row.id);
    } else {
      moduleIds.set(m.slug, `pending:${m.slug}`);
    }
  }

  /* 2. Lessons (new slugs only). Assign ids first so prerequisites can reference new lessons. */
  const newLessons = ALL_LESSONS.filter((l) => !lessonIds.has(l.slug));
  for (const l of newLessons) lessonIds.set(l.slug, crypto.randomUUID());
  for (const l of newLessons) {
    const moduleId = moduleIds.get(l.module);
    if (!moduleId) throw new Error(`Unknown module ${l.module} for lesson ${l.slug}`);
    const prerequisiteIds = (l.prerequisites ?? []).map((p) => {
      const id = lessonIds.get(p);
      if (!id) throw new Error(`Unknown prerequisite ${p} for ${l.slug}`);
      return id;
    });
    log(`add lesson ${l.slug} (${l.blocks.length} blocks, ${l.quiz.questions.length} quiz questions)`);
    if (apply) {
      await db.transaction(async (tx) => {
        await insertLesson(tx, l, { lessonId: lessonIds.get(l.slug)!, moduleId, prerequisiteIds, authorId: admin?.id ?? null });
      });
    }
  }

  /* 3. Learning path module lists */
  const existingPaths = await db.select({ id: s.learningPaths.id, slug: s.learningPaths.slug }).from(s.learningPaths);
  for (const p of PATHS) {
    const path = existingPaths.find((r) => r.slug === p.slug);
    if (!path) {
      log(`skip path ${p.slug}: not in the database (create it in the admin CMS or re-seed)`);
      continue;
    }
    const current = await db
      .select({ moduleId: s.learningPathModules.moduleId, displayOrder: s.learningPathModules.displayOrder })
      .from(s.learningPathModules)
      .where(eq(s.learningPathModules.learningPathId, path.id));
    const wanted = p.modules.map((slug) => {
      const id = moduleIds.get(slug);
      if (!id) throw new Error(`Unknown module ${slug} in path ${p.slug}`);
      return id;
    });
    const same =
      current.length === wanted.length &&
      [...current].sort((a, b) => a.displayOrder - b.displayOrder).every((r, i) => r.moduleId === wanted[i]);
    if (same) continue;

    const slugOf = new Map([...moduleIds].map(([slug, id]) => [id, slug]));
    const before = [...current].sort((a, b) => a.displayOrder - b.displayOrder).map((r) => slugOf.get(r.moduleId) ?? r.moduleId);
    log(`update path ${p.slug}\n    from: ${before.join(", ")}\n    to:   ${p.modules.join(", ")}`);
    if (apply) {
      await db.transaction(async (tx) => {
        const removed = current.map((r) => r.moduleId).filter((id) => !wanted.includes(id));
        if (removed.length) {
          await tx
            .delete(s.learningPathModules)
            .where(and(eq(s.learningPathModules.learningPathId, path.id), inArray(s.learningPathModules.moduleId, removed)));
        }
        for (const [i, moduleId] of wanted.entries()) {
          await tx
            .insert(s.learningPathModules)
            .values({ learningPathId: path.id, moduleId, displayOrder: i })
            .onConflictDoUpdate({
              target: [s.learningPathModules.learningPathId, s.learningPathModules.moduleId],
              set: { displayOrder: i },
            });
        }
      });
    }
  }

  console.log(apply ? "• Sync complete" : "[dry run] Nothing was written. Re-run with --apply to make these changes.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
