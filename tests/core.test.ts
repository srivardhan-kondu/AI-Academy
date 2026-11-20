/**
 * Core business-rule tests. Run with `npm test`.
 * Each run uses a throwaway Postgres schema in the Neon database (dropped afterwards),
 * so real data is never touched.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import { Client } from "pg";

const TEST_SCHEMA = `test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
// A session-level search_path needs a direct (non-pooled) Neon connection.
process.env.DATABASE_URL = (process.env.DATABASE_URL ?? "").replace("-pooler.", ".");
process.env.DATABASE_SCHEMA = TEST_SCHEMA;

async function adminSql(sqlText: string) {
  const c = new Client({ connectionString: process.env.DATABASE_URL!.replace("sslmode=require", "sslmode=verify-full") });
  await c.connect();
  await c.query(sqlText);
  await c.end();
}

type Mods = {
  db: typeof import("../lib/db");
  schema: typeof import("../lib/db/schema");
  blocks: typeof import("../lib/lesson/blocks");
  queries: typeof import("../lib/content/queries");
  grade: typeof import("../lib/assessment/grade");
  progress: typeof import("../lib/progress");
  perms: typeof import("../lib/permissions");
  orm: typeof import("drizzle-orm");
  google: typeof import("../lib/auth/google");
};
let m: Mods;

before(async () => {
  // Apply the migration SQL inside the test schema. drizzle-kit qualifies foreign keys
  // with "public", so rewrite them to point at the test schema instead.
  const dir = path.resolve("drizzle");
  const ddl = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f), "utf8"))
    .join("\n--> statement-breakpoint\n")
    .replaceAll('"public".', `"${TEST_SCHEMA}".`)
    .replaceAll("--> statement-breakpoint", "");
  await adminSql(`CREATE SCHEMA ${TEST_SCHEMA}; SET search_path TO ${TEST_SCHEMA}; ${ddl}`);
  m = {
    db: await import("../lib/db"),
    schema: await import("../lib/db/schema"),
    blocks: await import("../lib/lesson/blocks"),
    queries: await import("../lib/content/queries"),
    grade: await import("../lib/assessment/grade"),
    progress: await import("../lib/progress"),
    perms: await import("../lib/permissions"),
    orm: await import("drizzle-orm"),
    google: await import("../lib/auth/google"),
  };
  const { seed } = await import("../scripts/seed");
  const log = console.log;
  console.log = () => {};
  await seed(m.db.db);
  console.log = log;
});

after(async () => {
  await m?.db.pool.end();
  await adminSql(`DROP SCHEMA IF EXISTS ${TEST_SCHEMA} CASCADE`);
});

async function makeStudent() {
  const id = crypto.randomUUID();
  await m.db.db.insert(m.schema.users).values({ id, email: `${id}@test.local`, passwordHash: "x", role: "student" });
  return { id, email: `${id}@test.local`, role: "student" as const, displayName: "Student" };
}

const lessonBySlug = async (slug: string) => {
  const data = await m.queries.getLesson({ slug });
  assert.ok(data, `lesson ${slug} should be visible`);
  return data.lesson;
};

test("tests run in an isolated schema", async () => {
  const r = await m.db.db.execute(m.orm.sql`select current_schema() as s`);
  assert.equal(r.rows[0].s, TEST_SCHEMA);
});

test("block validation rejects unsafe or incomplete content", () => {
  const { validateBlock } = m.blocks;
  assert.equal(validateBlock("rich_text", { markdown: "Hello" }).ok, true);
  assert.equal(validateBlock("not_a_block", {}).ok, false);
  assert.equal(validateBlock("image", { src: "https://example.com/a.png", alt: "" }).ok, false, "alt text required");
  assert.equal(validateBlock("resource", { kind: "reference", title: "x", url: "javascript:alert(1)" }).ok, false, "javascript: URLs rejected");
  assert.equal(validateBlock("video", { title: "x", url: "https://evil.example.com/embed" }).ok, false, "only approved video hosts");
  assert.equal(validateBlock("visualization", { component: "unknown_lab", objective: "o", instructions: "i", fallback: "f" }).ok, false);
  assert.equal(validateBlock("visualization", { component: "kmeans", objective: "o", instructions: "i" }).ok, false, "fallback required");
});

test("quiz answer keys are never included in client quiz data", async () => {
  const [quiz] = await m.db.db.select().from(m.schema.quizzes).limit(1);
  const client = await m.queries.getQuizForClient(quiz.id);
  assert.ok(client && client.questions.length > 0);
  const json = JSON.stringify(client);
  assert.ok(!json.includes("answerKey") && !json.includes("explanation"), "no answer keys or explanations before submission");
});

test("quizzes are graded on the server", async () => {
  const [quiz] = await m.db.db.select().from(m.schema.quizzes).limit(1);
  const qs = await m.db.db.select().from(m.schema.quizQuestions).where(m.orm.eq(m.schema.quizQuestions.quizId, quiz.id));
  const right = Object.fromEntries(qs.map((q) => [q.id, q.answerKey]));
  const wrong = Object.fromEntries(qs.map((q) => [q.id, [(q.answerKey[0] + 1) % q.optionsJson.length]]));
  const pass = await m.grade.gradeQuiz(quiz.id, right);
  const fail = await m.grade.gradeQuiz(quiz.id, wrong);
  const empty = await m.grade.gradeQuiz(quiz.id, {});
  assert.equal(pass?.passed, true);
  assert.equal(pass?.percent, 100);
  assert.equal(fail?.passed, false);
  assert.equal(empty?.score, 0, "unanswered questions score zero");
});

test("only published, already-live lessons are publicly visible", async () => {
  const { lessons } = m.schema;
  const { eq } = m.orm;
  const slug = "gradient-descent";
  const lesson = await lessonBySlug(slug);

  await m.db.db.update(lessons).set({ status: "draft" }).where(eq(lessons.id, lesson.id));
  assert.equal(await m.queries.getLesson({ slug }), null, "drafts hidden");
  assert.ok(await m.queries.getLesson({ slug }, { preview: true }), "staff preview sees drafts");

  await m.db.db.update(lessons).set({ status: "published", publishedAt: new Date(Date.now() + 86_400_000) }).where(eq(lessons.id, lesson.id));
  assert.equal(await m.queries.getLesson({ slug }), null, "scheduled lessons hidden until their time");
  const results = await m.queries.searchContent("Gradient DESCENT");
  assert.ok(!results.some((r) => r.kind === "Lesson" && r.href.endsWith(`/${slug}`)), "hidden from search too");

  await m.db.db.update(lessons).set({ publishedAt: new Date(Date.now() - 1000) }).where(eq(lessons.id, lesson.id));
  assert.ok(await m.queries.getLesson({ slug }));
  assert.ok((await m.queries.searchContent("Gradient DESCENT")).some((r) => r.kind === "Lesson"), "search is case-insensitive");
});

test("lesson completion requires progress and a passed quiz", async () => {
  const student = await makeStudent();
  const lesson = await lessonBySlug("linear-regression");
  const p = m.progress;

  assert.equal((await p.completeLesson(student.id, lesson.id)).ok, false, "cannot complete without reading");
  const blocks = await m.queries.loadBlocks(lesson.id);
  await p.recordProgress(student.id, lesson.id, blocks.at(-1)!.id, 100);
  assert.equal((await p.completeLesson(student.id, lesson.id)).ok, false, "cannot complete without passing quiz");

  const [quizId] = await p.lessonQuizIds(lesson.id);
  await m.db.db.insert(m.schema.quizAttempts).values({ userId: student.id, quizId, score: 3, totalPoints: 3, passed: true, answersJson: {} });
  assert.equal((await p.completeLesson(student.id, lesson.id)).ok, true);
  assert.equal((await p.getProgress(student.id, lesson.id))?.status, "completed");

  // Progress never moves backwards.
  await p.recordProgress(student.id, lesson.id, blocks[0].id, 5);
  assert.equal((await p.getProgress(student.id, lesson.id))?.progressPercent, 100);

  const earned = await m.db.db.select().from(m.schema.userAchievements).where(m.orm.eq(m.schema.userAchievements.userId, student.id));
  assert.ok(earned.length >= 1, "achievement awarded");
});

test("one user's progress is isolated from another's", async () => {
  const a = await makeStudent();
  const b = await makeStudent();
  const lesson = await lessonBySlug("decision-trees");
  const block = (await m.queries.loadBlocks(lesson.id))[2];
  await m.progress.recordProgress(a.id, lesson.id, block.id, 50);
  assert.equal(await m.progress.getProgress(b.id, lesson.id), null);
});

test("premium entitlement comes only from active, unexpired subscriptions", async () => {
  const s = await makeStudent();
  assert.equal(await m.perms.hasPremium(s), false);
  assert.equal(await m.perms.canAccess(s, "free"), true);
  assert.equal(await m.perms.canAccess(s, "premium"), false);
  assert.equal(await m.perms.canAccess(null, "premium"), false);

  const now = Date.now();
  await m.db.db.insert(m.schema.subscriptions).values({ userId: s.id, provider: "manual", status: "active", currentPeriodStart: new Date(now - 2e9), currentPeriodEnd: new Date(now - 1000) });
  assert.equal(await m.perms.hasPremium(s), false, "expired subscription grants nothing");

  await m.db.db.insert(m.schema.subscriptions).values({ userId: s.id, provider: "manual", status: "active", currentPeriodStart: new Date(now), currentPeriodEnd: new Date(now + 1e9) });
  assert.equal(await m.perms.hasPremium(s), true);
  assert.equal(await m.perms.hasPremium({ ...s, role: "editor" }), true, "staff can access premium for review");
});

test("seeded curriculum matches the launch scope", async () => {
  assert.equal((await m.queries.listSchools()).length, 19);
  assert.equal((await m.queries.listPaths()).length, 5);
  assert.equal((await m.queries.listProjects()).length, 5);
  assert.ok((await m.queries.listLabs()).length >= 10);
  const lessons = await m.queries.listPublishedLessons();
  assert.ok(lessons.length >= 10);
  for (const l of lessons) {
    const blocks = await m.queries.loadBlocks(l.id);
    assert.ok(blocks.every((b) => !("invalid" in b)), `all blocks valid in ${l.slug}`);
    assert.equal((await m.progress.lessonQuizIds(l.id)).length, 1, `${l.slug} has a knowledge check`);
  }
});

test("Google ID-token claims are validated", () => {
  const { validateIdTokenClaims } = m.google;
  const now = 1_800_000_000;
  const good = { iss: "https://accounts.google.com", aud: "client-1", sub: "g-1", exp: now + 600, email: "A@Example.com", email_verified: true, name: "Ada", picture: "https://x/p.png" };
  const p = validateIdTokenClaims(good, "client-1", now);
  assert.equal(p.email, "a@example.com", "email normalised");
  assert.equal(p.emailVerified, true);
  assert.throws(() => validateIdTokenClaims({ ...good, aud: "someone-else" }, "client-1", now), /not issued for this application/);
  assert.throws(() => validateIdTokenClaims({ ...good, iss: "https://evil.example" }, "client-1", now), /issuer/);
  assert.throws(() => validateIdTokenClaims({ ...good, exp: now - 3600 }, "client-1", now), /expired/);
  assert.equal(validateIdTokenClaims({ ...good, picture: "http://insecure" }, "client-1", now).picture, null);
});

test("Google sign-in creates, reuses and safely links accounts", async () => {
  const { upsertGoogleUser } = m.google;
  const { users, sessions, oauthAccounts } = m.schema;
  const { eq } = m.orm;
  const base = { emailVerified: true, name: "New Learner", picture: null };

  // New user
  const created = await upsertGoogleUser({ ...base, sub: "g-new", email: "new@gmail.test" });
  assert.equal(created.isNew, true);
  const [u] = await m.db.db.select().from(users).where(eq(users.id, created.userId));
  assert.equal(u.passwordHash, null);
  assert.equal(u.role, "student", "Google users never get elevated roles");
  assert.ok(u.emailVerifiedAt);

  // Same Google account again -> same user
  const again = await upsertGoogleUser({ ...base, sub: "g-new", email: "new@gmail.test" });
  assert.deepEqual(again, { userId: created.userId, isNew: false });

  // Pre-hijacking protection: an unverified password account with the victim's email
  const attacker = crypto.randomUUID();
  await m.db.db.insert(users).values({ id: attacker, email: "victim@gmail.test", passwordHash: "attacker-hash", role: "student" });
  await m.db.db.insert(sessions).values({ id: `s-${attacker}`, userId: attacker, expiresAt: new Date(Date.now() + 1e9) });
  const linked = await upsertGoogleUser({ ...base, sub: "g-victim", email: "victim@gmail.test" });
  assert.equal(linked.userId, attacker, "linked to the existing account");
  const [after] = await m.db.db.select().from(users).where(eq(users.id, attacker));
  assert.equal(after.passwordHash, null, "unverified password removed");
  assert.equal((await m.db.db.select().from(sessions).where(eq(sessions.userId, attacker))).length, 0, "old sessions revoked");
  assert.equal((await m.db.db.select().from(oauthAccounts).where(eq(oauthAccounts.userId, attacker))).length, 1);

  // Unverified Google emails are refused
  await assert.rejects(upsertGoogleUser({ ...base, emailVerified: false, sub: "g-x", email: "x@gmail.test" }), /not verified/);
});
