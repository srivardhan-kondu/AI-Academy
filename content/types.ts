import type { BlockType } from "@/lib/lesson/blocks";

export type SeedBlock = { type: BlockType; content: Record<string, unknown> };
export type SeedQuestion = {
  type: "single" | "multiple" | "true_false";
  prompt: string;
  options?: string[];
  answer: number[]; // zero-based indices
  explanation: string;
};
export type SeedLesson = {
  slug: string;
  module: string;
  order: number;
  title: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  minutes: number;
  tier?: "free" | "premium";
  objectives: string[];
  prerequisites?: string[]; // lesson slugs
  references: { title: string; url: string }[];
  blocks: SeedBlock[]; // use { type: "quiz", content: { quizId: "$QUIZ" } } as the quiz placeholder
  quiz: { title: string; passThreshold?: number; questions: SeedQuestion[] };
};
