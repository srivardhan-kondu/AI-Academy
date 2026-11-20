"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { saveBlock } from "@/app/actions/admin";
import { BLOCK_TEMPLATES, BLOCK_LABELS, BLOCK_TYPES, type BlockType } from "@/lib/lesson/blocks";
import { LAB_KEYS } from "@/lib/lesson/labs";

export function AddBlockForm({ lessonId, quizIds }: { lessonId: string; quizIds: { id: string; title: string }[] }) {
  const [type, setType] = useState<BlockType>("rich_text");
  const template = (t: BlockType) => {
    const tpl = BLOCK_TEMPLATES[t] as Record<string, unknown>;
    return JSON.stringify(t === "quiz" && quizIds[0] ? { quizId: quizIds[0].id } : tpl, null, 2);
  };
  const [content, setContent] = useState(template("rich_text"));
  return (
    <ActionForm action={saveBlock} className="card space-y-3 p-5">
      <input type="hidden" name="lessonId" value={lessonId} />
      <div>
        <label htmlFor="new-block-type" className="label">Block type</label>
        <select
          id="new-block-type"
          name="blockType"
          className="input"
          value={type}
          onChange={(e) => {
            const t = e.target.value as BlockType;
            setType(t);
            setContent(template(t));
          }}
        >
          {BLOCK_TYPES.map((t) => <option key={t} value={t}>{BLOCK_LABELS[t]}</option>)}
        </select>
      </div>
      <BlockHelp type={type} quizIds={quizIds} />
      <div>
        <label htmlFor="new-block-content" className="label">Content (JSON)</label>
        <textarea id="new-block-content" name="content" rows={10} className="input font-mono text-xs" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <SubmitButton>Add block</SubmitButton>
    </ActionForm>
  );
}

export function EditBlockForm({ lessonId, blockId, blockType, content }: { lessonId: string; blockId: string; blockType: string; content: unknown }) {
  return (
    <ActionForm action={saveBlock} className="space-y-2">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="blockId" value={blockId} />
      <input type="hidden" name="blockType" value={blockType} />
      <label htmlFor={`b-${blockId}`} className="sr-only">Block content JSON</label>
      <textarea id={`b-${blockId}`} name="content" rows={Math.min(24, JSON.stringify(content, null, 2).split("\n").length + 1)} className="input font-mono text-xs" defaultValue={JSON.stringify(content, null, 2)} />
      <SubmitButton className="btn-secondary btn-sm">Save block</SubmitButton>
    </ActionForm>
  );
}

function BlockHelp({ type, quizIds }: { type: BlockType; quizIds: { id: string; title: string }[] }) {
  if (type === "visualization") return <p className="text-xs text-slate-600">Available labs: {LAB_KEYS.join(", ")}. A fallback explanation is required.</p>;
  if (type === "quiz")
    return (
      <p className="text-xs text-slate-600">
        {quizIds.length ? <>Quizzes for this lesson: {quizIds.map((q) => `${q.title} (${q.id})`).join(", ")}</> : "Create a quiz for this lesson first (see the Quizzes section below)."}
      </p>
    );
  if (type === "image") return <p className="text-xs text-slate-600">Upload images under Admin → Media and paste the /media/… path. Alt text is required.</p>;
  if (type === "video") return <p className="text-xs text-slate-600">Use a YouTube (youtube-nocookie.com/embed/…) or Vimeo player URL. Add a transcript where possible.</p>;
  if (type === "rich_text" || type === "callout") return <p className="text-xs text-slate-600">Markdown is supported (headings, lists, tables, code). Raw HTML is not rendered.</p>;
  return null;
}
