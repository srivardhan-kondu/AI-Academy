import { SunMedium, AlertTriangle, CircleX, Info, ExternalLink, Download, BookOpen, PlayCircle, FileText, Check, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import type { BlockContent } from "@/lib/lesson/blocks";

const ICON = { strokeWidth: 1.5, "aria-hidden": true } as const;

/* ------------------------------------------------------------------ */
/* Rich text                                                          */
/* ------------------------------------------------------------------ */

/**
 * A bullet list where every item opens with a bold term ("- **Term (TT)** is …")
 * reads as a set of definitions, so it is laid out as definition rows.
 */
const DEF_LINE = /^[-*]\s+\*\*(.+?)\*\*[:\s\u2014\u2013-]*(.*)$/;

type Chunk = { kind: "md"; text: string } | { kind: "defs"; items: { term: string; abbr?: string; body: string }[] };

function splitDefinitions(markdown: string): Chunk[] {
  const chunks: Chunk[] = [];
  for (const para of markdown.split(/\n{2,}/)) {
    const lines = para.split("\n").filter((l) => l.trim());
    const defs = lines.length >= 2 && lines.every((l) => DEF_LINE.test(l.trim()));
    if (defs) {
      chunks.push({
        kind: "defs",
        items: lines.map((l) => {
          const [, rawTerm, rawBody] = l.trim().match(DEF_LINE)!;
          const abbr = rawTerm.match(/^(.*?)\s*\(([A-Za-z0-9.\-/ ]{1,8})\)$/);
          const body = rawBody.replace(/^(is|are)\s+/i, "");
          return {
            term: abbr ? abbr[1] : rawTerm,
            abbr: abbr ? abbr[2] : undefined,
            body: body ? body[0].toUpperCase() + body.slice(1) : "",
          };
        }),
      });
    } else {
      const last = chunks[chunks.length - 1];
      if (last?.kind === "md") last.text += `\n\n${para}`;
      else chunks.push({ kind: "md", text: para });
    }
  }
  return chunks;
}

export function RichTextBlock({ content, hideTitle = false }: { content: BlockContent<"rich_text">; hideTitle?: boolean }) {
  const chunks = splitDefinitions(content.markdown);
  return (
    <div className="space-y-6">
      {content.title && !hideTitle && <h3 className="text-[1.375rem] font-semibold text-ink">{content.title}</h3>}
      {chunks.map((c, i) =>
        c.kind === "md" ? (
          <Markdown key={i}>{c.text}</Markdown>
        ) : (
          <dl key={i} className="border-t border-line">
            {c.items.map((d) => (
              <div key={d.term} className="border-b border-line py-6">
                <dt className="flex items-baseline gap-2.5">
                  <span className="text-[1.375rem] font-semibold tracking-[-0.01em] text-ink">{d.term}</span>
                  {d.abbr && <span className="font-mono text-[0.8438rem] font-medium text-brand-2">{d.abbr}</span>}
                </dt>
                <dd className="mt-2">
                  <Markdown>{d.body}</Markdown>
                </dd>
              </div>
            ))}
          </dl>
        ),
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Callouts                                                           */
/* ------------------------------------------------------------------ */

type Tone = { icon: LucideIcon; label: string; box: string; head: string };

const CALLOUTS: Record<BlockContent<"callout">["variant"], Tone> = {
  key_idea: { icon: SunMedium, label: "Key idea", box: "border-transparent border-l-amber bg-amber-weak", head: "text-amber-ink" },
  warning: { icon: AlertTriangle, label: "Watch out", box: "border-line border-l-ink-3 bg-surface", head: "text-ink-2" },
  misconception: { icon: CircleX, label: "Common misconception", box: "border-transparent border-l-bad bg-bad-weak", head: "text-bad" },
  tip: { icon: Info, label: "Tip", box: "border-transparent border-l-brand-2 bg-brand-weak", head: "text-brand" },
  analogy: { icon: Lightbulb, label: "Analogy", box: "border-line border-l-brand-2 bg-surface", head: "text-brand" },
};

export function Callout({ tone, title, children }: { tone: Tone; title?: string; children: React.ReactNode }) {
  const Icon = tone.icon;
  return (
    <aside className={cn("max-w-[34.75rem] rounded-r-[14px] rounded-l-[6px] border border-l-[3px] px-6 py-5", tone.box)} aria-label={title ?? tone.label}>
      <p className={cn("flex items-center gap-2 font-serif text-[1.2188rem] font-semibold", tone.head)}>
        <Icon {...ICON} className="h-4 w-4" /> {title ?? tone.label}
      </p>
      <div className="mt-1.5 [&_.prose-lesson]:text-[1.1562rem] [&_.prose-lesson]:leading-[1.62]">{children}</div>
    </aside>
  );
}

/** "Where the analogy breaks down" paragraphs are pulled out into their own note. */
const BREAKDOWN = /^[*_]{0,2}where (the|this) analogy (stops working|breaks down|fails)[:.]?[*_]{0,2}[:.]?\s*/i;

export function CalloutBlock({ content, hideTitle = false }: { content: BlockContent<"callout">; hideTitle?: boolean }) {
  if (content.variant === "analogy") {
    const paras = content.markdown.split(/\n{2,}/);
    const main = paras.filter((p) => !BREAKDOWN.test(p.trim()));
    const breakdown = paras.filter((p) => BREAKDOWN.test(p.trim())).map((p) => p.trim().replace(BREAKDOWN, "")).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
    return (
      <div className="space-y-8">
        {content.title && !hideTitle && <h3 className="text-[1.375rem] font-semibold text-ink">Analogy: {content.title}</h3>}
        {main.length > 0 && <Markdown>{main.join("\n\n")}</Markdown>}
        {breakdown.length > 0 && (
          <Callout tone={{ icon: AlertTriangle, label: "Where the analogy breaks down", box: "border-line border-l-ink-3 bg-surface", head: "text-ink-2" }}>
            <div className="[&_.prose-lesson]:text-ink-2">
              <Markdown>{breakdown.join("\n\n")}</Markdown>
            </div>
          </Callout>
        )}
      </div>
    );
  }
  return (
    <Callout tone={CALLOUTS[content.variant]} title={content.title}>
      <Markdown>{content.markdown}</Markdown>
    </Callout>
  );
}

/* ------------------------------------------------------------------ */
/* Media                                                              */
/* ------------------------------------------------------------------ */

export function ImageBlock({ content }: { content: BlockContent<"image"> }) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.src} alt={content.alt} loading="lazy" className="w-full rounded-[14px] border border-line" />
      {content.caption && <figcaption className="mt-2.5 text-[0.9062rem] text-ink-3">{content.caption}</figcaption>}
    </figure>
  );
}

export function VideoBlock({ content }: { content: BlockContent<"video"> }) {
  return (
    <figure>
      <div className="aspect-video overflow-hidden rounded-[14px] border border-line bg-ink">
        <iframe
          src={content.url}
          title={content.title}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      </div>
      <figcaption className="mt-2.5 text-[0.9062rem] text-ink-3">{content.title}</figcaption>
      {content.transcript && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer font-medium text-brand">Read the transcript</summary>
          <p className="mt-2 font-serif text-[1.0938rem] leading-relaxed whitespace-pre-line text-ink-2">{content.transcript}</p>
        </details>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison table                                                   */
/* ------------------------------------------------------------------ */

const COLUMN_SWATCH = ["var(--ink-3)", "var(--brand-2)", "var(--amber)", "var(--ring-1)", "var(--ring-3)"];

export function ComparisonBlock({ content, hideTitle = false }: { content: BlockContent<"comparison">; hideTitle?: boolean }) {
  return (
    <div>
      {content.title && !hideTitle && <h3 className="mb-4 text-[1.375rem] font-semibold text-ink">{content.title}</h3>}
      <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
        <table className="w-full min-w-[38.75rem] border-collapse text-left">
          <thead className="bg-surface-2">
            <tr>
              <th scope="col" className="w-[19%] px-5 py-4 align-top text-[0.875rem] font-medium text-ink-2">
                Aspect
              </th>
              {content.columns.map((c, i) => (
                <th key={c} scope="col" className="border-l border-line px-5 py-4 align-top">
                  <span className="flex items-center gap-2 text-[1.0312rem] font-semibold text-ink">
                    <span aria-hidden className="h-[0.625rem] w-[10px] shrink-0 rounded-[3px]" style={{ background: COLUMN_SWATCH[i % COLUMN_SWATCH.length] }} />
                    {c}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className="px-5 py-4 align-top text-[0.9062rem] leading-snug font-medium text-ink-2">
                  {r.label}
                </th>
                {content.columns.map((c, i) => (
                  <td key={c} className="border-l border-line px-5 py-4 align-top font-serif text-[1.125rem] leading-[1.45] text-ink">
                    {r.values[i] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Resources & summary                                                */
/* ------------------------------------------------------------------ */

const RESOURCE_ICONS = { reference: BookOpen, download: Download, article: FileText, video: PlayCircle, documentation: BookOpen } as const;
const RESOURCE_LABEL = { reference: "Reference", download: "Download", article: "Article", video: "Video", documentation: "Documentation" } as const;

export function ResourceBlock({ content }: { content: BlockContent<"resource"> }) {
  const Icon = RESOURCE_ICONS[content.kind];
  const external = content.url.startsWith("http");
  return (
    <a
      href={content.url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : { download: content.kind === "download" || undefined })}
      className="card flex items-start gap-4 p-5 transition-colors hover:border-brand-2"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-brand-weak text-brand">
        <Icon {...ICON} className="h-4 w-4" />
      </span>
      <span>
        <span className="flex items-center gap-1.5 text-[1.0312rem] font-semibold text-ink">
          {content.title} {external && <ExternalLink {...ICON} className="h-3.5 w-3.5 text-ink-3" />}
        </span>
        {content.description && <span className="mt-1 block font-serif text-[1.0938rem] leading-snug text-ink-2">{content.description}</span>}
        <span className="mt-1.5 block text-[0.875rem] font-medium text-ink-3">{RESOURCE_LABEL[content.kind]}</span>
      </span>
    </a>
  );
}

export function SummaryBlock({ content }: { content: BlockContent<"summary"> }) {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-[1.375rem] font-semibold text-ink">Key takeaways</h3>
        <ul className="mt-4 space-y-3">
          {content.takeaways.map((t) => (
            <li key={t} className="flex gap-3.5">
              <span aria-hidden className="mt-[5px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-weak text-brand">
                <Check strokeWidth={2} className="h-3.5 w-3.5" />
              </span>
              <span className="max-w-[62ch] font-serif text-[1.25rem] leading-[1.6] text-ink">{t}</span>
            </li>
          ))}
        </ul>
      </div>
      {content.terms.length > 0 && (
        <div>
          <h3 className="text-[1.375rem] font-semibold text-ink">Key terms</h3>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-2">
            {content.terms.map((t, i) => (
              <div key={t.term} className={cn("bg-surface p-5", i === content.terms.length - 1 && i % 2 === 0 && "sm:col-span-2")}>
                <dt className="text-[1.0312rem] font-semibold text-ink">{t.term}</dt>
                <dd className="mt-1 font-serif text-[1.125rem] leading-[1.5] text-ink-2">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {content.misconceptions.length > 0 && (
        <div>
          <h3 className="text-[1.375rem] font-semibold text-ink">Common misconceptions</h3>
          <ul className="mt-4 space-y-3">
            {content.misconceptions.map((m) => (
              <li key={m} className="flex gap-3.5">
                <span aria-hidden className="mt-[5px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-bad-weak text-bad">
                  <CircleX strokeWidth={1.5} className="h-3.5 w-3.5" />
                </span>
                <span className="max-w-[62ch] font-serif text-[1.25rem] leading-[1.6] text-ink">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
