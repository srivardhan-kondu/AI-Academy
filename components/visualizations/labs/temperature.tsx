"use client";

import { useState } from "react";
import { LabShell, Slider, Stat } from "../lab-kit";

const PROMPT = "The weather today is";
const CANDIDATES = [
  { t: "sunny", logit: 3.2 },
  { t: "cloudy", logit: 2.6 },
  { t: "warm", logit: 2.1 },
  { t: "rainy", logit: 1.9 },
  { t: "perfect", logit: 1.2 },
  { t: "unpredictable", logit: 0.6 },
  { t: "purple", logit: -1.5 },
  { t: "banana", logit: -2.5 },
];

function probs(T: number, k: number) {
  const allowed = CANDIDATES.map((c, i) => i < k);
  const scaled = CANDIDATES.map((c, i) => (allowed[i] ? c.logit / T : -Infinity));
  const m = Math.max(...scaled);
  const e = scaled.map((x) => (Number.isFinite(x) ? Math.exp(x - m) : 0));
  const z = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / z);
}

export default function Temperature() {
  const [T, setT] = useState(1);
  const [k, setK] = useState(CANDIDATES.length);
  const [samples, setSamples] = useState<string[]>([]);
  const p = probs(T, k);
  const entropy = -p.reduce((s, x) => s + (x > 0 ? x * Math.log2(x) : 0), 0);

  const sample = (n: number) => {
    const out: string[] = [];
    for (let j = 0; j < n; j++) {
      let r = Math.random();
      let idx = 0;
      for (; idx < p.length - 1; idx++) {
        r -= p[idx];
        if (r <= 0) break;
      }
      out.push(CANDIDATES[idx].t);
    }
    setSamples((s) => [...out, ...s].slice(0, 30));
  };
  const counts = samples.reduce<Record<string, number>>((acc, s) => ((acc[s] = (acc[s] ?? 0) + 1), acc), {});
  const distinct = Object.keys(counts).length;

  return (
    <LabShell
      onReset={() => { setT(1); setK(CANDIDATES.length); setSamples([]); }}
      challenge={{ text: "Find settings where 20 samples in a row all give the same word — then find settings that produce at least 5 different words.", done: distinct >= 5 }}
      explanation={
        <>
          <p>
            A language model scores every possible next token, converts the scores into probabilities, then <strong>samples</strong> one. Temperature reshapes those probabilities before sampling.
          </p>
          <p className="mt-1">
            {T < 0.4
              ? "Low temperature sharpens the distribution: the top token almost always wins, so output is focused and repetitive."
              : T > 1.4
              ? "High temperature flattens the distribution: unlikely tokens (even “banana”) get real chances, so output becomes varied — and sometimes nonsensical."
              : "Around 1.0 the model's original probabilities are used."}{" "}
            {k < CANDIDATES.length && `Top-k = ${k} removes everything except the ${k} most likely tokens.`}
          </p>
          <p className="mt-1 text-xs text-slate-500">Scores are illustrative. Sampling is random, so pressing “Sample” again gives different results — just like a real model with temperature above 0.</p>
        </>
      }
    >
      <p className="rounded-lg bg-slate-900 px-4 py-3 font-mono text-sm text-slate-100">
        {PROMPT} <span className="rounded bg-brand-600 px-1">▁▁▁</span>
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Slider id="t-temp" label="Temperature" value={T} min={0.1} max={2} step={0.05} onChange={setT} format={(v) => v.toFixed(2)} />
          <Slider id="t-k" label="Top-k (number of tokens allowed)" value={k} min={1} max={CANDIDATES.length} step={1} onChange={setK} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary btn-sm" onClick={() => sample(1)}>Sample 1 token</button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => sample(20)}>Sample 20</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setSamples([])}>Clear samples</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Entropy (randomness)" value={`${entropy.toFixed(2)} bits`} />
            <Stat label="Distinct words sampled" value={distinct} />
          </div>
        </div>
        <ul className="space-y-1.5" aria-label="Next-token probabilities">
          {CANDIDATES.map((c, i) => (
            <li key={c.t} className="flex items-center gap-2 text-sm">
              <span className="w-28 shrink-0 font-mono">{c.t}</span>
              <span className="h-4 flex-1 rounded bg-slate-100">
                <span className="block h-4 rounded bg-brand-500" style={{ width: `${p[i] * 100}%` }} />
              </span>
              <span className="w-12 text-right font-mono text-xs">{(p[i] * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
      {samples.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700">Recent samples (newest first)</p>
          <p className="mt-1 flex flex-wrap gap-1">
            {samples.map((s, i) => <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{s}</span>)}
          </p>
        </div>
      )}
    </LabShell>
  );
}
