import { Lock, Clock, Signal } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

const DIFF_STYLES = {
  beginner: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  intermediate: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  advanced: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
} as const;

export function DifficultyBadge({ level }: { level: keyof typeof DIFF_STYLES }) {
  return (
    <span className={`badge ${DIFF_STYLES[level]}`}>
      <Signal aria-hidden className="h-3 w-3" />
      <span className="capitalize">{level}</span>
    </span>
  );
}

export function DurationBadge({ minutes }: { minutes: number }) {
  return (
    <span className="badge bg-slate-100 text-slate-700 ring-1 ring-slate-200">
      <Clock aria-hidden className="h-3 w-3" />
      {formatMinutes(minutes)}
    </span>
  );
}

export function TierBadge({ tier }: { tier: "free" | "premium" }) {
  if (tier === "free")
    return <span className="badge bg-sky-50 text-sky-800 ring-1 ring-sky-200">Free</span>;
  return (
    <span className="badge bg-violet-50 text-violet-800 ring-1 ring-violet-200">
      <Lock aria-hidden className="h-3 w-3" /> Premium
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
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
