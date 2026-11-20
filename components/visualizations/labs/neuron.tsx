"use client";

import { useState } from "react";
import { LabShell, Slider } from "../lab-kit";

type Act = "step" | "sigmoid" | "relu";
const ACT: Record<Act, (z: number) => number> = {
  step: (z) => (z >= 0 ? 1 : 0),
  sigmoid: (z) => 1 / (1 + Math.exp(-z)),
  relu: (z) => Math.max(0, z),
};
const DEFAULT = { x1: 1, x2: 0, w1: 0.5, w2: 0.5, b: -0.2, act: "step" as Act };

export default function NeuronPlayground() {
  const [s, setS] = useState(DEFAULT);
  const set = (k: keyof typeof DEFAULT) => (v: number) => setS((p) => ({ ...p, [k]: v }));
  const z = s.w1 * s.x1 + s.w2 * s.x2 + s.b;
  const out = ACT[s.act](z);
  const table = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ].map(([a, c]) => ({ a, c, y: ACT.step(s.w1 * a + s.w2 * c + s.b), want: a && c ? 1 : 0 }));
  const isAnd = table.every((r) => r.y === r.want);

  const edge = (w: number) => ({
    stroke: w >= 0 ? "#16564B" : "#C98A06",
    strokeWidth: 1 + Math.abs(w) * 3,
    strokeDasharray: w < 0 ? "6 4" : undefined,
  });

  return (
    <LabShell
      onReset={() => setS(DEFAULT)}
      challenge={{ text: "Using the step activation, choose weights and bias so the neuron behaves like an AND gate (output 1 only when both inputs are 1).", done: isAnd }}
      explanation={
        <>
          <p>
            Weighted sum: <code className="font-mono">z = w₁·x₁ + w₂·x₂ + b</code> = {s.w1.toFixed(2)}×{s.x1.toFixed(2)} + {s.w2.toFixed(2)}×{s.x2.toFixed(2)} + ({s.b.toFixed(2)}) ={" "}
            <strong>{z.toFixed(3)}</strong>
          </p>
          <p className="mt-1">
            The {s.act} activation turns z into the output <strong>{out.toFixed(3)}</strong>.{" "}
            {s.act === "step" && "Step outputs 1 when z ≥ 0, otherwise 0."}
            {s.act === "sigmoid" && "Sigmoid squashes any number smoothly into the range 0-1."}
            {s.act === "relu" && "ReLU passes positive values through and turns negatives into 0."}
          </p>
          <p className="mt-1 text-slate-600">Solid blue lines are positive weights; dashed orange lines are negative. Thicker lines mean larger weights.</p>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label={`Neuron with output ${out.toFixed(2)}`}>
          <line x1={60} y1={60} x2={200} y2={100} {...edge(s.w1)} />
          <line x1={60} y1={140} x2={200} y2={100} {...edge(s.w2)} />
          <line x1={240} y1={100} x2={290} y2={100} stroke="#1C241F" strokeWidth={2} />
          <circle cx={45} cy={60} r={22} fill="#EEEDE4" stroke="#6B7268" />
          <circle cx={45} cy={140} r={22} fill="#EEEDE4" stroke="#6B7268" />
          <text x={45} y={64} textAnchor="middle" className="text-[0.75rem]">x₁={s.x1.toFixed(1)}</text>
          <text x={45} y={144} textAnchor="middle" className="text-[0.75rem]">x₂={s.x2.toFixed(1)}</text>
          <text x={125} y={65} className="text-[0.6875rem]" fill="#434B42">w₁={s.w1.toFixed(1)}</text>
          <text x={125} y={150} className="text-[0.6875rem]" fill="#434B42">w₂={s.w2.toFixed(1)}</text>
          <circle cx={220} cy={100} r={30} fill={`rgba(79,70,229,${0.15 + Math.min(1, Math.abs(out)) * 0.6})`} stroke="#16564B" strokeWidth={2} />
          <text x={220} y={96} textAnchor="middle" className="text-[0.6875rem] font-semibold">Σ → {s.act}</text>
          <text x={220} y={112} textAnchor="middle" className="text-[0.6875rem]">b={s.b.toFixed(1)}</text>
          <text x={300} y={90} textAnchor="middle" className="text-[0.75rem] font-semibold">y</text>
          <text x={300} y={118} textAnchor="middle" className="text-[0.75rem]">{out.toFixed(2)}</text>
        </svg>

        <div className="space-y-3">
          <Slider id="n-x1" label="Input x₁" value={s.x1} min={0} max={1} step={0.1} onChange={set("x1")} format={(v) => v.toFixed(1)} />
          <Slider id="n-x2" label="Input x₂" value={s.x2} min={0} max={1} step={0.1} onChange={set("x2")} format={(v) => v.toFixed(1)} />
          <Slider id="n-w1" label="Weight w₁" value={s.w1} min={-2} max={2} step={0.1} onChange={set("w1")} format={(v) => v.toFixed(1)} />
          <Slider id="n-w2" label="Weight w₂" value={s.w2} min={-2} max={2} step={0.1} onChange={set("w2")} format={(v) => v.toFixed(1)} />
          <Slider id="n-b" label="Bias b" value={s.b} min={-2} max={2} step={0.1} onChange={set("b")} format={(v) => v.toFixed(1)} />
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Activation function</legend>
            <div className="mt-1 flex gap-2">
              {(["step", "sigmoid", "relu"] as Act[]).map((a) => (
                <label key={a} className={`btn btn-sm cursor-pointer border ${s.act === a ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"}`}>
                  <input type="radio" className="sr-only" name="act" checked={s.act === a} onChange={() => setS((p) => ({ ...p, act: a }))} />
                  {a}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table max-w-md">
          <caption className="mb-1 text-left text-sm font-semibold text-slate-700">Truth table with step activation (AND gate target)</caption>
          <thead>
            <tr>
              <th>x₁</th>
              <th>x₂</th>
              <th>Neuron output</th>
              <th>AND target</th>
              <th>Match</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r) => (
              <tr key={`${r.a}${r.c}`}>
                <td>{r.a}</td>
                <td>{r.c}</td>
                <td>{r.y}</td>
                <td>{r.want}</td>
                <td>{r.y === r.want ? "✓ yes" : "✗ no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LabShell>
  );
}
