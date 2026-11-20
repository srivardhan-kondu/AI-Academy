"use client";

import { useState } from "react";
import { LabShell } from "../lab-kit";

/*
 * Illustrative attention weights (NOT from a real model). Scores are
 * hand-authored to show how context changes what a word "looks at".
 */
const ENDINGS = { tired: "tired", wide: "wide" } as const;
type End = keyof typeof ENDINGS;
const base = (end: End) => ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", ENDINGS[end]];

function scores(end: End, q: number): number[] {
  const toks = base(end);
  const s: number[] = toks.map((_, k) => (k === q ? 1.2 : Math.abs(k - q) === 1 ? 0.6 : 0));
  const w = toks[q].toLowerCase();
  const set = (word: string, v: number) => toks.forEach((t, k) => t.toLowerCase() === word && (s[k] = v));
  if (w === "it") {
    set("animal", end === "tired" ? 4 : 1);
    set("street", end === "wide" ? 4 : 1);
    set(ENDINGS[end], 2);
  }
  if (w === "tired") { set("it", 2.5); set("animal", 2.6); }
  if (w === "wide") { set("it", 2.5); set("street", 2.6); }
  if (w === "cross") { set("animal", 2); set("street", 2.5); }
  if (w === "animal") { set("the", 1.5); set("cross", 1.8); }
  if (w === "street") { set("cross", 2.2); }
  if (w === "because") { set("didn't", 1.5); set("was", 1.5); }
  return s;
}
const softmax = (xs: number[]) => {
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp(x - m));
  const z = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / z);
};

export default function Attention() {
  const [end, setEnd] = useState<End>("tired");
  const [q, setQ] = useState(7); // "it"
  const toks = base(end);
  const weights = softmax(scores(end, q));
  const top = weights.map((w, i) => ({ w, i })).filter((x) => x.i !== q).sort((a, b) => b.w - a.w)[0];

  return (
    <LabShell
      onReset={() => { setEnd("tired"); setQ(7); }}
      challenge={{ text: "Change the sentence so that “it” pays the most attention to “street”.", done: toks[q] === "it" && toks[top.i] === "street" }}
      explanation={
        <>
          <p>
            Selected word: <strong>“{toks[q]}”</strong>. Its strongest connection is to <strong>“{toks[top.i]}”</strong> ({(top.w * 100).toFixed(0)}%). The weights always add up to 100%.
          </p>
          <p className="mt-1">
            Attention lets each token gather information from the other tokens that matter for its meaning. “It” is ambiguous on its own. The last word of the sentence decides whether it refers to the animal or the street.
          </p>
          <p className="mt-1 text-xs text-slate-500">Illustrative weights chosen for teaching. Real transformers have many attention heads per layer, each learning different patterns, and their weights are rarely this clean.</p>
        </>
      }
    >
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Sentence ending</legend>
        <div className="mt-1 flex gap-2">
          {(Object.keys(ENDINGS) as End[]).map((e) => (
            <button key={e} type="button" aria-pressed={end === e} className={end === e ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setEnd(e)}>
              …because it was too {e}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <p className="mb-2 text-sm text-slate-700">Click a word to see where it “looks”. Bar height and the percentage show attention weight.</p>
        <div className="flex flex-wrap gap-1.5">
          {toks.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQ(i)}
              aria-pressed={q === i}
              aria-label={`${t}: ${(weights[i] * 100).toFixed(0)} percent attention`}
              className={`flex flex-col items-center rounded-lg border px-2 pb-1 pt-2 text-sm ${q === i ? "border-brand-600 ring-2 ring-brand-300" : "border-slate-200"}`}
              style={{ backgroundColor: `rgba(79,70,229,${q === i ? 0.08 : weights[i] * 0.9})`, color: weights[i] > 0.45 && q !== i ? "white" : undefined }}
            >
              <span className="font-medium">{t}</span>
              <span className="font-mono text-[0.625rem]">{(weights[i] * 100).toFixed(0)}%</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-28 items-end gap-1 rounded-xl border border-slate-200 bg-white p-2" aria-hidden>
        {weights.map((w, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end">
            <div className={`w-full rounded-t ${i === top.i ? "bg-brand-600" : "bg-brand-200"}`} style={{ height: `${Math.max(2, w * 100)}%` }} />
            <span className="mt-1 truncate text-[0.5625rem] text-slate-500">{toks[i]}</span>
          </div>
        ))}
      </div>
    </LabShell>
  );
}
