"use client";

import { useState } from "react";
import { LabShell, Slider, Stat } from "../lab-kit";
import type { LabProps } from "../registry";

const FUNCS = {
  quadratic: { label: "Simple bowl: f(x) = x²", f: (x: number) => x * x, df: (x: number) => 2 * x, yMax: 16 },
  bumpy: { label: "Bumpy: f(x) = x⁴ − 3x² + x", f: (x: number) => x ** 4 - 3 * x * x + x, df: (x: number) => 4 * x ** 3 - 6 * x + 1, yMax: 14 },
} as const;
type FKey = keyof typeof FUNCS;

const W = 420, H = 240, XMIN = -4, XMAX = 4;

export default function GradientDescent({ config }: LabProps) {
  const initialF: FKey = config?.function === "bumpy" ? "bumpy" : "quadratic";
  const [fn, setFn] = useState<FKey>(initialF);
  const [lr, setLr] = useState(0.1);
  const [x0, setX0] = useState(3);
  const [path, setPath] = useState<number[]>([3]);

  const F = FUNCS[fn];
  const yMin = fn === "bumpy" ? -4 : -1;
  const sx = (x: number) => ((x - XMIN) / (XMAX - XMIN)) * W;
  const sy = (y: number) => H - ((Math.min(y, F.yMax) - yMin) / (F.yMax - yMin)) * H;
  const x = path[path.length - 1];
  const diverged = !Number.isFinite(x) || Math.abs(x) > 50;

  const step = (n: number) =>
    setPath((p) => {
      const out = [...p];
      for (let i = 0; i < n; i++) {
        const cur = out[out.length - 1];
        if (!Number.isFinite(cur) || Math.abs(cur) > 50) break;
        out.push(cur - lr * F.df(cur));
      }
      return out;
    });

  const restart = (nx0 = x0) => setPath([nx0]);
  const reset = () => {
    setFn(initialF);
    setLr(0.1);
    setX0(3);
    setPath([3]);
  };

  const curve = Array.from({ length: 161 }, (_, i) => {
    const xv = XMIN + (i / 160) * (XMAX - XMIN);
    return `${i === 0 ? "M" : "L"}${sx(xv).toFixed(1)},${sy(F.f(xv)).toFixed(1)}`;
  }).join(" ");

  const steps = path.length - 1;
  const done = fn === "quadratic" && !diverged && Math.abs(x) < 0.01 && steps <= 10;

  let behaviour = "Press “Take 1 step” to move downhill.";
  if (diverged) behaviour = "The steps grew larger and larger and the point flew off — the learning rate is too high, so each update overshoots the minimum.";
  else if (steps > 1) {
    const signs = path.slice(-4).map((v) => Math.sign(v));
    const oscillating = fn === "quadratic" && signs.some((v, i) => i > 0 && v !== signs[i - 1]);
    if (oscillating) behaviour = "The point is bouncing from one side of the bowl to the other: the learning rate is large enough to overshoot, but still converging.";
    else if (Math.abs(F.df(x)) < 0.01) behaviour = "The slope is almost zero, so the steps have become tiny — we have reached a minimum." + (fn === "bumpy" ? " Is it the lowest one? Try a different start." : "");
    else behaviour = "Each step moves opposite to the slope. Steps shrink as the slope flattens near the bottom.";
  }

  return (
    <LabShell
      onReset={reset}
      challenge={{ text: "On the simple bowl starting at x = 3, reach |x| < 0.01 in 10 steps or fewer.", done }}
      explanation={
        <>
          <p>
            Update rule: <code className="font-mono">x_new = x − learning_rate × slope</code>. Current slope at x = {Number.isFinite(x) ? x.toFixed(3) : "∞"} is{" "}
            {Number.isFinite(x) ? F.df(x).toFixed(3) : "∞"}.
          </p>
          <p className="mt-1">{behaviour}</p>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FUNCS) as FKey[]).map((k) => (
          <button
            key={k}
            type="button"
            className={fn === k ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
            aria-pressed={fn === k}
            onClick={() => {
              setFn(k);
              restart();
            }}
          >
            {FUNCS[k].label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-slate-200 bg-white" role="img" aria-label={`Loss curve with ${steps} gradient descent steps; current x is ${Number.isFinite(x) ? x.toFixed(2) : "diverged"}`}>
        <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="#e2e8f0" />
        <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="#e2e8f0" />
        <path d={curve} fill="none" stroke="#4f46e5" strokeWidth={2.5} />
        {path.slice(0, -1).map((p, i) => {
          const q = path[i + 1];
          if (!Number.isFinite(q) || Math.abs(q) > XMAX + 1) return null;
          return <line key={i} x1={sx(p)} y1={sy(F.f(p))} x2={sx(q)} y2={sy(F.f(q))} stroke="#ea580c" strokeWidth={1.5} strokeDasharray="4 3" />;
        })}
        {path.map((p, i) =>
          Number.isFinite(p) && Math.abs(p) <= XMAX ? (
            <circle key={i} cx={sx(p)} cy={sy(F.f(p))} r={i === path.length - 1 ? 7 : 3.5} fill={i === path.length - 1 ? "#ea580c" : "#fdba74"} stroke="#9a3412" />
          ) : null,
        )}
        <text x={8} y={16} className="text-[11px]" fill="#64748b">loss</text>
        <text x={W - 14} y={sy(0) - 6} className="text-[11px]" fill="#64748b">x</text>
      </svg>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Slider id="gd-lr" label="Learning rate" value={lr} min={0.01} max={1.1} step={0.01} onChange={(v) => { setLr(v); restart(); }} format={(v) => v.toFixed(2)} />
          <Slider id="gd-x0" label="Starting point x₀" value={x0} min={-3.5} max={3.5} step={0.1} onChange={(v) => { setX0(v); restart(v); }} format={(v) => v.toFixed(1)} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary btn-sm" onClick={() => step(1)} disabled={diverged}>Take 1 step</button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => step(10)} disabled={diverged}>Take 10 steps</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => restart()}>Restart from x₀</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Steps" value={steps} />
          <Stat label="x" value={diverged ? "∞" : x.toFixed(3)} />
          <Stat label="loss f(x)" value={diverged ? "∞" : F.f(x).toFixed(3)} />
        </div>
      </div>
    </LabShell>
  );
}
