"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import type { BlockContent } from "@/lib/lesson/blocks";

export function CodeExampleBlock({ content, hideTitle = false }: { content: BlockContent<"code_example">; hideTitle?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      {content.title && !hideTitle && <h3 className="mb-3 text-[1.375rem] font-semibold text-ink">{content.title}</h3>}
      <div className="overflow-hidden rounded-[14px] bg-ink">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-[0.8438rem] text-[#9EA397]">{content.language}</span>
          <button type="button" onClick={copy} className="btn btn-sm font-medium text-[#C9CCC3] hover:bg-white/10" aria-label="Copy code">
            {copied ? <Check aria-hidden className="h-3.5 w-3.5" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[0.9375rem] leading-[1.7] text-[#EEEDE4]">
          <code>{content.code}</code>
        </pre>
      </div>
      {content.expectedOutput && (
        <div className="mt-2 rounded-[14px] border border-line bg-surface">
          <p className="border-b border-line px-4 py-2 text-[0.875rem] font-medium text-ink-2">Expected output</p>
          <pre className="overflow-x-auto p-4 font-mono text-[0.9375rem] text-ink">{content.expectedOutput}</pre>
        </div>
      )}
      {content.explanation && (
        <div className="mt-4">
          <Markdown>{content.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}
