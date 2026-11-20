"use client";

import { useMemo, useState } from "react";
import { LabShell, Slider } from "../lab-kit";

const DOC = `Remote work policy. Employees may work remotely up to three days per week with manager approval. Core collaboration hours are 10:00 to 15:00 local time, and everyone should be reachable on chat during these hours.
Equipment. New starters receive a laptop on their first day. Remote employees can claim up to 300 euros once per year for home-office equipment such as a chair or monitor. Receipts must be submitted within 30 days of purchase.
Leave. Full-time employees receive 25 days of paid annual leave plus public holidays. Up to five unused days can be carried over into the next calendar year. Requests longer than ten consecutive days need approval at least one month in advance.
Expenses. Travel must be booked through the company travel portal. Economy class is standard for flights under six hours. Meal expenses during business travel are reimbursed up to 40 euros per day.
Security. Laptops must use full-disk encryption and automatic screen lock after five minutes. Never share passwords, even with IT staff. Report lost devices to the security team within 24 hours.`;

const QUESTIONS = [
  { q: "How much can I claim for a home office chair?", answer: "300 euros" },
  { q: "How many vacation days can I carry over?", answer: "five unused days" },
  { q: "When must I report a lost laptop?", answer: "within 24 hours" },
];

const STOP = new Set("a an the of to in on for and or is are be can i my me how what when much many must with at by do does need any".split(" "));
const SYN: Record<string, string[]> = { vacation: ["leave", "annual"], chair: ["equipment", "home-office"], laptop: ["devices", "laptops"], claim: ["claim"], lost: ["lost"] };
const terms = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));

function chunk(words: string[], size: number, overlap: number) {
  const out: { text: string; start: number }[] = [];
  const stride = Math.max(1, size - overlap);
  for (let i = 0; i < words.length; i += stride) {
    out.push({ text: words.slice(i, i + size).join(" "), start: i });
    if (i + size >= words.length) break;
  }
  return out;
}

type Chunk = { text: string; start: number };

function retrieve(chunks: Chunk[], qi: number, k: number) {
  const Q = QUESTIONS[qi];
  const qTerms = terms(Q.q).flatMap((t) => [t, ...(SYN[t] ?? [])]);
  const scored = chunks
    .map((c, i) => {
      const ct = terms(c.text);
      const hits = qTerms.filter((t) => ct.some((w) => w.startsWith(t) || (t.startsWith(w) && w.length > 3)));
      return { ...c, i, score: hits.length / Math.sqrt(ct.length || 1), hits };
    })
    .sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k).filter((c) => c.score > 0);
  const found = top.some((c) => c.text.toLowerCase().includes(Q.answer.toLowerCase()));
  return { scored, top, found };
}

export default function RagPipeline() {
  // Deliberately poor defaults: tiny chunks and top-1 miss most answers.
  const [size, setSize] = useState(8);
  const [overlap, setOverlap] = useState(0);
  const [k, setK] = useState(1);
  const [qi, setQi] = useState(0);

  const words = useMemo(() => DOC.split(/\s+/), []);
  const chunks = useMemo(() => chunk(words, size, Math.min(overlap, size - 1)), [words, size, overlap]);
  const Q = QUESTIONS[qi];
  const { scored, top, found } = retrieve(chunks, qi, k);
  const contextWords = top.reduce((sum, c) => sum + c.text.split(" ").length, 0);
  // Challenge: one set of settings that retrieves the answer for every question.
  const solvedCount = QUESTIONS.filter((_, i) => retrieve(chunks, i, k).found).length;

  return (
    <LabShell
      onReset={() => { setSize(8); setOverlap(0); setK(1); setQi(0); }}
      challenge={{ text: `Find one set of settings that retrieves the answer for all three questions (currently ${solvedCount}/3). Then try very small and very large chunks.`, done: solvedCount === QUESTIONS.length }}
      explanation={
        <>
          <p>
            The document is split into {chunks.length} chunks of about {size} words. The question is compared with every chunk; the top {k} are placed into the model&apos;s context ({contextWords} words). The model can only answer from what it is given.
          </p>
          <p className="mt-1">
            {found
              ? `✓ The answer (“${Q.answer}”) is in the retrieved context, so a well-instructed model can answer and cite it.`
              : `✗ The answer (“${Q.answer}”) is not in the retrieved context. The model would have to say “I don't know”, or might hallucinate.`}{" "}
            Small chunks are precise but can cut an answer away from its topic words; large chunks keep context but add noise and cost.
          </p>
          <p className="mt-1 text-xs text-slate-500">Simplified: relevance here is keyword overlap. Production RAG systems usually compare embeddings (semantic similarity), often combined with keyword search and reranking.</p>
        </>
      }
    >
      <div>
        <label htmlFor="rag-q" className="label">Question</label>
        <select id="rag-q" className="input" value={qi} onChange={(e) => setQi(Number(e.target.value))}>
          {QUESTIONS.map((q, i) => <option key={i} value={i}>{q.q}</option>)}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider id="rag-size" label="Chunk size (words)" value={size} min={8} max={120} step={4} onChange={setSize} />
        <Slider id="rag-overlap" label="Overlap (words)" value={overlap} min={0} max={30} step={2} onChange={setOverlap} />
        <Slider id="rag-k" label="Chunks retrieved (top-k)" value={k} min={1} max={5} step={1} onChange={setK} />
      </div>
      <ol className="flex flex-wrap gap-2 text-xs" aria-label="Pipeline stages">
        {["1. Chunk document", "2. Score chunks vs question", `3. Keep top ${k}`, "4. Build prompt context", "5. Model answers from context"].map((s) => (
          <li key={s} className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-800 ring-1 ring-brand-200">{s}</li>
        ))}
      </ol>
      <ul className="max-h-80 space-y-2 overflow-auto pr-1">
        {scored.map((c) => {
          const picked = top.includes(c);
          const hasAnswer = c.text.toLowerCase().includes(Q.answer.toLowerCase());
          return (
            <li key={c.i} className={`rounded-lg border p-3 text-xs ${picked ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white text-slate-500"}`}>
              <p className="mb-1 flex flex-wrap items-center gap-2 font-semibold text-slate-700">
                <span>Chunk {c.i + 1}</span>
                <span className="font-mono">score {c.score.toFixed(2)}</span>
                {picked && <span className="badge bg-brand-600 text-white">retrieved</span>}
                {hasAnswer && <span className="badge bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300">contains answer</span>}
                {c.hits.length > 0 && <span className="font-normal text-slate-500">matched: {c.hits.join(", ")}</span>}
              </p>
              <p>{c.text}</p>
            </li>
          );
        })}
      </ul>
    </LabShell>
  );
}
