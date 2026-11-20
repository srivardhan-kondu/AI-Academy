import Link from "next/link";
import type { Metadata } from "next";
import { listPaths } from "@/lib/content/queries";
import { PathCard, PageHeader } from "@/components/academy/cards";

export const metadata: Metadata = { title: "Learning paths", description: "Goal-oriented journeys through the AI Academy." };

export default async function PathsPage() {
  const paths = await listPaths();
  return (
    <>
      <PageHeader eyebrow="AI Academy" title="Learning paths" description="Each path connects modules from different schools into a goal-oriented journey that ends with a capstone project.">
        <Link href="/get-started" className="btn-primary">Not sure? Find your path</Link>
      </PageHeader>
      <div className="container-page grid gap-4 py-10 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((p) => <PathCard key={p.id} path={p} />)}
      </div>
    </>
  );
}
