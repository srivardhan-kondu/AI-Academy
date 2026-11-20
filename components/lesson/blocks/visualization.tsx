"use client";

import { Component, type ReactNode } from "react";
import { FlaskConical } from "lucide-react";
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

export function VisualizationBlock({ content }: { content: BlockContent<"visualization"> }) {
  const fallback = (
    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900" role="note">
      <p className="font-semibold">The interactive lab could not load. Here is what it demonstrates:</p>
      <p className="mt-2 whitespace-pre-line">{content.fallback}</p>
    </div>
  );
  return (
    <section className="rounded-2xl border-2 border-brand-200 bg-white p-4 sm:p-6" aria-label={content.title ?? "Interactive lab"}>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-700">
        <FlaskConical aria-hidden className="h-4 w-4" /> Interactive lab
      </p>
      {content.title && <h3 className="mt-1 text-xl font-semibold text-slate-900">{content.title}</h3>}
      <p className="mt-2 text-sm text-slate-700">
        <strong>Goal:</strong> {content.objective}
      </p>
      <p className="mt-1 text-sm text-slate-700">
        <strong>How to use it:</strong> {content.instructions}
      </p>
      <div className="mt-4">
        <LabErrorBoundary fallback={fallback}>
          <LabLoader component={content.component} config={content.config} />
        </LabErrorBoundary>
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-brand-700">Text explanation (no interaction needed)</summary>
        <p className="mt-2 whitespace-pre-line text-slate-700">{content.fallback}</p>
      </details>
      <noscript>{fallback}</noscript>
    </section>
  );
}
