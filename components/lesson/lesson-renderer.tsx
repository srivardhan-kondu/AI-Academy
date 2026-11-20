import type { ComponentType } from "react";
import { AlertOctagon } from "lucide-react";
import type { RenderableBlock, ClientQuiz } from "@/lib/content/queries";
import type { BlockType } from "@/lib/lesson/blocks";
import {
  RichTextBlock,
  CalloutBlock,
  ImageBlock,
  VideoBlock,
  ComparisonBlock,
  ResourceBlock,
  SummaryBlock,
} from "./blocks/editorial";
import { DiagramBlock } from "./blocks/diagram";
import { CodeExampleBlock } from "./blocks/code-example";
import { PracticeBlock } from "./blocks/practice";
import { VisualizationBlock } from "./blocks/visualization";
import { QuizBlock } from "./blocks/quiz";

/**
 * Explicit block registry (docs/05 §9). Quiz blocks are handled separately
 * because they need server-loaded quiz data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lessonBlockRegistry: Record<Exclude<BlockType, "quiz">, ComponentType<{ content: any; hideTitle?: boolean }>> = {
  rich_text: RichTextBlock,
  callout: CalloutBlock,
  image: ImageBlock,
  video: VideoBlock,
  diagram: DiagramBlock,
  comparison: ComparisonBlock,
  visualization: VisualizationBlock,
  code_example: CodeExampleBlock,
  practice: PracticeBlock,
  resource: ResourceBlock,
  summary: SummaryBlock,
};


type RenderCtx = { quizzes: Record<string, ClientQuiz>; passedQuizIds?: string[]; showErrors?: boolean };

/** Renders one block, wrapped with the anchor + data attribute the progress tracker observes. */
export function LessonBlock({ block, hideTitle = false, quizzes, passedQuizIds = [], showErrors = false }: { block: RenderableBlock; hideTitle?: boolean } & RenderCtx) {
  let node: React.ReactNode;
  if ("invalid" in block) {
    node = <UnknownBlock type={block.type} error={block.error} showErrors={showErrors} />;
  } else if (block.type === "quiz") {
    node = <QuizBlock quiz={quizzes[block.content.quizId]} previouslyPassed={passedQuizIds.includes(block.content.quizId)} />;
  } else {
    const Cmp = lessonBlockRegistry[block.type];
    node = Cmp ? <Cmp content={block.content} hideTitle={hideTitle} /> : <UnknownBlock type={block.type} error="Not registered" showErrors={showErrors} />;
  }
  return (
    <div id={`block-${block.id}`} data-block-id={block.id} className="scroll-mt-36">
      {node}
    </div>
  );
}

export function LessonRenderer({ blocks, ...ctx }: { blocks: RenderableBlock[] } & RenderCtx) {
  return (
    <div className="space-y-10">
      {blocks.map((block) => (
        <LessonBlock key={block.id} block={block} {...ctx} />
      ))}
    </div>
  );
}

/** Safe fallback for unknown or invalid blocks. Details are only shown to staff. */
function UnknownBlock({ type, error, showErrors }: { type: string; error: string; showErrors: boolean }) {
  if (!showErrors) {
    return null;
  }
  return (
    <div role="alert" className="rounded-[12px] border border-bad/30 bg-bad-weak p-4 text-sm text-ink">
      <p className="flex items-center gap-2 font-semibold text-bad">
        <AlertOctagon aria-hidden className="h-4 w-4" /> Block could not be rendered ({type})
      </p>
      <p className="mt-1">{error}</p>
      <p className="mt-1 text-xs">Only content administrators see this message. Learners see nothing in its place.</p>
    </div>
  );
}
