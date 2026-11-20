import { Lock, Clock, ChartNoAxesColumnIncreasing } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

const DIFF_STYLES = {
  beginner: "chip",
  intermediate: "chip",
  advanced: "chip",
} as const;

export function DifficultyBadge({ level }: { level: keyof typeof DIFF_STYLES }) {
  return (
    <span className={DIFF_STYLES[level]}>
      <ChartNoAxesColumnIncreasing aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span className="capitalize">{level}</span>
    </span>
  );
}

export function DurationBadge({ minutes, suffix = "" }: { minutes: number; suffix?: string }) {
  return (
    <span className="chip">
      <Clock aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
      {formatMinutes(minutes)}
      {suffix}
    </span>
  );
}

export function TierBadge({ tier }: { tier: "free" | "premium" }) {
  if (tier === "free")
    return <span className="chip">Free</span>;
  return (
    <span className="chip border-amber/40 bg-amber-weak text-amber-ink">
      <Lock aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} /> Premium
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
    scheduled: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
    draft: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    archived: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
    completed: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
    in_progress: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  };
  return <span className={`badge ${styles[status] ?? styles.draft}`}>{status.replace("_", " ")}</span>;
}

export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className="h-full rounded-full bg-brand-2 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
