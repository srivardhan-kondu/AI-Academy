import type { Metadata } from "next";
import { listSchools } from "@/lib/content/queries";
import { SchoolCard, PageHeader } from "@/components/academy/cards";

export const metadata: Metadata = { title: "Schools", description: "All 19 AI Academy schools." };

export default async function SchoolsPage() {
  const schools = await listSchools();
  return (
    <>
      <PageHeader eyebrow="AI Academy" title="Schools" description={`${schools.length} schools organised into four levels. Each school contains modules of ordered lessons.`} />
      <div className="container-page grid gap-4 py-10 md:grid-cols-2 lg:grid-cols-3">
        {schools.map((s) => <SchoolCard key={s.id} school={s} />)}
      </div>
    </>
  );
}
