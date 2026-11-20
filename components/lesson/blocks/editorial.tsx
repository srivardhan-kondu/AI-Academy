import { Lightbulb, AlertTriangle, Puzzle, XCircle, Info, ExternalLink, Download, BookOpen, PlayCircle, FileText } from "lucide-react";
import { Markdown } from "@/components/ui/markdown";
import type { BlockContent } from "@/lib/lesson/blocks";

export function RichTextBlock({ content }: { content: BlockContent<"rich_text"> }) {
  return (
    <div>
      {content.title && <h2 className="mb-3 text-2xl font-bold text-slate-900">{content.title}</h2>}
      <Markdown>{content.markdown}</Markdown>
    </div>
  );
}

const CALLOUTS = {
  key_idea: { icon: Lightbulb, label: "Key idea", cls: "border-brand-200 bg-brand-50" },
  analogy: { icon: Puzzle, label: "Analogy", cls: "border-sky-200 bg-sky-50" },
  warning: { icon: AlertTriangle, label: "Watch out", cls: "border-amber-200 bg-amber-50" },
  misconception: { icon: XCircle, label: "Common misconception", cls: "border-rose-200 bg-rose-50" },
  tip: { icon: Info, label: "Tip", cls: "border-emerald-200 bg-emerald-50" },
} as const;

export function CalloutBlock({ content }: { content: BlockContent<"callout"> }) {
  const c = CALLOUTS[content.variant];
  const Icon = c.icon;
  return (
    <aside className={`rounded-2xl border p-5 ${c.cls}`} aria-label={c.label}>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <Icon aria-hidden className="h-4 w-4" /> {c.label}
      </p>
      {content.title && <h3 className="mt-2 text-lg font-semibold text-slate-900">{content.title}</h3>}
      <div className="mt-2">
        <Markdown>{content.markdown}</Markdown>
      </div>
    </aside>
  );
}

export function ImageBlock({ content }: { content: BlockContent<"image"> }) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.src} alt={content.alt} loading="lazy" className="w-full rounded-xl border border-slate-200" />
      {content.caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{content.caption}</figcaption>}
    </figure>
  );
}

export function VideoBlock({ content }: { content: BlockContent<"video"> }) {
  return (
    <figure>
      <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-black">
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
      <figcaption className="mt-2 text-sm text-slate-600">{content.title}</figcaption>
      {content.transcript && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer font-medium text-brand-700">Read the transcript</summary>
          <p className="mt-2 whitespace-pre-line text-slate-700">{content.transcript}</p>
        </details>
      )}
    </figure>
  );
}

export function ComparisonBlock({ content }: { content: BlockContent<"comparison"> }) {
  return (
    <div>
      {content.title && <h3 className="mb-3 text-xl font-semibold text-slate-900">{content.title}</h3>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="table">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col">
                <span className="sr-only">Aspect</span>
              </th>
              {content.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="font-medium text-slate-900">
                  {r.label}
                </th>
                {content.columns.map((c, i) => (
                  <td key={c}>{r.values[i] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const RESOURCE_ICONS = { reference: BookOpen, download: Download, article: FileText, video: PlayCircle, documentation: BookOpen } as const;

export function ResourceBlock({ content }: { content: BlockContent<"resource"> }) {
  const Icon = RESOURCE_ICONS[content.kind];
  const external = content.url.startsWith("http");
  return (
    <a
      href={content.url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : { download: content.kind === "download" || undefined })}
      className="card flex items-start gap-4 p-4 hover:border-brand-300"
    >
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
      <span>
        <span className="flex items-center gap-1 font-semibold text-slate-900">
          {content.title} {external && <ExternalLink aria-hidden className="h-3.5 w-3.5" />}
        </span>
        {content.description && <span className="mt-1 block text-sm text-slate-600">{content.description}</span>}
        <span className="mt-1 block text-xs uppercase tracking-wide text-slate-400">{content.kind}</span>
      </span>
    </a>
  );
}

export function SummaryBlock({ content }: { content: BlockContent<"summary"> }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-slate-900">Summary</h2>
      <h3 className="mt-4 font-semibold text-slate-900">Key takeaways</h3>
      <ul className="mt-2 space-y-2">
        {content.takeaways.map((t) => (
          <li key={t} className="flex gap-2 text-slate-800">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
            {t}
          </li>
        ))}
      </ul>
      {content.terms.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold text-slate-900">Important terms</h3>
          <dl className="mt-2 grid gap-3 sm:grid-cols-2">
            {content.terms.map((t) => (
              <div key={t.term} className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-900">{t.term}</dt>
                <dd className="mt-1 text-sm text-slate-700">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {content.misconceptions.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold text-slate-900">Common misconceptions</h3>
          <ul className="mt-2 space-y-2">
            {content.misconceptions.map((m) => (
              <li key={m} className="flex gap-2 text-slate-800">
                <XCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                {m}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
