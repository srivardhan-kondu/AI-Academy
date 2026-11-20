/**
 * Groups a lesson's flat block list into numbered reading sections.
 *
 * A titled block (or a block type that is always its own step, like a quiz)
 * opens a new section; untitled supporting blocks (callouts, images…) attach
 * to the section before them. The result drives the section headings, the
 * table of contents and the "Section N of M" progress bar.
 */

type BlockLike = { id: string; type: string; content?: unknown; invalid?: true };

export type LessonSection<B extends BlockLike = BlockLike> = {
  id: string;
  title: string;
  /** "interactive" sections get an extra pill next to their heading. */
  kind: "reading" | "interactive";
  blocks: B[];
  /** The block whose title became the section heading (its own title is then hidden). */
  headingBlockId: string | null;
};

function titleOf(block: BlockLike): string | undefined {
  if (block.invalid || !block.content || typeof block.content !== "object") return undefined;
  const t = (block.content as { title?: unknown }).title;
  return typeof t === "string" && t.trim() ? t.trim() : undefined;
}

/** Decide whether a block opens a new section, and with what heading. */
function sectionHeading(block: BlockLike): { title: string; kind: LessonSection["kind"]; consumesTitle: boolean } | null {
  if (block.invalid) return null;
  const title = titleOf(block);
  switch (block.type) {
    case "quiz":
      return { title: "Knowledge check", kind: "reading", consumesTitle: false };
    case "summary":
      return { title: "Summary & key terms", kind: "reading", consumesTitle: false };
    case "practice":
      return { title: "Guided practice", kind: "reading", consumesTitle: false };
    case "visualization":
      return { title: title ?? "Interactive lab", kind: "interactive", consumesTitle: true };
    case "callout": {
      const variant = (block.content as { variant?: string }).variant;
      if (variant === "analogy" && title) return { title: `Analogy: ${lowerFirst(title)}`, kind: "reading", consumesTitle: true };
      return null;
    }
    case "rich_text":
    case "diagram":
    case "comparison":
    case "code_example":
      return title ? { title, kind: "reading", consumesTitle: true } : null;
    default:
      return null;
  }
}

function lowerFirst(s: string) {
  // Keep acronyms ("AI", "GPU") intact; lower-case ordinary leading words.
  return /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

export function buildSections<B extends BlockLike>(blocks: B[]): LessonSection<B>[] {
  const sections: LessonSection<B>[] = [];
  const used = new Set<string>();
  const uniqueId = (title: string) => {
    const base = slugify(title);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  for (const block of blocks) {
    const heading = sectionHeading(block);
    if (heading) {
      sections.push({
        id: uniqueId(heading.title),
        title: heading.title,
        kind: heading.kind,
        blocks: [block],
        headingBlockId: heading.consumesTitle ? block.id : null,
      });
    } else if (sections.length) {
      sections[sections.length - 1].blocks.push(block);
    } else {
      sections.push({ id: uniqueId("Introduction"), title: "Introduction", kind: "reading", blocks: [block], headingBlockId: null });
    }
  }
  return sections;
}
