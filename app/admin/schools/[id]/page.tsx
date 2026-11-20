import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { schools, modules } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { SchoolForm } from "@/components/admin/entity-forms";
import { StatusBadge } from "@/components/ui/badges";

export default async function EditSchool({ params }: PageProps<"/admin/schools/[id]">) {
  const { id } = await params;
  const school = (await db.select().from(schools).where(eq(schools.id, id)))[0];
  if (!school) notFound();
  const mods = (await db.select().from(modules).where(eq(modules.schoolId, id)).orderBy(asc(modules.displayOrder)));
  return (
    <AdminPage title={`Edit school: ${school.title}`} actions={<Link href={`/academy/schools/${school.slug}`} className="btn-secondary">View public page</Link>}>
      <SchoolForm school={school} />
      <h2 className="mb-3 mt-8 text-lg font-semibold">Modules in this school</h2>
      <ul className="card divide-y divide-slate-100">
        {mods.map((m) => (
          <li key={m.id} className="flex items-center justify-between p-3 text-sm">
            <Link href={`/admin/modules/${m.id}`} className="text-brand-700 underline">{m.title}</Link>
            <StatusBadge status={m.status} />
          </li>
        ))}
        {!mods.length && <li className="p-3 text-sm text-slate-500">No modules yet. <Link href="/admin/modules" className="text-brand-700 underline">Create one</Link>.</li>}
      </ul>
    </AdminPage>
  );
}
