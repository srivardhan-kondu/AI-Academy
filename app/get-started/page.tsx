import Link from "next/link";
import type { Metadata } from "next";
import { getPath } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { saveGoal } from "@/app/actions/profile";
import { PageHeader } from "@/components/academy/cards";
import { SubmitButton } from "@/components/ui/form";

export const metadata: Metadata = { title: "Find your path", description: "Answer two questions and get a recommended learning path." };

const GOALS = [
  { key: "understand", label: "Understand what AI is and use AI tools well", path: "ai-for-absolute-beginners" },
  { key: "code", label: "Learn to program in Python for AI and data", path: "python-for-ai" },
  { key: "ml", label: "Become a machine learning engineer", path: "machine-learning-engineer" },
  { key: "genai", label: "Build applications with LLMs and RAG", path: "generative-ai-developer" },
  { key: "prompt", label: "Get reliably good results from AI models at work", path: "prompt-engineering-specialist" },
] as const;
const LEVELS = [
  { key: "beginner", label: "I'm new to AI and programming" },
  { key: "intermediate", label: "I can code a little or know some AI basics" },
  { key: "advanced", label: "I'm an experienced developer" },
] as const;

export default async function GetStartedPage({ searchParams }: PageProps<"/get-started">) {
  const sp = await searchParams;
  const goal = GOALS.find((g) => g.key === sp.goal);
  const level = LEVELS.find((l) => l.key === sp.level);
  let pathSlug: string | undefined = goal?.path;
  // Beginners aiming at ML engineering benefit from Python first.
  if (goal?.key === "ml" && level?.key === "beginner") pathSlug = "python-for-ai";
  const rec = pathSlug ? await getPath(pathSlug) : null;
  const user = await getCurrentUser();

  return (
    <>
      <PageHeader eyebrow="Get started" title="Find your learning path" description="Two quick questions. You can change paths at any time, and every lesson is also available on its own." />
      <div className="container-page grid max-w-5xl gap-8 py-10 md:grid-cols-2">
        <form method="get" className="card space-y-6 p-6">
          <fieldset>
            <legend className="font-semibold text-slate-900">1. What do you want to achieve?</legend>
            <div className="mt-3 space-y-2">
              {GOALS.map((g) => (
                <label key={g.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                  <input type="radio" name="goal" value={g.key} defaultChecked={goal?.key === g.key} required />
                  <span className="text-sm">{g.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-semibold text-slate-900">2. Where are you starting from?</legend>
            <div className="mt-3 space-y-2">
              {LEVELS.map((l) => (
                <label key={l.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
                  <input type="radio" name="level" value={l.key} defaultChecked={level?.key === l.key} required />
                  <span className="text-sm">{l.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn-primary w-full" type="submit">Recommend a path</button>
        </form>

        <div aria-live="polite">
          {rec ? (
            <div className="card border-2 border-brand-300 p-6">
              <p className="eyebrow">We recommend</p>
              <h2 className="mt-1 text-2xl font-bold">{rec.path.title}</h2>
              <p className="mt-2 text-slate-700">{rec.path.description}</p>
              <p className="mt-3 text-sm text-slate-600"><strong>Capstone:</strong> {rec.path.capstone}</p>
              {goal?.key === "ml" && level?.key === "beginner" && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Machine learning engineering needs Python first. Start here, then continue to the Machine Learning Engineer path.</p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {user ? (
                  <form action={saveGoal}>
                    <input type="hidden" name="goal" value={goal?.key} />
                    <input type="hidden" name="level" value={level?.key ?? ""} />
                    <input type="hidden" name="pathSlug" value={rec.path.slug} />
                    <SubmitButton>Save goal & view path</SubmitButton>
                  </form>
                ) : (
                  <Link href={`/academy/paths/${rec.path.slug}`} className="btn-primary">View this path</Link>
                )}
                <Link href="/academy/paths" className="btn-secondary">Compare all paths</Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-500">Your recommendation will appear here.</div>
          )}
        </div>
      </div>
    </>
  );
}
