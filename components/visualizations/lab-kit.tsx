"use client";

import type { ReactNode } from "react";
import { RotateCcw, Target, CheckCircle2 } from "lucide-react";

/** Common chrome every lab uses: reset, live explanation, guided challenge. */
export function LabShell({
  children,
  onReset,
  explanation,
  challenge,
}: {
  children: ReactNode;
  onReset: () => void;
  explanation: ReactNode;
  challenge?: { text: string; done: boolean };
}) {
  return (
    <div className="space-y-4">
      {children}
      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800" aria-live="polite">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">What&apos;s happening</p>
        {explanation}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {challenge ? (
          <p
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
              challenge.done ? "bg-emerald-50 text-emerald-900" : "bg-violet-50 text-violet-900"
            }`}
          >
            {challenge.done ? (
              <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Target aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>
              <strong>{challenge.done ? "Challenge complete! " : "Challenge: "}</strong>
              {challenge.text}
            </span>
          </p>
        ) : (
          <span />
        )}
        <button type="button" className="btn-secondary btn-sm" onClick={onReset}>
          <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => String(v),
  id,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  id: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-medium text-slate-700">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-slate-900">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
        aria-valuetext={format(value)}
      />
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-mono text-lg font-semibold text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Deterministic pseudo-random generator so labs start from the same useful state. */
export function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Colour + shape pairs so categories never rely on colour alone. */
export const SERIES = [
  { color: "#4f46e5", shape: "circle", name: "indigo circle" },
  { color: "#ea580c", shape: "square", name: "orange square" },
  { color: "#059669", shape: "triangle", name: "green triangle" },
  { color: "#db2777", shape: "diamond", name: "pink diamond" },
  { color: "#0891b2", shape: "cross", name: "cyan cross" },
] as const;

export function Marker({ x, y, series, size = 5, filled = true }: { x: number; y: number; series: number; size?: number; filled?: boolean }) {
  const s = SERIES[series % SERIES.length];
  const common = { fill: filled ? s.color : "white", stroke: s.color, strokeWidth: 1.5 };
  switch (s.shape) {
    case "square":
      return <rect x={x - size} y={y - size} width={size * 2} height={size * 2} {...common} />;
    case "triangle":
      return <polygon points={`${x},${y - size * 1.2} ${x - size * 1.1},${y + size} ${x + size * 1.1},${y + size}`} {...common} />;
    case "diamond":
      return <polygon points={`${x},${y - size * 1.3} ${x + size * 1.3},${y} ${x},${y + size * 1.3} ${x - size * 1.3},${y}`} {...common} />;
    case "cross":
      return (
        <g stroke={s.color} strokeWidth={2.5}>
          <line x1={x - size} y1={y - size} x2={x + size} y2={y + size} />
          <line x1={x - size} y1={y + size} x2={x + size} y2={y - size} />
        </g>
      );
    default:
      return <circle cx={x} cy={y} r={size} {...common} />;
  }
}
