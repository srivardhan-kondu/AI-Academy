"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import { submitQuiz } from "@/app/actions/learning";
import type { ClientQuiz } from "@/lib/content/queries";
import type { GradeResult } from "@/lib/assessment/grade";

export function QuizBlock({ quiz, previouslyPassed }: { quiz: ClientQuiz | undefined; previouslyPassed?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<(GradeResult & { saved: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!quiz) {
    return <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">This knowledge check is not available right now.</p>;
  }

  const select = (qid: string, idx: number, multiple: boolean) => {
    if (result) return;
    setAnswers((a) => {
      const cur = a[qid] ?? [];
      if (!multiple) return { ...a, [qid]: [idx] };
      return { ...a, [qid]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx] };
    });
  };

  const answeredAll = quiz.questions.every((q) => (answers[q.id] ?? []).length > 0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await submitQuiz(quiz.id, answers);
      if ("error" in r) setError(r.error);
      else setResult(r);
    });
  };

  const retry = () => {
    setResult(null);
    setAnswers({});
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-brand-200 bg-white p-6" aria-labelledby={`quiz-${quiz.id}`}>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-700">
        <ClipboardCheck aria-hidden className="h-4 w-4" /> Knowledge check
      </p>
      <h3 id={`quiz-${quiz.id}`} className="mt-1 text-xl font-semibold text-slate-900">
        {quiz.title}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Pass mark: {quiz.passThreshold}%. You can retry as many times as you like — explanations appear after you submit.
        {previouslyPassed && <span className="ml-1 font-medium text-emerald-700">You have already passed this check.</span>}
      </p>

      <ol className="mt-6 space-y-6">
        {quiz.questions.map((q, qi) => {
          const multiple = q.questionType === "multiple";
          const r = result?.results.find((x) => x.questionId === q.id);
          return (
            <li key={q.id}>
              <fieldset>
                <legend className="font-medium text-slate-900">
                  {qi + 1}. {q.prompt}
                  {multiple && <span className="ml-2 text-sm font-normal text-slate-500">(select all that apply)</span>}
                </legend>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => {
                    const checked = (answers[q.id] ?? []).includes(oi);
                    const isCorrect = r?.correctAnswers.includes(oi);
                    const state = !r ? "" : isCorrect ? "border-emerald-400 bg-emerald-50" : checked ? "border-rose-400 bg-rose-50" : "";
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 ${state}`}
                      >
                        <input
                          type={multiple ? "checkbox" : "radio"}
                          name={q.id}
                          className="mt-1"
                          checked={checked}
                          disabled={!!result}
                          onChange={() => select(q.id, oi, multiple)}
                        />
                        <span className="flex-1 text-slate-800">{opt}</span>
                        {r && isCorrect && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 aria-hidden className="h-4 w-4" /> Correct answer
                          </span>
                        )}
                        {r && checked && !isCorrect && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-rose-700">
                            <XCircle aria-hidden className="h-4 w-4" /> Your choice
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                {r && (
                  <p className={`mt-3 rounded-lg p-3 text-sm ${r.correct ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
                    <strong>{r.correct ? "Correct. " : "Not quite. "}</strong>
                    {r.explanation}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" className="mt-6">
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {result && (
          <div className={`rounded-xl p-4 ${result.passed ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
            <p className="text-lg font-semibold">
              {result.passed ? "Passed" : "Not passed yet"} — {result.score}/{result.totalPoints} ({result.percent}%)
            </p>
            <p className="text-sm">
              {result.passed
                ? "Great — you can now mark this lesson complete."
                : "Review the explanations above, revisit the lesson, and try again."}
              {!result.saved && " Sign in to save your results."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {!result ? (
          <button type="submit" className="btn-primary" disabled={!answeredAll || pending}>
            {pending ? "Checking…" : "Check my answers"}
          </button>
        ) : (
          <button type="button" className="btn-secondary" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </form>
  );
}
