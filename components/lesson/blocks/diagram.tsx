import { ArrowRight, ArrowDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlockContent } from "@/lib/lesson/blocks";

type DiagramNode = BlockContent<"diagram">["nodes"][number];

/** Ring colours outer → inner; the innermost layer of a 3+ level diagram is the amber highlight. */
const RING = [
  { border: "var(--ring-1)", fill: "#EEF2EF", label: "var(--ring-1)" },
  { border: "var(--ring-2)", fill: "#E5EEE9", label: "var(--ring-1)" },
  { border: "var(--ring-3)", fill: "#DCEAE4", label: "var(--ring-1)" },
] as const;
const HIGHLIGHT = { border: "var(--amber)", fill: "var(--amber-weak)", label: "var(--amber-ink)" };

export function ringStyle(depth: number, total: number) {
  if (total >= 3 && depth === total - 1) return HIGHLIGHT;
  return RING[Math.min(depth, RING.length - 1)];
}

/** Accessible diagrams generated from structured data (never raw SVG from content). */
export function DiagramBlock({ content, hideTitle = false }: { content: BlockContent<"diagram">; hideTitle?: boolean }) {
  const { nodes, layout } = content;
  return (
    <figure>
      {content.title && !hideTitle && <h3 className="mb-4 text-[1.375rem] font-semibold text-ink">{content.title}</h3>}

      {layout === "nested" && (
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-12">
          <NestedDiagram nodes={nodes} label={content.description} />
          <ul className="border-t border-line">
            {nodes.map((n, i) => {
              const s = ringStyle(i, nodes.length);
              return (
                <li key={n.label} className="flex gap-3.5 border-b border-line py-4">
                  <span aria-hidden className="mt-[5px] h-3 w-3 shrink-0 rounded-[3px]" style={{ background: s.border }} />
                  <span>
                    <span className="block text-[1.0312rem] font-semibold text-ink">{n.label}</span>
                    {n.detail && <span className="mt-1 block font-serif text-[1.0938rem] leading-[1.5] text-ink-2">{n.detail}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {layout === "flow" && (
        <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center" aria-label="Process steps">
          {nodes.map((n, i) => (
            <li key={n.label} className="flex flex-col items-center gap-2 md:flex-1 md:flex-row">
              <div className="w-full rounded-[12px] border border-line bg-surface p-4 text-center">
                <p className="font-mono text-[0.8438rem] font-medium text-brand-2">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-1 text-[1.0312rem] font-semibold text-ink">{n.label}</p>
                {n.detail && <p className="mt-1 font-serif text-[1.0312rem] leading-snug text-ink-2">{n.detail}</p>}
              </div>
              {i < nodes.length - 1 && (
                <>
                  <ArrowRight aria-hidden strokeWidth={1.5} className="hidden h-5 w-5 shrink-0 text-brand-2 md:block" />
                  <ArrowDown aria-hidden strokeWidth={1.5} className="h-5 w-5 shrink-0 text-brand-2 md:hidden" />
                </>
              )}
            </li>
          ))}
        </ol>
      )}

      {layout === "cycle" && (
        <ol className="grid gap-3 sm:grid-cols-2" aria-label="Repeating cycle">
          {nodes.map((n, i) => (
            <li key={n.label} className="rounded-[12px] border border-line bg-surface p-4">
              <p className="flex items-center gap-1.5 font-mono text-[0.8438rem] font-medium text-brand-2">
                {String(i + 1).padStart(2, "0")}
                {i === nodes.length - 1 && <RefreshCw aria-label="then back to the start" strokeWidth={1.5} className="h-3 w-3" />}
              </p>
              <p className="mt-1 text-[1.0312rem] font-semibold text-ink">{n.label}</p>
              {n.detail && <p className="mt-1 font-serif text-[1.0312rem] leading-snug text-ink-2">{n.detail}</p>}
            </li>
          ))}
        </ol>
      )}

      <figcaption className={cn("mt-4 text-[0.9062rem] text-ink-3", layout === "nested" && "sr-only")}>{content.description}</figcaption>
    </figure>
  );
}

/** Concentric rounded boxes, each layer inside the last. */
export function NestedDiagram({ nodes, label, size = "md" }: { nodes: DiagramNode[]; label: string; size?: "sm" | "md" }) {
  return (
    <div role="img" aria-label={label} className={cn("aspect-[11/10] w-full", size === "sm" ? "max-w-[18.75rem]" : "max-w-[27.5rem]")}>
      <Layer nodes={nodes} depth={0} total={nodes.length} size={size} />
    </div>
  );
}

function Layer({ nodes, depth, total, size }: { nodes: DiagramNode[]; depth: number; total: number; size: "sm" | "md" }) {
  const [first, ...rest] = nodes;
  if (!first) return null;
  const s = ringStyle(depth, total);
  const sm = size === "sm";
  if (!rest.length) {
    return (
      <div
        className={cn("grid place-items-center rounded-[12px] border-[1.5px] text-center font-semibold leading-tight", sm ? "max-w-[6rem] px-2 py-1.5 text-[0.8125rem]" : "max-w-[5.25rem] p-2 text-[0.875rem]")}
        style={{ borderColor: s.border, background: s.fill, color: s.label }}
      >
        {first.label}
      </div>
    );
  }
  return (
    <div
      className={cn("flex h-full w-full flex-col border-[1.5px]", depth === 0 ? (sm ? "rounded-[16px]" : "rounded-[20px]") : sm ? "rounded-[14px]" : "rounded-[16px]")}
      style={{ borderColor: s.border, background: s.fill }}
    >
      <span className={cn("font-semibold", sm ? "px-3 pt-2 text-[0.7812rem]" : "px-3.5 pt-3 text-[0.875rem]")} style={{ color: s.label }}>
        {first.label}
      </span>
      <div className={cn("flex min-h-0 flex-1 items-center justify-center", rest.length > 1 ? "px-[13%] pt-[3%] pb-[13%]" : "pb-[10%]")}>
        <Layer nodes={rest} depth={depth + 1} total={total} size={size} />
      </div>
    </div>
  );
}
