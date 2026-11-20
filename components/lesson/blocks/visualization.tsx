"use client";

import { Component, type ReactNode } from "react";
import { FlaskConical, Target, MousePointerClick } from "lucide-react";
import type { BlockContent } from "@/lib/lesson/blocks";
import { LabLoader } from "@/components/visualizations/registry";

class LabErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[lab] failed to render", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function VisualizationBlock({ content, hideTitle = false }: { content: BlockContent<"visualization">; hideTitle?: boolean }) {
  const fallback = (
    <div className="rounded-[12px] bg-amber-weak p-4 text-sm text-ink" role="note">
      <p className="font-semibold text-amber-ink">The interactive lab could not load. Here is what it demonstrates:</p>
      <p className="mt-2 font-serif text-[1.125rem] leading-[1.55] whitespace-pre-line">{content.fallback}</p>
    </div>
  );
  return (
    <section aria-label={content.title ?? "Interactive lab"} className="space-y-5">
      {!hideTitle && (
        <div>
          <p className="flex items-center gap-2 text-[0.9062rem] font-semibold text-brand-2">
            <FlaskConical aria-hidden strokeWidth={1.5} className="h-4 w-4" /> Interactive lab
          </p>
          {content.title && <h3 className="mt-1 text-[1.375rem] font-semibold text-ink">{content.title}</h3>}
        </div>
      )}
      <div className="max-w-[62ch] space-y-2 font-serif text-[1.2188rem] leading-[1.6] text-ink-2">
        <p className="flex gap-2.5">
          <Target aria-hidden strokeWidth={1.5} className="mt-[7px] h-4 w-4 shrink-0 text-brand-2" />
          <span>{content.objective}</span>
        </p>
        <p className="flex gap-2.5">
          <MousePointerClick aria-hidden strokeWidth={1.5} className="mt-[7px] h-4 w-4 shrink-0 text-brand-2" />
          <span>{content.instructions}</span>
        </p>
      </div>
      <div className="rounded-[16px] border border-line bg-surface p-4 sm:p-6">
        <LabErrorBoundary fallback={fallback}>
          <LabLoader component={content.component} config={content.config} />
        </LabErrorBoundary>
      </div>
      <details className="group text-sm">
        <summary className="cursor-pointer font-medium text-brand marker:text-brand-2">Text explanation (no interaction needed)</summary>
        <p className="mt-2 max-w-[62ch] font-serif text-[1.1562rem] leading-[1.6] whitespace-pre-line text-ink-2">{content.fallback}</p>
      </details>
      <noscript>{fallback}</noscript>
    </section>
  );
}
