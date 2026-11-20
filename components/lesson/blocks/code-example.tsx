"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import type { BlockContent } from "@/lib/lesson/blocks";

export function CodeExampleBlock({ content }: { content: BlockContent<"code_example"> }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      {content.title && <h3 className="mb-2 text-xl font-semibold text-slate-900">{content.title}</h3>}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wide text-slate-400">{content.language}</span>
          <button type="button" onClick={copy} className="btn btn-sm text-slate-300 hover:bg-slate-800" aria-label="Copy code">
            {copied ? <Check aria-hidden className="h-3.5 w-3.5" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
          <code>{content.code}</code>
        </pre>
      </div>
      {content.expectedOutput && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50">
          <p className="border-b border-slate-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Expected output</p>
          <pre className="overflow-x-auto p-4 font-mono text-sm text-slate-800">{content.expectedOutput}</pre>
        </div>
      )}
      {content.explanation && (
        <div className="mt-3">
          <Markdown>{content.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}
