"use client";

import { useState } from "react";
import { PenLine, Lightbulb, Eye, EyeOff } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import type { BlockContent } from "@/lib/lesson/blocks";

export function PracticeBlock({ content }: { content: BlockContent<"practice"> }) {
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [notes, setNotes] = useState("");
  return (
    <div className="rounded-[16px] border border-line bg-surface p-6 sm:p-7">
      <p className="flex items-center gap-2 text-[0.9062rem] font-semibold text-brand-2">
        <PenLine aria-hidden strokeWidth={1.5} className="h-4 w-4" /> Try it yourself
      </p>
      <h3 className="mt-1.5 text-[1.375rem] font-semibold text-ink">{content.title}</h3>
      <div className="mt-3">
        <Markdown>{content.task}</Markdown>
      </div>
      <label className="mt-6 mb-2 block text-[0.9062rem] font-medium text-ink-2" htmlFor={`notes-${content.title}`}>
        Your answer <span className="font-normal text-ink-3">(only kept in this browser tab)</span>
      </label>
      <textarea
        id={`notes-${content.title}`}
        className="input min-h-28 font-serif text-[1.125rem] leading-[1.55]"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Work it out here before checking the hints…"
      />
      <div className="mt-4 space-y-2" aria-live="polite">
        {content.hints.slice(0, hintsShown).map((h, i) => (
          <p key={i} className="flex gap-2.5 rounded-[10px] bg-amber-weak px-4 py-3 font-serif text-[1.125rem] leading-[1.5] text-ink">
            <Lightbulb aria-hidden strokeWidth={1.5} className="mt-1 h-4 w-4 shrink-0 text-amber-ink" />
            <span>
              <span className="font-sans text-[0.9688rem] font-semibold text-amber-ink">Hint {i + 1}. </span>
              {h}
            </span>
          </p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {hintsShown < content.hints.length && (
          <button type="button" className="btn-secondary" onClick={() => setHintsShown((n) => n + 1)}>
            <Lightbulb aria-hidden strokeWidth={1.5} className="h-4 w-4" /> Show hint {hintsShown + 1} of {content.hints.length}
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={() => setShowSolution((s) => !s)} aria-expanded={showSolution}>
          {showSolution ? <EyeOff aria-hidden strokeWidth={1.5} className="h-4 w-4" /> : <Eye aria-hidden strokeWidth={1.5} className="h-4 w-4" />}
          {showSolution ? "Hide solution" : "Reveal solution"}
        </button>
      </div>
      {showSolution && (
        <div className="mt-5 rounded-r-[12px] rounded-l-[6px] border border-transparent border-l-[3px] border-l-good bg-good-weak px-5 py-4">
          <p className="mb-1 text-[0.9688rem] font-semibold text-good">Worked solution</p>
          <Markdown>{content.solution}</Markdown>
        </div>
      )}
    </div>
  );
}
