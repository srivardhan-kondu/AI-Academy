import Link from "next/link";
import type { Metadata } from "next";
import { listSchools, listPaths } from "@/lib/content/queries";
import { SchoolCard, PathCard, PageHeader } from "@/components/academy/cards";
import { LEVEL_NAMES } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Academy",
  description: "Structured AI schools and learning paths, from foundations to production AI engineering.",
};

export default async function AcademyPage() {
  const schools = await listSchools();
  const paths = await listPaths();
  return (
    <>
      <PageHeader
        eyebrow="AI Academy"
        title="Structured learning, from first concepts to production AI"
        description="Follow a learning path built around a goal, or explore any school on your own. Every lesson follows the same loop: understand, visualize, experiment, implement, practice, apply."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/get-started" className="btn-primary">Help me choose a path</Link>
          <Link href="/academy/paths" className="btn-secondary">Browse all paths</Link>
        </div>
      </PageHeader>

      <div className="container-page space-y-14 py-12">
        <section aria-labelledby="paths-h">
          <div className="flex items-end justify-between">
            <h2 id="paths-h" className="text-2xl font-bold text-slate-900">Learning paths</h2>
            <Link href="/academy/paths" className="text-sm font-semibold text-brand-700">All paths →</Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((p) => <PathCard key={p.id} path={p} />)}
          </div>
        </section>

        {[1, 2, 3, 4].map((level) => {
          const inLevel = schools.filter((s) => s.level === level);
          if (!inLevel.length) return null;
          return (
            <section key={level} aria-labelledby={`level-${level}`}>
              <p className="eyebrow">Level {level}</p>
              <h2 id={`level-${level}`} className="text-2xl font-bold text-slate-900">{LEVEL_NAMES[level]}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inLevel.map((s) => <SchoolCard key={s.id} school={s} />)}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
