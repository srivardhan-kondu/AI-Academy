import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { quizzes, quizQuestions } from "@/lib/db/schema";

export type QuestionResult = {
  questionId: string;
  correct: boolean;
  correctAnswers: number[];
  explanation: string;
};

export type GradeResult = {
  quizId: string;
  score: number;
  totalPoints: number;
  percent: number;
  passed: boolean;
  passThreshold: number;
  results: QuestionResult[];
};

/** Grade answers on the server. Answer keys never leave this module before submission. */
export async function gradeQuiz(quizId: string, answers: Record<string, number[]>): Promise<GradeResult | null> {
  const quiz = (await db.select().from(quizzes).where(eq(quizzes.id, quizId)))[0];
  if (!quiz) return null;
  const questions = (await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId))
    .orderBy(asc(quizQuestions.displayOrder))
    );

  let score = 0;
  let totalPoints = 0;
  const results: QuestionResult[] = questions.map((q) => {
    totalPoints += q.points;
    const given = [...new Set(answers[q.id] ?? [])].sort((a, b) => a - b);
    const key = [...q.answerKey].sort((a, b) => a - b);
    const correct = given.length === key.length && given.every((v, i) => v === key[i]);
    if (correct) score += q.points;
    return { questionId: q.id, correct, correctAnswers: key, explanation: q.explanation };
  });
  const percent = totalPoints ? Math.round((score / totalPoints) * 100) : 0;
  return {
    quizId,
    score,
    totalPoints,
    percent,
    passed: percent >= quiz.passThreshold,
    passThreshold: quiz.passThreshold,
    results,
  };
}
