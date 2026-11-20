import { ArrowRight, ArrowDown } from "lucide-react";
import type { BlockContent } from "@/lib/lesson/blocks";

/** Accessible diagrams generated from structured data (never raw SVG from content). */
export function DiagramBlock({ content }: { content: BlockContent<"diagram"> }) {
  const { nodes, layout } = content;
  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-6">
      {content.title && <h3 className="mb-4 text-lg font-semibold text-slate-900">{content.title}</h3>}

      {layout === "flow" && (
        <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center" aria-label="Process steps">
          {nodes.map((n, i) => (
            <li key={n.label} className="flex flex-col items-center gap-2 md:flex-1 md:flex-row">
              <div className="w-full rounded-xl border border-brand-200 bg-brand-50 p-3 text-center">
                <p className="text-xs font-semibold text-brand-700">Step {i + 1}</p>
                <p className="font-semibold text-slate-900">{n.label}</p>
                {n.detail && <p className="mt-1 text-xs text-slate-600">{n.detail}</p>}
              </div>
              {i < nodes.length - 1 && (
                <>
                  <ArrowRight aria-hidden className="hidden h-5 w-5 shrink-0 text-slate-400 md:block" />
                  <ArrowDown aria-hidden className="h-5 w-5 shrink-0 text-slate-400 md:hidden" />
                </>
              )}
            </li>
          ))}
        </ol>
      )}

      {layout === "nested" && <Nested nodes={nodes} depth={0} />}

      {layout === "cycle" && (
        <ol className="grid gap-3 sm:grid-cols-2" aria-label="Repeating cycle">
          {nodes.map((n, i) => (
            <li key={n.label} className="rounded-xl border border-brand-200 bg-brand-50 p-3">
              <p className="text-xs font-semibold text-brand-700">
                {i + 1} → {i + 2 > nodes.length ? 1 : i + 2}
              </p>
              <p className="font-semibold text-slate-900">{n.label}</p>
              {n.detail && <p className="mt-1 text-xs text-slate-600">{n.detail}</p>}
            </li>
          ))}
        </ol>
      )}

      <figcaption className="mt-4 text-sm text-slate-600">{content.description}</figcaption>
    </figure>
  );
}

const SHADES = ["bg-brand-50 border-brand-200", "bg-white border-brand-300", "bg-brand-100 border-brand-400", "bg-white border-brand-500"];

function Nested({ nodes, depth }: { nodes: BlockContent<"diagram">["nodes"]; depth: number }) {
  const [first, ...rest] = nodes;
  if (!first) return null;
  return (
    <div className={`rounded-2xl border-2 p-4 ${SHADES[depth % SHADES.length]}`}>
      <p className="font-semibold text-slate-900">{first.label}</p>
      {first.detail && <p className="mb-3 text-sm text-slate-600">{first.detail}</p>}
      {rest.length > 0 && <Nested nodes={rest} depth={depth + 1} />}
    </div>
  );
}
