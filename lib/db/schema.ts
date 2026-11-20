/**
 * Logical data model from docs/07-database-schema.md, implemented with
 * Drizzle ORM on Neon PostgreSQL.
 */
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  customType,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const createdAt = () => ts("created_at").notNull().defaultNow();
const updatedAt = () =>
  ts("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date());
const json = <T>(name: string) => jsonb(name).$type<T>();
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

export type ContentStatus = "draft" | "published" | "archived";
export type AccessTier = "free" | "premium";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Role = "student" | "editor" | "admin";

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  /** Null for accounts that only sign in with Google. */
  passwordHash: text("password_hash"),
  /** Set when an identity provider (Google) has confirmed the email address. */
  emailVerifiedAt: ts("email_verified_at"),
  role: text("role").$type<Role>().notNull().default("student"),
  createdAt: createdAt(),
});

/** External identities (e.g. Google) linked to a user. */
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").$type<"google">().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("oauth_provider_account_unique").on(t.provider, t.providerAccountId), index("oauth_user_idx").on(t.userId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // SHA-256 of the session token
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: ts("expires_at").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  learningGoal: text("learning_goal"),
  experienceLevel: text("experience_level"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ------------------------------------------------------------------ */
/* Curriculum                                                          */
/* ------------------------------------------------------------------ */

export const schools = pgTable("schools", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  level: integer("level").notNull(), // 1–4
  displayOrder: integer("display_order").notNull().default(0),
  icon: text("icon"),
  coverImage: text("cover_image"),
  outline: json<string[]>("outline").notNull().default(sql`'[]'::jsonb`),
  status: text("status").$type<ContentStatus>().notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const learningPaths = pgTable("learning_paths", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  audience: text("audience").notNull().default(""),
  difficulty: text("difficulty").$type<Difficulty>().notNull().default("beginner"),
  estimatedMinutes: integer("estimated_minutes").notNull().default(0),
  prerequisites: json<string[]>("prerequisites").notNull().default(sql`'[]'::jsonb`),
  learningOutcomes: json<string[]>("learning_outcomes").notNull().default(sql`'[]'::jsonb`),
  capstone: text("capstone").notNull().default(""),
  accessTier: text("access_tier").$type<AccessTier>().notNull().default("free"),
  displayOrder: integer("display_order").notNull().default(0),
  status: text("status").$type<ContentStatus>().notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const modules = pgTable(
  "modules",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    difficulty: text("difficulty").$type<Difficulty>().notNull().default("beginner"),
    displayOrder: integer("display_order").notNull().default(0),
    prerequisites: json<string[]>("prerequisites").notNull().default(sql`'[]'::jsonb`),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("modules_school_idx").on(t.schoolId)],
);

export const learningPathModules = pgTable(
  "learning_path_modules",
  {
    id: id(),
    learningPathId: text("learning_path_id")
      .notNull()
      .references(() => learningPaths.id, { onDelete: "cascade" }),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(0),
    isRequired: boolean("is_required").notNull().default(true),
  },
  (t) => [uniqueIndex("lpm_unique").on(t.learningPathId, t.moduleId)],
);

export type Reference = { title: string; url: string };

export const lessons = pgTable(
  "lessons",
  {
    id: id(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull().default(""),
    difficulty: text("difficulty").$type<Difficulty>().notNull().default("beginner"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(10),
    learningObjectives: json<string[]>("learning_objectives").notNull().default(sql`'[]'::jsonb`),
    prerequisiteLessonIds: json<string[]>("prerequisite_lesson_ids").notNull().default(sql`'[]'::jsonb`),
    references: json<Reference[]>("references").notNull().default(sql`'[]'::jsonb`),
    accessTier: text("access_tier").$type<AccessTier>().notNull().default("free"),
    status: text("status").$type<ContentStatus>().notNull().default("draft"),
    displayOrder: integer("display_order").notNull().default(0),
    version: integer("version").notNull().default(0),
    lastReviewedAt: ts("last_reviewed_at"),
    publishedAt: ts("published_at"),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("lessons_module_idx").on(t.moduleId)],
);

export const lessonBlocks = pgTable(
  "lesson_blocks",
  {
    id: id(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    blockType: text("block_type").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    contentJson: json<Record<string, unknown>>("content_json").notNull(),
    version: integer("version").notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("blocks_lesson_idx").on(t.lessonId)],
);

export const lessonRevisions = pgTable("lesson_revisions", {
  id: id(),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  snapshotJson: json<unknown>("snapshot_json").notNull(),
  createdBy: text("created_by"),
  createdAt: createdAt(),
});

/* ------------------------------------------------------------------ */
/* Interactive content                                                 */
/* ------------------------------------------------------------------ */

export const interactiveComponents = pgTable("interactive_components", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  componentKey: text("component_key").notNull(),
  concept: text("concept").notNull().default(""),
  description: text("description").notNull().default(""),
  configurationSchema: json<Record<string, unknown>>("configuration_schema"),
  accessTier: text("access_tier").$type<AccessTier>().notNull().default("free"),
  displayOrder: integer("display_order").notNull().default(0),
  version: integer("version").notNull().default(1),
  status: text("status").$type<ContentStatus>().notNull().default("draft"),
});

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

export type QuestionType = "single" | "multiple" | "true_false";

export const quizzes = pgTable("quizzes", {
  id: id(),
  lessonId: text("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  passThreshold: integer("pass_threshold").notNull().default(70), // percent
  status: text("status").$type<ContentStatus>().notNull().default("published"),
  createdAt: createdAt(),
});

export const quizQuestions = pgTable(
  "quiz_questions",
  {
    id: id(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    questionType: text("question_type").$type<QuestionType>().notNull(),
    prompt: text("prompt").notNull(),
    optionsJson: json<string[]>("options_json").notNull(),
    /** Indices of correct options. Never sent to the client before submission. */
    answerKey: json<number[]>("answer_key").notNull(),
    explanation: text("explanation").notNull().default(""),
    displayOrder: integer("display_order").notNull().default(0),
    points: integer("points").notNull().default(1),
  },
  (t) => [index("questions_quiz_idx").on(t.quizId)],
);

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    totalPoints: integer("total_points").notNull(),
    passed: boolean("passed").notNull(),
    answersJson: json<Record<string, number[]>>("answers_json").notNull(),
    completedAt: ts("completed_at")
      .notNull()
      .defaultNow(),
  },
  (t) => [index("attempts_user_idx").on(t.userId, t.quizId)],
);

/* ------------------------------------------------------------------ */
/* Students                                                            */
/* ------------------------------------------------------------------ */

export const userEnrollments = pgTable(
  "user_enrollments",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    learningPathId: text("learning_path_id")
      .notNull()
      .references(() => learningPaths.id, { onDelete: "cascade" }),
    enrolledAt: ts("enrolled_at")
      .notNull()
      .defaultNow(),
    status: text("status").$type<"active" | "completed" | "left">().notNull().default("active"),
  },
  (t) => [uniqueIndex("enrollment_unique").on(t.userId, t.learningPathId)],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: text("status").$type<"in_progress" | "completed">().notNull().default("in_progress"),
    progressPercent: integer("progress_percent").notNull().default(0),
    lastBlockId: text("last_block_id"),
    startedAt: ts("started_at")
      .notNull()
      .defaultNow(),
    completedAt: ts("completed_at"),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("progress_unique").on(t.userId, t.lessonId)],
);

export type BookmarkType = "lesson" | "project" | "lab" | "path";

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceType: text("resource_type").$type<BookmarkType>().notNull(),
    resourceId: text("resource_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("bookmark_unique").on(t.userId, t.resourceType, t.resourceId)],
);

export type AchievementCriteria =
  | { type: "lessons_completed"; count: number }
  | { type: "quizzes_passed"; count: number }
  | { type: "path_completed" };

export const achievements = pgTable("achievements", {
  id: id(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  criteriaJson: json<AchievementCriteria>("criteria_json").notNull(),
  icon: text("icon"),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    awardedAt: ts("awarded_at")
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("user_achievement_unique").on(t.userId, t.achievementId)],
);

/* ------------------------------------------------------------------ */
/* Projects and resources                                              */
/* ------------------------------------------------------------------ */

export const projects = pgTable("projects", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  difficulty: text("difficulty").$type<Difficulty>().notNull().default("beginner"),
  estimatedHours: integer("estimated_hours").notNull().default(2),
  prerequisites: json<string[]>("prerequisites").notNull().default(sql`'[]'::jsonb`),
  instructions: text("instructions").notNull().default(""), // markdown
  expectedOutcomes: json<string[]>("expected_outcomes").notNull().default(sql`'[]'::jsonb`),
  sourceUrl: text("source_url"),
  accessTier: text("access_tier").$type<AccessTier>().notNull().default("free"),
  displayOrder: integer("display_order").notNull().default(0),
  status: text("status").$type<ContentStatus>().notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const projectSubmissions = pgTable("project_submissions", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  submissionUrl: text("submission_url").notNull(),
  notes: text("notes"),
  status: text("status").$type<"submitted" | "reviewed" | "needs_changes">().notNull().default("submitted"),
  feedback: text("feedback"),
  submittedAt: ts("submitted_at")
    .notNull()
    .defaultNow(),
});

export const media = pgTable("media", {
  id: id(),
  fileName: text("file_name").notNull(),
  storedName: text("stored_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  altText: text("alt_text"),
  uploadedBy: text("uploaded_by"),
  createdAt: createdAt(),
});

export const resources = pgTable("resources", {
  id: id(),
  title: text("title").notNull(),
  resourceType: text("resource_type").$type<"download" | "link">().notNull(),
  filePathOrUrl: text("file_path_or_url").notNull(),
  description: text("description").notNull().default(""),
  accessTier: text("access_tier").$type<AccessTier>().notNull().default("free"),
  status: text("status").$type<ContentStatus>().notNull().default("draft"),
  lastReviewedAt: ts("last_reviewed_at"),
});

/* ------------------------------------------------------------------ */
/* Commercial and operational                                          */
/* ------------------------------------------------------------------ */

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // e.g. "manual", "stripe"
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    plan: text("plan").notNull().default("premium"),
    status: text("status").$type<"active" | "canceled" | "past_due" | "expired">().notNull(),
    currentPeriodStart: ts("current_period_start").notNull(),
    currentPeriodEnd: ts("current_period_end").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("subscriptions_user_idx").on(t.userId)],
);

export const auditLogs = pgTable("audit_logs", {
  id: id(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: json<Record<string, unknown>>("details"),
  createdAt: createdAt(),
});

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull().default("general"),
  message: text("message").notNull(),
  createdAt: createdAt(),
});

export const searchMisses = pgTable("search_misses", {
  id: id(),
  query: text("query").notNull(),
  createdAt: createdAt(),
});
