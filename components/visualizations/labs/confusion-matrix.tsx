"use client";

import { useState } from "react";
import { LabShell, Slider, Stat } from "../lab-kit";

// Model risk scores for 20 screening cases (synthetic). label 1 = has the condition.
const CASES: { score: number; label: 0 | 1 }[] = [
  ...[0.95, 0.9, 0.85, 0.8, 0.72, 0.66, 0.58, 0.45, 0.35, 0.2].map((score) => ({ score, label: 1 as const })),
  ...[0.7, 0.6, 0.5, 0.33, 0.3, 0.25, 0.15, 0.1, 0.08, 0.05].map((score) => ({ score, label: 0 as const })),
];
const W = 420, H = 110;
const sx = (s: number) => 16 + s * (W - 32);
const pct = (v: number) => (Number.isFinite(v) ? `${(v * 100).toFixed(0)}%` : "—");

function Cell({ n, label, sub, good }: { n: number; label: string; sub: string; good: boolean }) {
  return (
    <div className={`rounded-lg border-2 p-3 text-center ${good ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
      <p className="font-mono text-2xl font-bold">{n}</p>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-slate-600">{sub}</p>
    </div>
  );
}

export default function ConfusionMatrix() {
  const [t, setT] = useState(0.5);
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const c of CASES) {
    const pred = c.score >= t;
    if (pred && c.label) tp++;
    else if (pred && !c.label) fp++;
    else if (!pred && c.label) fn++;
    else tn++;
  }
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const accuracy = (tp + tn) / CASES.length;
  const f1 = (2 * precision * recall) / (precision + recall);
  const done = recall >= 0.9 && precision >= 0.7;


  return (
    <LabShell
      onReset={() => setT(0.5)}
      challenge={{ text: "This is a medical screening test, so missing sick patients is costly. Find a threshold with recall ≥ 90% while keeping precision ≥ 70%.", done }}
      explanation={
        <>
          <p>
            The model gives each case a score. Cases at or above the threshold ({t.toFixed(2)}) are predicted <strong>positive</strong>.
          </p>
          <p className="mt-1">
            Lowering the threshold catches more true cases (recall ↑) but also raises more false alarms (precision ↓). Raising it does the opposite. Accuracy alone can hide this trade-off.
          </p>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-slate-200 bg-white" role="img" aria-label={`Twenty cases on a score line from 0 to 1 with a threshold at ${t.toFixed(2)}`}>
        <rect x={sx(t)} y={0} width={sx(1) - sx(t) + 16} height={H} fill="#EEF2EF" />
        <line x1={16} y1={55} x2={W - 16} y2={55} stroke="#9EA397" />
        <line x1={sx(t)} y1={4} x2={sx(t)} y2={H - 4} stroke="#16564B" strokeWidth={2} />
        <text x={sx(t) + 4} y={14} className="text-[0.625rem]" fill="#16564B">predicted positive →</text>
        <text x={18} y={H - 4} className="text-[0.625rem]" fill="#6B7268">score 0</text>
        <text x={W - 18} y={H - 4} textAnchor="end" className="text-[0.625rem]" fill="#6B7268">1</text>
        {CASES.map((c, i) =>
          c.label ? (
            <circle key={i} cx={sx(c.score)} cy={38} r={6} fill="#B23A2E" />
          ) : (
            <rect key={i} x={sx(c.score) - 5.5} y={66} width={11} height={11} fill="white" stroke="#1C241F" strokeWidth={1.5} />
          ),
        )}
        <text x={W - 16} y={28} textAnchor="end" className="text-[0.625rem]" fill="#8F2E25">● has condition</text>
        <text x={W - 16} y={96} textAnchor="end" className="text-[0.625rem]" fill="#1C241F">□ healthy</text>
      </svg>
      <Slider id="cm-t" label="Decision threshold" value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => v.toFixed(2)} />
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">Confusion matrix (rows = reality, columns = prediction)</p>
          <div className="grid grid-cols-2 gap-2">
            <Cell n={tp} label="True positives" sub="sick, flagged" good />
            <Cell n={fn} label="False negatives" sub="sick, missed" good={false} />
            <Cell n={fp} label="False positives" sub="healthy, flagged" good={false} />
            <Cell n={tn} label="True negatives" sub="healthy, cleared" good />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 self-start">
          <Stat label="Accuracy" value={pct(accuracy)} hint="(TP+TN) / all" />
          <Stat label="Precision" value={pct(precision)} hint="TP / (TP+FP)" />
          <Stat label="Recall" value={pct(recall)} hint="TP / (TP+FN)" />
          <Stat label="F1 score" value={pct(f1)} hint="balance of both" />
        </div>
      </div>
    </LabShell>
  );
}
