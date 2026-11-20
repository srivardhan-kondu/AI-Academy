import Link from "next/link";
import type { Metadata } from "next";
import { Hammer } from "lucide-react";
import { listProjects } from "@/lib/content/queries";
import { PageHeader } from "@/components/academy/cards";
import { DifficultyBadge, TierBadge } from "@/components/ui/badges";

export const metadata: Metadata = { title: "Project lab", description: "Guided AI projects with prerequisites, milestones and expected outcomes." };

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <>
      <PageHeader eyebrow="Project lab" title="Build something real" description="Guided projects turn lessons into portfolio work. Each has prerequisites, milestones and a clear definition of done." />
      <div className="container-page grid gap-4 py-10 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.slug}`} className="card group flex flex-col p-5 hover:border-brand-300 hover:shadow">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600"><Hammer aria-hidden className="h-3.5 w-3.5" /> Project · ~{p.estimatedHours} h</span>
            <span className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{p.title}</span>
            <span className="mt-1 flex-1 text-sm text-slate-600">{p.description}</span>
            <span className="mt-3 flex gap-1.5"><DifficultyBadge level={p.difficulty} /><TierBadge tier={p.accessTier} /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
