"use client";

import { useState } from "react";
import { LabShell } from "../lab-kit";

const EMAIL = `Hi, I ordered a standing desk (order #48213) three weeks ago. It arrived with a cracked leg, I've emailed twice with photos and nobody has replied. I need this sorted before Friday because I'm starting a new job from home. Honestly about to ask for a refund. — Priya`;

const PARTS = [
  { key: "role", label: "Role", text: "You are an experienced customer-support team lead." },
  { key: "context", label: "Context", text: `Here is a customer email:\n"""\n${EMAIL}\n"""` },
  { key: "task", label: "Clear task", text: "Summarise the email for the support agent who will handle it, and recommend the next action." },
  { key: "format", label: "Output format", text: "Respond in exactly this format:\nIssue: <one sentence>\nUrgency: <low|medium|high> — <reason>\nCustomer sentiment: <one word>\nNext action: <one sentence>" },
  { key: "constraints", label: "Constraints", text: "Do not invent order details that are not in the email. Keep the whole answer under 60 words." },
  { key: "example", label: "Example", text: "Example output for a different email:\nIssue: Wrong size jacket delivered.\nUrgency: low — no deadline mentioned\nCustomer sentiment: neutral\nNext action: Send a prepaid return label and offer an exchange." },
] as const;
type Key = (typeof PARTS)[number]["key"];

/* Pre-written outputs that illustrate typical differences. NOT live model output. */
function simulated(on: Set<Key>): { text: string; notes: string[] } {
  const notes: string[] = [];
  if (!on.has("context")) {
    return {
      text: "I'd be happy to help summarise an email! Could you please share the email you'd like me to summarise?",
      notes: ["Without the email itself, the model has nothing to work with. Context is essential."],
    };
  }
  if (!on.has("task")) {
    notes.push("No clear task: the model has to guess what you want, so it just reacts to the email.");
    return { text: "It sounds like Priya has had a frustrating experience with a damaged standing desk. It's understandable that she's upset after two unanswered emails. Is there anything specific you'd like me to do with this email?", notes };
  }
  if (!on.has("format")) {
    notes.push("Correct but unstructured: hard for an agent (or software) to scan or parse reliably.");
    if (!on.has("constraints")) notes.push("No length limit, so the answer runs long.");
    return {
      text: "The customer, Priya, ordered a standing desk (order #48213) about three weeks ago. When it arrived one of the legs was cracked. She has contacted support twice with photos but hasn't received any response, which has made her frustrated. She needs the issue resolved before Friday as she starts a remote job. She mentions she may request a refund. The agent should apologise for the delay, arrange a replacement leg or desk urgently, and consider offering expedited shipping or compensation for the inconvenience.",
      notes,
    };
  }
  const text =
    "Issue: Standing desk (order #48213) arrived with a cracked leg; two emails with photos unanswered.\nUrgency: high — needed before Friday, refund threatened\nCustomer sentiment: frustrated\nNext action: Apologise today and ship an express replacement leg, confirming delivery before Friday.";
  if (!on.has("role")) notes.push("Works well, but a role can steer tone and priorities (e.g. a team lead focuses on escalation).");
  if (!on.has("constraints")) notes.push("Without constraints, models sometimes add details that aren't in the source. Constraints reduce that risk; they don't eliminate it.");
  if (!on.has("example")) notes.push("An example helps the model match your exact style — most useful when the format is unusual.");
  if (notes.length === 0) notes.push("Structured, grounded and scannable. Each component removes a different kind of guesswork.");
  return { text, notes };
}

const DEFAULT: Key[] = ["context"];

export default function PromptPlayground() {
  const [on, setOn] = useState<Set<Key>>(new Set(DEFAULT));
  const toggle = (k: Key) => setOn((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const prompt = PARTS.filter((p) => on.has(p.key)).map((p) => p.text).join("\n\n");
  const out = simulated(on);
  const done = on.has("context") && on.has("task") && on.has("format") && on.has("constraints");

  return (
    <LabShell
      onReset={() => setOn(new Set(DEFAULT))}
      challenge={{ text: "Build a prompt that gives a structured, grounded answer: include context, a clear task, an output format and constraints.", done }}
      explanation={
        <>
          <ul className="list-disc space-y-1 pl-5">
            {out.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
          <p className="mt-2 text-xs text-slate-500">Simulated responses: pre-written to illustrate typical differences. Real model outputs vary between runs and models — always test prompts on the model you will actually use.</p>
        </>
      }
    >
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Prompt components</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PARTS.map((p) => (
            <label key={p.key} className={`btn btn-sm cursor-pointer border ${on.has(p.key) ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}>
              <input type="checkbox" className="sr-only" checked={on.has(p.key)} onChange={() => toggle(p.key)} />
              {on.has(p.key) ? "✓ " : "+ "}
              {p.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-800">Your prompt</p>
          <pre className="max-h-80 min-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{prompt || "(empty prompt)"}</pre>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-800">Simulated response</p>
          <pre className="max-h-80 min-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-800">{out.text}</pre>
        </div>
      </div>
    </LabShell>
  );
}
