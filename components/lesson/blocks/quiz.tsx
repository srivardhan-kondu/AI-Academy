"use client";

import { useState, useTransition } from "react";
import { CircleCheck, CircleX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitQuiz } from "@/app/actions/learning";
import type { ClientQuiz } from "@/lib/content/queries";
import type { GradeResult } from "@/lib/assessment/grade";

export function QuizBlock({ quiz, previouslyPassed }: { quiz: ClientQuiz | undefined; previouslyPassed?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<(GradeResult & { saved: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!quiz) {
    return <p className="rounded-[12px] bg-amber-weak p-4 text-sm text-amber-ink">This knowledge check is not available right now.</p>;
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
    <form onSubmit={onSubmit} className="space-y-6" aria-labelledby={`quiz-${quiz.id}`}>
      <div>
        <h3 id={`quiz-${quiz.id}`} className="sr-only">
          {quiz.title}
        </h3>
        <p className="max-w-[62ch] font-serif text-[1.3125rem] leading-[1.6] text-ink-2">
          {quiz.questions.length === 1 ? "One question" : `${quiz.questions.length} questions`}. Pass mark is {quiz.passThreshold}% — retry as often as you like; explanations appear after you check.
        </p>
        {previouslyPassed && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-good-weak px-3 py-1 text-[0.9062rem] font-medium text-good">
            <CircleCheck aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5" /> You&apos;ve already passed this check
          </p>
        )}
      </div>

      <ol className="space-y-5">
        {quiz.questions.map((q, qi) => {
          const multiple = q.questionType === "multiple";
          const r = result?.results.find((x) => x.questionId === q.id);
          return (
            <li key={q.id} className="rounded-[16px] border border-line bg-surface p-6 sm:p-7">
              <fieldset>
                <legend className="max-w-[62ch] font-serif text-[1.3125rem] leading-[1.55] text-ink">
                  {quiz.questions.length > 1 && <span className="mr-2 font-mono text-[0.9062rem] font-medium text-brand-2">{String(qi + 1).padStart(2, "0")}</span>}
                  {q.prompt.replace(/\s*\((select all that apply)\)\s*$/i, "")}
                  {multiple && <span className="mt-1 block font-sans text-[0.9062rem] text-ink-3">Select all that apply</span>}
                </legend>
                <div className="mt-5 space-y-2.5">
                  {q.options.map((opt, oi) => {
                    const checked = (answers[q.id] ?? []).includes(oi);
                    const isCorrect = r?.correctAnswers.includes(oi);
                    const state = !r ? (checked ? "selected" : "idle") : isCorrect ? "correct" : checked ? "wrong" : "muted";
                    return (
                      <label
                        key={oi}
                        className={cn(
                          "flex items-center gap-3.5 rounded-[10px] border px-4 py-3.5 text-[1.0312rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-2",
                          !r && "cursor-pointer",
                          state === "idle" && "border-line bg-surface-2/60 text-ink hover:border-ink-3/40 hover:bg-surface-2",
                          state === "selected" && "border-brand-2 bg-brand-weak text-ink",
                          state === "correct" && "border-good/50 bg-good-weak text-ink",
                          state === "wrong" && "border-bad/50 bg-bad-weak text-ink",
                          state === "muted" && "border-line bg-surface-2/40 text-ink-3",
                        )}
                      >
                        <input
                          type={multiple ? "checkbox" : "radio"}
                          name={q.id}
                          className="peer sr-only"
                          checked={checked}
                          disabled={!!result}
                          onChange={() => select(q.id, oi, multiple)}
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "grid h-[18px] w-[18px] shrink-0 place-items-center border-[1.5px] bg-surface",
                            multiple ? "rounded-[5px]" : "rounded-full",
                            checked ? (state === "wrong" ? "border-bad" : state === "correct" ? "border-good" : "border-brand-2") : "border-ink-3/40",
                          )}
                        >
                          {checked && (
                            <span
                              className={cn(
                                multiple ? "h-2 w-2 rounded-[2px]" : "h-2 w-2 rounded-full",
                                state === "wrong" ? "bg-bad" : state === "correct" ? "bg-good" : "bg-brand-2",
                              )}
                            />
                          )}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {r && isCorrect && (
                          <span className="flex shrink-0 items-center gap-1 text-[0.875rem] font-semibold text-good">
                            <CircleCheck aria-hidden strokeWidth={1.5} className="h-4 w-4" /> Correct
                          </span>
                        )}
                        {r && checked && !isCorrect && (
                          <span className="flex shrink-0 items-center gap-1 text-[0.875rem] font-semibold text-bad">
                            <CircleX aria-hidden strokeWidth={1.5} className="h-4 w-4" /> Your choice
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                {r && (
                  <div className={cn("mt-4 rounded-[10px] px-4 py-3 font-serif text-[1.125rem] leading-[1.55]", r.correct ? "bg-good-weak text-ink" : "bg-amber-weak text-ink")}>
                    <span className={cn("font-sans text-[0.9688rem] font-semibold", r.correct ? "text-good" : "text-amber-ink")}>{r.correct ? "Correct. " : "Not quite. "}</span>
                    {r.explanation}
                  </div>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite">
        {error && <p className="rounded-[10px] bg-bad-weak px-4 py-3 text-sm text-bad">{error}</p>}
        {result && (
          <div className={cn("rounded-[14px] border px-5 py-4", result.passed ? "border-good/30 bg-good-weak" : "border-amber/40 bg-amber-weak")}>
            <p className={cn("text-[1.1562rem] font-semibold", result.passed ? "text-good" : "text-amber-ink")}>
              {result.passed ? "Passed" : "Not passed yet"} — {result.score}/{result.totalPoints} ({result.percent}%)
            </p>
            <p className="mt-1 font-serif text-[1.125rem] text-ink">
              {result.passed ? "Nice work — you can now mark this lesson complete." : "Review the explanations above, revisit the lesson, and try again."}
              {!result.saved && " Sign in to save your results."}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {!result ? (
          <>
            <button type="submit" className="btn-primary px-5 py-2.5" disabled={!answeredAll || pending}>
              {pending ? "Checking…" : quiz.questions.length === 1 ? "Check answer" : "Check my answers"}
            </button>
            {!answeredAll && <span className="text-[0.9062rem] text-ink-3">Answer {quiz.questions.length === 1 ? "the question" : `all ${quiz.questions.length}`} to check.</span>}
          </>
        ) : (
          <button type="button" className="btn-secondary px-5 py-2.5" onClick={retry}>
            <RotateCcw aria-hidden strokeWidth={1.5} className="h-4 w-4" /> Try again
          </button>
        )}
      </div>
    </form>
  );
}
