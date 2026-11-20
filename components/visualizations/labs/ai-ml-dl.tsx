"use client";

import { useState } from "react";
import { LabShell } from "../lab-kit";

const RINGS = [
  {
    key: "ai",
    label: "Artificial Intelligence",
    r: 150,
    fill: "#EEF2EF",
    text: "Any technique that lets computers perform tasks we associate with human intelligence — including hand-written rules, search and planning.",
    example: "A chess program that searches possible moves using rules written by programmers.",
  },
  {
    key: "ml",
    label: "Machine Learning",
    r: 108,
    fill: "#DCEAE4",
    text: "A subset of AI where systems learn patterns from data instead of following only hand-written rules.",
    example: "A spam filter that learns from thousands of labelled emails.",
  },
  {
    key: "dl",
    label: "Deep Learning",
    r: 68,
    fill: "#FBF0D4",
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
          <p className="mt-1 text-ink-2">
            Each circle sits inside the previous one: all deep learning is machine learning, and all machine learning is AI — but not the other way round.
          </p>
        </>
      }
      challenge={{ text: "Classify all six systems correctly.", done: checked && correct === ITEMS.length }}
    >
      <div className="space-y-8">
        <div className="grid items-center gap-6 sm:grid-cols-[16.25rem_minmax(0,1fr)]">
          <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-[16.25rem]" role="group" aria-label="Nested circles: AI contains ML, which contains deep learning">
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
                  stroke={selected === r.key ? "#16564B" : "#1E8A77"}
                  strokeWidth={selected === r.key ? 2.5 : 1.5}
                  strokeDasharray={selected === r.key ? undefined : "4 3"}
                />
                <text
                  x={160}
                  y={160 + (150 - r.r) * 0.35 - r.r + 24}
                  textAnchor="middle"
                  className="pointer-events-none select-none text-[0.9062rem] font-semibold"
                  fill={r.key === "dl" ? "#8A6200" : "#16564B"}
                >
                  {r.label}
                </text>
              </g>
            ))}
          </svg>
          <div>
            <p className="text-[0.9062rem] font-medium text-ink-2">Select a layer to read its definition</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RINGS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`btn btn-sm border font-medium ${selected === r.key ? "border-brand bg-brand text-surface" : "border-line bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
                  onClick={() => setSelected(r.key)}
                  aria-pressed={selected === r.key}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[1.0312rem] font-semibold text-ink">Sort each system into the right box</p>
          <p className="mt-1 font-serif text-[1.125rem] text-ink-2">Pick the most specific category — look for the tell in how the system got its knowledge.</p>
          <ul className="mt-4 overflow-hidden rounded-[14px] border border-line bg-surface">
            {ITEMS.map((it, i) => (
              <li key={i} className={`px-4 py-3.5 sm:px-5 ${i > 0 ? "border-t border-line" : ""}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
                  <p className="font-serif text-[1.125rem] leading-snug text-ink">{it.text}</p>
                  <div className="flex shrink-0 gap-1.5" role="radiogroup" aria-label={`Category for: ${it.text}`}>
                    {RINGS.map((r) => {
                      const on = answers[i] === r.key;
                      const verdict = checked && on ? (answers[i] === it.answer ? "good" : "bad") : null;
                      return (
                        <button
                          key={r.key}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={r.key === "ai" ? "Rule-based AI" : r.key === "ml" ? "Machine learning" : "Deep learning"}
                          onClick={() => {
                            setAnswers((a) => ({ ...a, [i]: r.key }));
                            setChecked(false);
                          }}
                          className={`rounded-[8px] border px-3 py-1.5 text-[0.9062rem] font-medium transition-colors ${
                            verdict === "good"
                              ? "border-good bg-good text-surface"
                              : verdict === "bad"
                                ? "border-bad bg-bad text-surface"
                                : on
                                  ? "border-brand bg-brand text-surface"
                                  : "border-line bg-surface-2 text-ink-2 hover:border-ink-3/40 hover:text-ink"
                          }`}
                        >
                          {r.key === "ai" ? "Rule-based" : r.key === "ml" ? "ML" : "Deep learning"}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {checked && answers[i] && (
                  <p className={`mt-2.5 rounded-[8px] px-3 py-2 text-[0.9375rem] ${answers[i] === it.answer ? "bg-good-weak text-good" : "bg-bad-weak text-bad"}`}>
                    <strong>{answers[i] === it.answer ? "Correct. " : "Not quite. "}</strong>
                    {it.why}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button type="button" className="btn-primary" onClick={() => setChecked(true)} disabled={Object.keys(answers).length < ITEMS.length}>
              Check my answers
            </button>
            {checked ? (
              <p className="text-[0.9688rem] font-medium text-ink" role="status">
                {correct} of {ITEMS.length} correct.
              </p>
            ) : (
              Object.keys(answers).length < ITEMS.length && <p className="text-[0.9062rem] text-ink-3">Answer all six to check.</p>
            )}
          </div>
        </div>
      </div>
    </LabShell>
  );
}
