import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { loadBlocks, getQuizForClient, type ClientQuiz } from "./queries";
import { getProgress, hasPassedQuiz } from "@/lib/progress";
import type { CurrentUser } from "@/lib/auth/session";

/** Everything the lesson page needs beyond the lesson row itself. */
export async function loadLessonPageData(lessonId: string, user: CurrentUser | null) {
  const blocks = await loadBlocks(lessonId);
  const quizzes: Record<string, ClientQuiz> = {};
  for (const b of blocks) {
    if (!("invalid" in b) && b.type === "quiz") {
      const q = await getQuizForClient(b.content.quizId);
      if (q) quizzes[q.id] = q;
    }
  }
  const progress = user ? await getProgress(user.id, lessonId) : null;
  const passedQuizIds = user ? (await Promise.all(Object.keys(quizzes).map(async (id) => ((await hasPassedQuiz(user.id, id)) ? id : null)))).filter((x): x is string => x !== null) : [];
  const bookmarked = user
    ? Boolean(
        (await db
          .select({ id: bookmarks.id })
          .from(bookmarks)
          .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.resourceType, "lesson"), eq(bookmarks.resourceId, lessonId)))
          )[0],
      )
    : false;
  return { blocks, quizzes, progress, passedQuizIds, bookmarked };
}
