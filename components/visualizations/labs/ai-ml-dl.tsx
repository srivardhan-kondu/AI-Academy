"use client";

import { useState } from "react";
import { LabShell } from "../lab-kit";

const RINGS = [
  {
    key: "ai",
    label: "Artificial Intelligence",
    r: 150,
    fill: "#eef2ff",
    text: "Any technique that lets computers perform tasks we associate with human intelligence — including hand-written rules, search and planning.",
    example: "A chess program that searches possible moves using rules written by programmers.",
  },
  {
    key: "ml",
    label: "Machine Learning",
    r: 108,
    fill: "#c7d2fe",
    text: "A subset of AI where systems learn patterns from data instead of following only hand-written rules.",
    example: "A spam filter that learns from thousands of labelled emails.",
  },
  {
    key: "dl",
    label: "Deep Learning",
    r: 68,
    fill: "#818cf8",
    text: "A subset of ML that uses neural networks with many layers to learn features directly from raw data such as pixels, audio or text.",
    example: "Face unlock on a phone, speech recognition, large language models.",
  },
] as const;

const ITEMS = [
  { text: "An expert system that diagnoses faults using hundreds of hand-written if–then rules", answer: "ai", why: "No learning from data — the knowledge is written by people. It is AI, but not machine learning." },
  { text: "A spam filter trained with logistic regression on labelled emails", answer: "ml", why: "It learns from labelled examples using a classic (non-deep) ML algorithm." },
  { text: "Phone face unlock using a convolutional neural network", answer: "dl", why: "Multi-layer neural networks learning directly from images — deep learning." },
  { text: "A movie recommender that learns from user ratings with matrix factorisation", answer: "ml", why: "It learns patterns from data, but with a classic ML technique rather than a deep network." },
  { text: "A chatbot built on a large language model", answer: "dl", why: "LLMs are very large deep neural networks (transformers)." },
  { text: "A route planner that finds the shortest path with the A* search algorithm", answer: "ai", why: "Search algorithms are classic AI techniques that do not learn from data." },
] as const;

type RingKey = (typeof RINGS)[number]["key"];

export default function AiMlDlExplorer() {
  const [selected, setSelected] = useState<RingKey>("ai");
  const [answers, setAnswers] = useState<Record<number, RingKey>>({});
  const [checked, setChecked] = useState(false);

  const ring = RINGS.find((r) => r.key === selected)!;
  const correct = ITEMS.filter((it, i) => answers[i] === it.answer).length;
  const reset = () => {
    setSelected("ai");
    setAnswers({});
    setChecked(false);
  };

  return (
    <LabShell
      onReset={reset}
      explanation={
        <>
          <p>
            <strong>{ring.label}:</strong> {ring.text}
          </p>
          <p className="mt-1">
            <em>Example:</em> {ring.example}
          </p>
          <p className="mt-1 text-slate-600">
            Each circle sits inside the previous one: all deep learning is machine learning, and all machine learning is AI — but not the other way round.
          </p>
        </>
      }
      challenge={{ text: "Classify all six systems correctly.", done: checked && correct === ITEMS.length }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-xs" role="group" aria-label="Nested circles: AI contains ML, which contains deep learning">
            {RINGS.map((r) => (
              <g
                key={r.key}
                role="button"
                tabIndex={0}
                aria-pressed={selected === r.key}
                aria-label={r.label}
                onClick={() => setSelected(r.key)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(r.key))}
                className="cursor-pointer focus:outline-none"
              >
                <circle
                  cx={160}
                  cy={160 + (150 - r.r) * 0.35}
                  r={r.r}
                  fill={r.fill}
                  stroke={selected === r.key ? "#312e81" : "#6366f1"}
                  strokeWidth={selected === r.key ? 4 : 1.5}
                  strokeDasharray={selected === r.key ? undefined : "4 3"}
                />
                <text
                  x={160}
                  y={160 + (150 - r.r) * 0.35 - r.r + 22}
                  textAnchor="middle"
                  className="pointer-events-none select-none text-[13px] font-semibold"
                  fill="#1e1b4b"
                >
                  {r.label}
                </text>
              </g>
            ))}
          </svg>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {RINGS.map((r) => (
              <button key={r.key} type="button" className={selected === r.key ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setSelected(r.key)} aria-pressed={selected === r.key}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Classify each system by its most specific category</p>
          <ul className="mt-2 space-y-3">
            {ITEMS.map((it, i) => (
              <li key={i} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-800">{it.text}</p>
                <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={`Category for: ${it.text}`}>
                  {RINGS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      role="radio"
                      aria-checked={answers[i] === r.key}
                      onClick={() => {
                        setAnswers((a) => ({ ...a, [i]: r.key }));
                        setChecked(false);
                      }}
                      className={`btn btn-sm border ${answers[i] === r.key ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}
                    >
                      {r.key === "ai" ? "AI (rules/search)" : r.key === "ml" ? "Machine learning" : "Deep learning"}
                    </button>
                  ))}
                </div>
                {checked && answers[i] && (
                  <p className={`mt-2 text-xs ${answers[i] === it.answer ? "text-emerald-700" : "text-rose-700"}`}>
                    {answers[i] === it.answer ? "✓ Correct. " : "✗ Not quite. "}
                    {it.why}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <button type="button" className="btn-primary btn-sm mt-3" onClick={() => setChecked(true)} disabled={Object.keys(answers).length < ITEMS.length}>
            Check classifications
          </button>
          {checked && (
            <p className="mt-2 text-sm font-medium" role="status">
              {correct} of {ITEMS.length} correct.
            </p>
          )}
        </div>
      </div>
    </LabShell>
  );
}
