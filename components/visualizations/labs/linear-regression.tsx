"use client";

import { useState } from "react";
import { LabShell, Slider, Stat } from "../lab-kit";

// Hours studied vs exam score (synthetic teaching data).
const DATA: [number, number][] = [
  [1, 52], [2, 55], [2.5, 61], [3, 58], [4, 67], [4.5, 70], [5, 68], [6, 78], [7, 80], [8, 88],
];
const W = 420, H = 260, PAD = 34;
const sx = (x: number) => PAD + (x / 9) * (W - PAD - 10);
const sy = (y: number) => H - PAD - ((y - 40) / 60) * (H - PAD - 10);

function fit() {
  const n = DATA.length;
  const mx = DATA.reduce((s, d) => s + d[0], 0) / n;
  const my = DATA.reduce((s, d) => s + d[1], 0) / n;
  const m = DATA.reduce((s, d) => s + (d[0] - mx) * (d[1] - my), 0) / DATA.reduce((s, d) => s + (d[0] - mx) ** 2, 0);
  return { m, b: my - m * mx };
}
const mse = (m: number, b: number) => DATA.reduce((s, [x, y]) => s + (y - (m * x + b)) ** 2, 0) / DATA.length;
const DEFAULT = { m: 2, b: 60 };
const BEST = fit();

export default function LinearRegression() {
  const [m, setM] = useState(DEFAULT.m);
  const [b, setB] = useState(DEFAULT.b);
  const [showBest, setShowBest] = useState(false);
  const best = BEST;
  const bestMse = mse(best.m, best.b);
  const cur = mse(m, b);
  const done = cur <= bestMse * 1.1;

  return (
    <LabShell
      onReset={() => { setM(DEFAULT.m); setB(DEFAULT.b); setShowBest(false); }}
      challenge={{ text: `Adjust the line until its mean squared error is within 10% of the best possible (${bestMse.toFixed(1)}).`, done }}
      explanation={
        <>
          <p>
            Your line: <code className="font-mono">score = {m.toFixed(1)} × hours + {b.toFixed(1)}</code>. The dashed lines are <strong>residuals</strong> — the gap between each real score and the line&apos;s prediction.
          </p>
          <p className="mt-1">
            Mean squared error squares every residual and averages them, so big misses are punished more. Lower is better.{" "}
            {done ? "Your line is now about as good as a straight line can get on this data." : cur > bestMse * 3 ? "The line is far from the points — try changing the slope first." : "Getting closer. Fine-tune the intercept."}
          </p>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-slate-200 bg-white" role="img" aria-label={`Scatter plot of hours studied versus exam score with a line of slope ${m.toFixed(1)} and intercept ${b.toFixed(1)}`}>
        <line x1={PAD} y1={H - PAD} x2={W - 5} y2={H - PAD} stroke="#94a3b8" />
        <line x1={PAD} y1={5} x2={PAD} y2={H - PAD} stroke="#94a3b8" />
        <text x={W / 2} y={H - 6} textAnchor="middle" className="text-[11px]" fill="#475569">Hours studied</text>
        <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90 10 ${H / 2})`} className="text-[11px]" fill="#475569">Exam score</text>
        {[0, 2, 4, 6, 8].map((t) => <text key={t} x={sx(t)} y={H - PAD + 14} textAnchor="middle" className="text-[10px]" fill="#64748b">{t}</text>)}
        {[40, 60, 80, 100].map((t) => <text key={t} x={PAD - 6} y={sy(t) + 3} textAnchor="end" className="text-[10px]" fill="#64748b">{t}</text>)}
        {DATA.map(([x, y], i) => (
          <line key={`r${i}`} x1={sx(x)} y1={sy(y)} x2={sx(x)} y2={sy(m * x + b)} stroke="#ea580c" strokeDasharray="3 3" />
        ))}
        {showBest && <line x1={sx(0)} y1={sy(best.b)} x2={sx(9)} y2={sy(best.m * 9 + best.b)} stroke="#059669" strokeWidth={2} strokeDasharray="8 4" />}
        <line x1={sx(0)} y1={sy(b)} x2={sx(9)} y2={sy(m * 9 + b)} stroke="#4f46e5" strokeWidth={2.5} />
        {DATA.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r={5} fill="#0f172a" />)}
      </svg>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Slider id="lr-m" label="Slope (points per hour)" value={m} min={-2} max={10} step={0.1} onChange={setM} format={(v) => v.toFixed(1)} />
          <Slider id="lr-b" label="Intercept (score at 0 hours)" value={b} min={20} max={90} step={0.5} onChange={setB} format={(v) => v.toFixed(1)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} />
            Show best-fit line (green, dashed)
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Your MSE" value={cur.toFixed(1)} />
          <Stat label="Best possible MSE" value={bestMse.toFixed(1)} hint={showBest ? `slope ${best.m.toFixed(2)}, intercept ${best.b.toFixed(1)}` : "reveal with the checkbox"} />
        </div>
      </div>
    </LabShell>
  );
}
