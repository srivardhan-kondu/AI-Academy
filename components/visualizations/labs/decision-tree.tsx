"use client";

import { useState } from "react";
import { LabShell, Slider, Stat, Marker } from "../lab-kit";

type Feat = "study" | "sleep";
const FEAT_LABEL: Record<Feat, string> = { study: "Hours studied", sleep: "Hours slept" };
// [hours studied, hours slept, passed?]
const DATA: [number, number, 0 | 1][] = [
  [1, 7, 0], [2, 3, 0], [3, 8, 0], [1.5, 5, 0], [2.5, 6, 0], [3.5, 2, 0], [0.5, 9, 0], [3, 4.5, 0],
  [5, 2, 0], [6, 3.5, 0], [8, 4, 0], [7, 1.5, 0], [9, 3, 0],
  [5, 6, 1], [6, 8, 1], [7, 7, 1], [8, 9, 1], [9, 6.5, 1], [5.5, 7.5, 1], [4.5, 8.5, 1], [7.5, 5.5, 1], [6.5, 6, 1],
];
type Split = { on: boolean; feat: Feat; t: number };
type Rect = { x0: number; x1: number; y0: number; y1: number };
const DEFAULT = {
  root: { on: true, feat: "sleep" as Feat, t: 5 },
  left: { on: false, feat: "study" as Feat, t: 4 },
  right: { on: false, feat: "study" as Feat, t: 4 },
};

const val = (p: (typeof DATA)[number], f: Feat) => (f === "study" ? p[0] : p[1]);
function leafStats(pts: typeof DATA) {
  const pass = pts.filter((p) => p[2] === 1).length;
  const n = pts.length;
  const pred: 0 | 1 = pass > n - pass ? 1 : 0;
  const pp = n ? pass / n : 0;
  return { n, pass, fail: n - pass, pred, gini: n ? 1 - pp * pp - (1 - pp) * (1 - pp) : 0 };
}
function splitRect(r: Rect, s: Split): [Rect, Rect] {
  return s.feat === "study"
    ? [{ ...r, x1: Math.min(r.x1, s.t) }, { ...r, x0: Math.max(r.x0, s.t) }]
    : [{ ...r, y1: Math.min(r.y1, s.t) }, { ...r, y0: Math.max(r.y0, s.t) }];
}

const W = 340, H = 300, PAD = 30;
const sx = (x: number) => PAD + (x / 10) * (W - PAD - 8);
const sy = (y: number) => H - PAD - (y / 10) * (H - PAD - 8);

