"use client";

import { useMemo, useState } from "react";
import { LabShell, Stat } from "../lab-kit";

/*
 * A deliberately simplified subword tokenizer for teaching. Real tokenizers
 * (e.g. byte-pair encoding) learn tens of thousands of pieces from data, so
 * real token counts will differ.
 */
const WORDS = `the a an and or but of to in on at for with is are was were be been it this that these those i you he she we they my your our their
what how why when where who which not no yes can will would should could do does did have has had from by as if then than so
model models data learn learning machine ai token tokens text language large small new old good great time day year people
cat dog house car city world school student teacher work play read write run walk talk think know want like love help use make`
  .split(/\s+/)
  .filter(Boolean);
const PIECES = ["un", "re", "pre", "dis", "token", "ization", "ize", "iz", "ation", "tion", "ing", "ed", "er", "est", "ly", "ness", "ment", "able", "ful", "less", "s", "es", "al", "ic", "ous", "ist", "ism", "ity", "ive", "trans", "form", "neur", "al", "net", "work", "chat", "bot", "gpt", "emb", "ed", "ding", "atten", "tion", "pro", "gram", "comp", "ute", "lang", "uage", "under", "stand", "believ", "incred", "ible", "hap", "py", "ai"];
const VOCAB = new Set([...WORDS, ...PIECES]);
const MAXLEN = 12;

function hashId(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % 50000;
}

function tokenize(text: string): string[] {
  const out: string[] = [];
  // Split into words (keeping a leading space marker) and punctuation.
  const parts = text.match(/\s*[A-Za-z]+|\s*[0-9]|\s*[^\sA-Za-z0-9]|\s+$/g) ?? [];
  for (const part of parts) {
    const lead = part.match(/^\s*/)?.[0] ? " " : "";
    const word = part.trim();
    if (!word) continue;
    if (!/^[A-Za-z]+$/.test(word)) {
      out.push(lead + word);
      continue;
    }
    let i = 0;
    let first = true;
    const lower = word.toLowerCase();
    while (i < word.length) {
      let len = Math.min(MAXLEN, word.length - i);
      while (len > 1 && !VOCAB.has(lower.slice(i, i + len))) len--;
      out.push((first ? lead : "") + word.slice(i, i + len));
      first = false;
      i += len;
    }
  }
  return out;
}

const COLORS = ["bg-indigo-100 ring-indigo-300", "bg-amber-100 ring-amber-300", "bg-emerald-100 ring-emerald-300", "bg-rose-100 ring-rose-300", "bg-sky-100 ring-sky-300"];
const DEFAULT_TEXT = "Tokenization is unbelievably important for language models!";

export default function Tokenizer() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [showIds, setShowIds] = useState(false);
  const tokens = useMemo(() => tokenize(text), [text]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const longest = useMemo(() => {
    let best = { word: "", n: 0 };
    for (const w of text.match(/[A-Za-z]+/g) ?? []) {
      const n = tokenize(w).length;
      if (n > best.n) best = { word: w, n };
    }
    return best;
  }, [text]);

  return (
    <LabShell
      onReset={() => { setText(DEFAULT_TEXT); setShowIds(false); }}
      challenge={{ text: "Find a word that this tokenizer splits into 6 or more tokens. (Hint: try rare or made-up words.)", done: longest.n >= 6 }}
      explanation={
        <>
          <p>
            Language models don&apos;t read letters or whole words. They read <strong>tokens</strong>. Common words are usually one token; rare or long words are split into smaller pieces. A dot (·) marks a token that starts with a space.
          </p>
          <p className="mt-1">
            {longest.n > 1 ? <>The word “{longest.word}” became {longest.n} tokens. </> : null}
            Your text has {words} words but {tokens.length} tokens. Models have limits measured in tokens, and API usage is usually billed per token.
          </p>
          <p className="mt-1 text-xs text-slate-500">Simplified teaching tokenizer: real model tokenizers have much larger learned vocabularies and will produce different counts.</p>
        </>
      }
    >
      <label htmlFor="tok-text" className="label">Text to tokenize</label>
      <textarea id="tok-text" className="input min-h-20 font-mono" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showIds} onChange={(e) => setShowIds(e.target.checked)} /> Show token IDs (numbers the model actually sees)
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-3" aria-label={`${tokens.length} tokens`}>
        {tokens.length === 0 && <span className="text-sm text-slate-500">Type something above.</span>}
        {tokens.map((t, i) => (
          <span key={i} className={`rounded px-1.5 py-0.5 font-mono text-sm ring-1 ${COLORS[i % COLORS.length]}`}>
            {showIds ? hashId(t) : t.replace(/^ /, "·")}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Characters" value={text.length} />
        <Stat label="Words" value={words} />
        <Stat label="Tokens" value={tokens.length} hint={words ? `${(tokens.length / words).toFixed(2)} tokens per word` : undefined} />
      </div>
    </LabShell>
  );
}
