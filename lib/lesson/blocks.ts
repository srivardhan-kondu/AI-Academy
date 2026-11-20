/**
 * Strict schemas for every approved lesson block type
 * (docs/05-interactive-learning-engine.md §3, §8, §9).
 *
 * Every block is validated before it is saved, published, or rendered.
 */
import { z } from "zod";
import { LAB_KEYS } from "./labs";

const md = z.string().trim().min(1, "Content cannot be empty").max(20_000);
const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => u.startsWith("https://") || u.startsWith("/"), "URLs must use https:// or be site-relative");
const mediaSrc = z
  .string()
  .trim()
  .refine((u) => u.startsWith("https://") || u.startsWith("/media/") || u.startsWith("/images/"), {
    message: "Images must be https:// URLs or uploaded /media/ files",
  });

export const blockSchemas = {
  rich_text: z.object({
    title: z.string().max(200).optional(),
    markdown: md,
  }),
  callout: z.object({
    variant: z.enum(["key_idea", "analogy", "warning", "misconception", "tip"]),
    title: z.string().max(200).optional(),
    markdown: md,
  }),
  image: z.object({
    src: mediaSrc,
    alt: z.string().trim().min(1, "Alt text is required for accessibility").max(500),
    caption: z.string().max(500).optional(),
  }),
  video: z.object({
    title: z.string().min(1).max(200),
    url: httpsUrl.refine(
      (u) => /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//.test(u),
      "Only YouTube or Vimeo embed URLs are allowed",
    ),
    transcript: z.string().max(20_000).optional(),
  }),
  diagram: z.object({
    title: z.string().max(200).optional(),
    layout: z.enum(["flow", "nested", "cycle"]),
    description: z.string().trim().min(1, "A text description is required for accessibility").max(2000),
    nodes: z
      .array(z.object({ label: z.string().min(1).max(80), detail: z.string().max(300).optional() }))
      .min(2)
      .max(10),
  }),
  comparison: z.object({
    title: z.string().max(200).optional(),
    columns: z.array(z.string().min(1).max(80)).min(2).max(5),
    rows: z
      .array(z.object({ label: z.string().min(1).max(120), values: z.array(z.string().max(300)) }))
      .min(1)
      .max(20),
  }),
  visualization: z.object({
    component: z.enum(LAB_KEYS),
    title: z.string().max(200).optional(),
    objective: z.string().trim().min(1).max(500),
    instructions: z.string().trim().min(1).max(1000),
    fallback: z.string().trim().min(1, "A fallback explanation is required").max(3000),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
  code_example: z.object({
    title: z.string().max(200).optional(),
    language: z.enum(["python", "javascript", "typescript", "bash", "json", "sql", "text"]),
    code: z.string().min(1).max(10_000),
    explanation: z.string().max(5000).optional(),
    expectedOutput: z.string().max(5000).optional(),
  }),
  practice: z.object({
    title: z.string().min(1).max(200),
    task: md,
    hints: z.array(z.string().min(1).max(1000)).max(5).default([]),
    solution: md,
  }),
  quiz: z.object({
    quizId: z.string().min(1, "Select a quiz"),
  }),
  resource: z.object({
    kind: z.enum(["reference", "download", "article", "video", "documentation"]),
    title: z.string().min(1).max(200),
    url: httpsUrl.or(z.string().startsWith("/media/")),
    description: z.string().max(500).optional(),
  }),
  summary: z.object({
    takeaways: z.array(z.string().min(1).max(400)).min(1).max(10),
    terms: z
      .array(z.object({ term: z.string().min(1).max(80), definition: z.string().min(1).max(400) }))
      .max(15)
      .default([]),
    misconceptions: z.array(z.string().min(1).max(400)).max(8).default([]),
  }),
} as const;

export type BlockType = keyof typeof blockSchemas;
export const BLOCK_TYPES = Object.keys(blockSchemas) as BlockType[];

export type BlockContent<T extends BlockType> = z.infer<(typeof blockSchemas)[T]>;

export type ValidBlock = {
  [K in BlockType]: { id: string; type: K; content: BlockContent<K> };
}[BlockType];

export type InvalidBlock = { id: string; type: string; error: string };

export const isBlockType = (t: string): t is BlockType => t in blockSchemas;

export function validateBlock(
  type: string,
  content: unknown,
): { ok: true; content: Record<string, unknown> } | { ok: false; error: string } {
  if (!isBlockType(type)) return { ok: false, error: `Unknown block type "${type}"` };
  const parsed = blockSchemas[type].safeParse(content);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; "),
    };
  }
  return { ok: true, content: parsed.data as Record<string, unknown> };
}

/** Starter content shown in the admin block editor for each type. */
export const BLOCK_TEMPLATES: Record<BlockType, unknown> = {
  rich_text: { title: "Explain it simply", markdown: "Write a plain-English explanation here." },
  callout: { variant: "analogy", title: "Real-world analogy", markdown: "Describe the analogy **and where it stops being accurate**." },
  image: { src: "https://", alt: "Describe the image for screen-reader users", caption: "" },
  video: { title: "Video title", url: "https://www.youtube-nocookie.com/embed/VIDEO_ID", transcript: "" },
  diagram: {
    title: "How it works",
    layout: "flow",
    description: "Text alternative describing the diagram.",
    nodes: [{ label: "Input" }, { label: "Process" }, { label: "Output" }],
  },
  comparison: {
    title: "Comparison",
    columns: ["Option A", "Option B"],
    rows: [{ label: "Strength", values: ["…", "…"] }],
  },
  visualization: {
    component: "gradient_descent",
    title: "Experiment",
    objective: "What the learner should discover.",
    instructions: "What to change and what to watch.",
    fallback: "A written explanation of what the interactive shows, for when it cannot load.",
  },
  code_example: { title: "Worked example", language: "python", code: "print('hello')", explanation: "", expectedOutput: "hello" },
  practice: { title: "Try it yourself", task: "Describe the task.", hints: ["First hint"], solution: "Worked solution." },
  quiz: { quizId: "" },
  resource: { kind: "reference", title: "Further reading", url: "https://", description: "" },
  summary: { takeaways: ["Key takeaway"], terms: [{ term: "Term", definition: "Definition" }], misconceptions: [] },
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  rich_text: "Rich text",
  callout: "Callout / key idea",
  image: "Image",
  video: "Video",
  diagram: "Diagram",
  comparison: "Comparison table",
  visualization: "Interactive lab",
  code_example: "Code example",
  practice: "Guided practice",
  quiz: "Quiz",
  resource: "Resource / reference",
  summary: "Summary",
};