export default function DecisionTree() {
  const [s, setS] = useState(DEFAULT);
  const upd = (k: keyof typeof DEFAULT, patch: Partial<Split>) => setS((p) => ({ ...p, [k]: { ...p[k], ...patch } }));

  const [lp, rp] = [DATA.filter((p) => val(p, s.root.feat) < s.root.t), DATA.filter((p) => val(p, s.root.feat) >= s.root.t)];
  const [lr, rr] = splitRect({ x0: 0, x1: 10, y0: 0, y1: 10 }, s.root);
  const leaves: { name: string; rect: Rect; pts: typeof DATA }[] = [];
  const addSide = (name: string, pts: typeof DATA, rect: Rect, child: Split) => {
    if (!child.on) return leaves.push({ name, rect, pts });
    const [a, b] = splitRect(rect, child);
    leaves.push({ name: `${name} → ${FEAT_LABEL[child.feat]} < ${child.t}`, rect: a, pts: pts.filter((p) => val(p, child.feat) < child.t) });
    leaves.push({ name: `${name} → ${FEAT_LABEL[child.feat]} ≥ ${child.t}`, rect: b, pts: pts.filter((p) => val(p, child.feat) >= child.t) });
  };
  addSide(`${FEAT_LABEL[s.root.feat]} < ${s.root.t}`, lp, lr, s.left);
  addSide(`${FEAT_LABEL[s.root.feat]} ≥ ${s.root.t}`, rp, rr, s.right);
  const stats = leaves.map((l) => ({ ...l, ...leafStats(l.pts) }));
  const correct = stats.reduce((acc, l) => acc + (l.pred === 1 ? l.pass : l.fail), 0);
  const acc = correct / DATA.length;

  // Plain render helper (not a component) so inputs keep focus across re-renders.
  const splitControls = (k: "left" | "right", title: string) => (
    <fieldset className="rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-semibold text-slate-800">{title}</legend>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={s[k].on} onChange={(e) => upd(k, { on: e.target.checked })} /> Split this branch further
      </label>
      {s[k].on && (
        <div className="mt-2 space-y-2">
          <select className="input" aria-label={`${title} feature`} value={s[k].feat} onChange={(e) => upd(k, { feat: e.target.value as Feat })}>
            <option value="study">Hours studied</option>
            <option value="sleep">Hours slept</option>
          </select>
          <Slider id={`dt-${k}`} label="Threshold" value={s[k].t} min={0.5} max={9.5} step={0.5} onChange={(t) => upd(k, { t })} />
        </div>
      )}
    </fieldset>
  );

  return (
    <LabShell
      onReset={() => setS(DEFAULT)}
      challenge={{ text: "Build a tree (at most 2 levels) that classifies every student correctly: 100% accuracy.", done: acc === 1 }}
      explanation={
        <>
          <p>
            A decision tree asks yes/no questions about features. Each final region (a <strong>leaf</strong>) predicts the majority class of the training points inside it.
          </p>
          <p className="mt-1">
            Accuracy is {(acc * 100).toFixed(0)}% ({correct}/{DATA.length}). Gini impurity measures how mixed a leaf is: 0 means every point in it has the same label.{" "}
            {acc < 1 && "Look for a leaf with high impurity. That's where another question would help."}
          </p>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-slate-200 bg-white" role="img" aria-label={`Scatter plot split into ${stats.length} regions; accuracy ${(acc * 100).toFixed(0)} percent`}>
            <defs>
              <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#F0D58C" strokeWidth="2" />
              </pattern>
            </defs>
            {stats.map((l, i) => (
              <rect key={i} x={sx(l.rect.x0)} y={sy(l.rect.y1)} width={sx(l.rect.x1) - sx(l.rect.x0)} height={sy(l.rect.y0) - sy(l.rect.y1)} fill={l.pred ? "#E0EFE7" : "url(#hatch)"} opacity={0.8} stroke="#434B42" strokeDasharray="4 3" />
            ))}
            <line x1={PAD} y1={H - PAD} x2={W} y2={H - PAD} stroke="#9EA397" />
            <line x1={PAD} y1={0} x2={PAD} y2={H - PAD} stroke="#9EA397" />
            <text x={(W + PAD) / 2} y={H - 6} textAnchor="middle" className="text-[0.6875rem]" fill="#565E54">Hours studied</text>
            <text x={10} y={H / 2} textAnchor="middle" transform={`rotate(-90 10 ${H / 2})`} className="text-[0.6875rem]" fill="#565E54">Hours slept</text>
            {DATA.map((p, i) => <Marker key={i} x={sx(p[0])} y={sy(p[1])} series={p[2] ? 2 : 1} size={5} />)}
          </svg>
          <p className="mt-2 text-xs text-slate-600">
            ▲ green triangle = passed · ■ orange square = failed. Green shaded regions predict “pass”; orange hatched regions predict “fail”.
          </p>
        </div>
        <div className="space-y-3">
          <fieldset className="rounded-lg border border-brand-200 bg-brand-50/50 p-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">Root question</legend>
            <select className="input" aria-label="Root feature" value={s.root.feat} onChange={(e) => upd("root", { feat: e.target.value as Feat })}>
              <option value="study">Hours studied</option>
              <option value="sleep">Hours slept</option>
            </select>
            <div className="mt-2">
              <Slider id="dt-root" label="Threshold" value={s.root.t} min={0.5} max={9.5} step={0.5} onChange={(t) => upd("root", { t })} />
            </div>
          </fieldset>
          {splitControls("left", `If ${FEAT_LABEL[s.root.feat].toLowerCase()} < ${s.root.t}`)}
          {splitControls("right", `If ${FEAT_LABEL[s.root.feat].toLowerCase()} ≥ ${s.root.t}`)}
          <Stat label="Training accuracy" value={`${(acc * 100).toFixed(0)}%`} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <caption className="mb-1 text-left text-sm font-semibold text-slate-700">Leaves</caption>
          <thead>
            <tr><th>Path</th><th>Pass / Fail</th><th>Predicts</th><th>Gini</th></tr>
          </thead>
          <tbody>
            {stats.map((l, i) => (
              <tr key={i}>
                <td>{l.name}</td>
                <td>{l.pass} / {l.fail}</td>
                <td>{l.n ? (l.pred ? "Pass" : "Fail") : "n/a"}</td>
                <td>{l.gini.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LabShell>
  );
}
