"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import type { BlockContent } from "@/lib/lesson/blocks";

export function PracticeBlock({ content }: { content: BlockContent<"practice"> }) {
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [notes, setNotes] = useState("");
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-800">
        <PenLine aria-hidden className="h-4 w-4" /> Guided practice
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">{content.title}</h3>
      <div className="mt-3">
        <Markdown>{content.task}</Markdown>
      </div>
      <label className="label mt-4" htmlFor={`notes-${content.title}`}>
        Your answer (only stored in this browser tab)
      </label>
      <textarea
        id={`notes-${content.title}`}
        className="input min-h-24"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Work it out here before checking the hints…"
      />
      <div className="mt-4 space-y-2" aria-live="polite">
        {content.hints.slice(0, hintsShown).map((h, i) => (
          <p key={i} className="rounded-lg bg-white p-3 text-sm text-slate-700">
            <strong>Hint {i + 1}:</strong> {h}
          </p>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {hintsShown < content.hints.length && (
          <button type="button" className="btn-secondary" onClick={() => setHintsShown((n) => n + 1)}>
            Show hint {hintsShown + 1} of {content.hints.length}
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={() => setShowSolution((s) => !s)} aria-expanded={showSolution}>
          {showSolution ? "Hide solution" : "Reveal solution"}
        </button>
      </div>
      {showSolution && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-emerald-800">Solution</p>
          <Markdown>{content.solution}</Markdown>
        </div>
      )}
    </div>
  );
}
