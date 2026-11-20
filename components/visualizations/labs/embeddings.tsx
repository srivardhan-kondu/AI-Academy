"use client";

import { useState } from "react";
import { LabShell, Marker } from "../lab-kit";

/*
 * Hand-crafted 8-dimensional "embeddings" so the dimensions are interpretable:
 * [animal, food, vehicle, royalty, person, male, female, emotion]
 * Real embeddings have hundreds or thousands of learned, uninterpretable dimensions.
 */
type Word = { w: string; v: number[]; x: number; y: number; g: number };
const WORDS: Word[] = [
  { w: "cat", v: [1, 0, 0, 0, 0, 0, 0, 0.1], x: 15, y: 75, g: 0 },
  { w: "dog", v: [1, 0, 0, 0, 0, 0, 0, 0.2], x: 22, y: 82, g: 0 },
  { w: "kitten", v: [0.95, 0, 0, 0, 0, 0, 0, 0.3], x: 10, y: 68, g: 0 },
  { w: "puppy", v: [0.95, 0, 0, 0, 0, 0, 0, 0.35], x: 26, y: 70, g: 0 },
  { w: "apple", v: [0, 1, 0, 0, 0, 0, 0, 0], x: 78, y: 82, g: 1 },
  { w: "banana", v: [0, 1, 0, 0, 0, 0, 0, 0], x: 85, y: 75, g: 1 },
  { w: "bread", v: [0, 0.9, 0, 0, 0, 0, 0, 0.05], x: 72, y: 72, g: 1 },
  { w: "car", v: [0, 0, 1, 0, 0, 0, 0, 0], x: 80, y: 22, g: 2 },
  { w: "bus", v: [0, 0, 1, 0, 0, 0, 0, 0], x: 88, y: 15, g: 2 },
  { w: "bicycle", v: [0, 0, 0.9, 0, 0.05, 0, 0, 0.1], x: 74, y: 12, g: 2 },
  { w: "king", v: [0, 0, 0, 1, 1, 1, 0, 0], x: 38, y: 28, g: 3 },
  { w: "queen", v: [0, 0, 0, 1, 1, 0, 1, 0], x: 48, y: 22, g: 3 },
  { w: "prince", v: [0, 0, 0, 0.8, 1, 1, 0, 0], x: 33, y: 20, g: 3 },
  { w: "princess", v: [0, 0, 0, 0.8, 1, 0, 1, 0], x: 52, y: 14, g: 3 },
  { w: "man", v: [0, 0, 0, 0, 1, 1, 0, 0], x: 30, y: 42, g: 4 },
  { w: "woman", v: [0, 0, 0, 0, 1, 0, 1, 0], x: 44, y: 44, g: 4 },
  { w: "happy", v: [0, 0, 0, 0, 0.1, 0, 0, 1], x: 58, y: 55, g: 4 },
  { w: "joyful", v: [0, 0, 0, 0, 0.1, 0, 0, 0.95], x: 64, y: 50, g: 4 },
];
const norm = (a: number[]) => Math.sqrt(a.reduce((s, x) => s + x * x, 0));
const cos = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0) / (norm(a) * norm(b) || 1);
const W = 360, H = 260;
const sx = (x: number) => (x / 100) * W;
const sy = (y: number) => H - (y / 100) * H;
const byWord = (w: string) => WORDS.find((x) => x.w === w)!;

export default function EmbeddingExplorer() {
  const [sel, setSel] = useState("cat");
  const [a, setA] = useState("king");
  const [b, setB] = useState("man");
  const [c, setC] = useState("woman");

  const s = byWord(sel);
  const neighbours = WORDS.filter((w) => w.w !== sel)
    .map((w) => ({ w: w.w, sim: cos(s.v, w.v) }))
    .sort((p, q) => q.sim - p.sim)
    .slice(0, 5);
  const target = byWord(a).v.map((x, i) => x - byWord(b).v[i] + byWord(c).v[i]);
  const analogy = WORDS.filter((w) => ![a, b, c].includes(w.w))
    .map((w) => ({ w: w.w, sim: cos(target, w.v) }))
    .sort((p, q) => q.sim - p.sim)[0];

  return (
    <LabShell
      onReset={() => { setSel("cat"); setA("king"); setB("man"); setC("woman"); }}
      challenge={{ text: "Use vector arithmetic to land on “princess” (hint: start from “prince”).", done: analogy?.w === "princess" }}
      explanation={
        <>
          <p>
            An <strong>embedding</strong> turns a word into a list of numbers (a vector). Words used in similar ways get similar vectors, so “similar meaning” becomes “nearby in space”.
          </p>
          <p className="mt-1">
            Nearest to “{sel}”: {neighbours.map((n) => `${n.w} (${n.sim.toFixed(2)})`).join(", ")}. Similarity here is <em>cosine similarity</em>: 1 = same direction, 0 = unrelated.
          </p>
          <p className="mt-1 text-xs text-slate-500">Simplified: these 8-dimensional vectors were hand-made so the dimensions are readable. Real embeddings are learned from data and have far more dimensions; the 2-D map is an approximate layout.</p>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-slate-200 bg-white" role="group" aria-label="2D map of word embeddings">
          {neighbours.slice(0, 3).map((n) => (
            <line key={n.w} x1={sx(s.x)} y1={sy(s.y)} x2={sx(byWord(n.w).x)} y2={sy(byWord(n.w).y)} stroke="#1E8A77" strokeDasharray="3 3" />
          ))}
          {WORDS.map((w) => (
            <g
              key={w.w}
              role="button"
              tabIndex={0}
              aria-pressed={sel === w.w}
              aria-label={w.w}
              className="cursor-pointer focus:outline-none"
              onClick={() => setSel(w.w)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(w.w))}
            >
              <Marker x={sx(w.x)} y={sy(w.y)} series={w.g} size={sel === w.w ? 7 : 4.5} filled={sel === w.w || neighbours.some((n) => n.w === w.w)} />
              <text x={sx(w.x) + 8} y={sy(w.y) + 4} className={`text-[0.6875rem] ${sel === w.w ? "font-bold" : ""}`} fill="#1C241F">{w.w}</text>
            </g>
          ))}
        </svg>
        <div className="space-y-4">
          <div>
            <label htmlFor="emb-sel" className="label">Selected word</label>
            <select id="emb-sel" className="input" value={sel} onChange={(e) => setSel(e.target.value)}>
              {WORDS.map((w) => <option key={w.w}>{w.w}</option>)}
            </select>
          </div>
          <fieldset className="rounded-lg border border-slate-200 p-3">
            <legend className="px-1 text-sm font-semibold">Vector arithmetic</legend>
            <div className="flex flex-wrap items-center gap-1 text-sm">
              {[[a, setA], [b, setB], [c, setC]].map(([val, set], i) => (
                <span key={i} className="flex items-center gap-1">
                  {i === 1 && <span aria-hidden>−</span>}
                  {i === 2 && <span aria-hidden>+</span>}
                  <select aria-label={["Start word", "Subtract", "Add"][i]} className="input w-auto py-1" value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)}>
                    {WORDS.map((w) => <option key={w.w}>{w.w}</option>)}
                  </select>
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm">
              ≈ <strong className="text-brand-700">{analogy?.w}</strong> <span className="text-slate-500">(similarity {analogy?.sim.toFixed(2)})</span>
            </p>
          </fieldset>
        </div>
      </div>
    </LabShell>
  );
}
