import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { schools, modules, lessons } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { ModuleForm } from "@/components/admin/entity-forms";
import { StatusBadge } from "@/components/ui/badges";

export default async function EditModule({ params }: PageProps<"/admin/modules/[id]">) {
  const { id } = await params;
  const mod = (await db.select().from(modules).where(eq(modules.id, id)))[0];
  if (!mod) notFound();
  const schoolOptions = (await db.select().from(schools).orderBy(asc(schools.level), asc(schools.displayOrder))).map((s) => ({ value: s.id, label: s.title }));
  const ls = (await db.select().from(lessons).where(eq(lessons.moduleId, id)).orderBy(asc(lessons.displayOrder)));
  return (
    <AdminPage title={`Edit module: ${mod.title}`} actions={<Link href={`/academy/modules/${mod.slug}`} className="btn-secondary">View public page</Link>}>
      <ModuleForm mod={mod} schoolOptions={schoolOptions} />
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lessons (ordered)</h2>
        <Link href={`/admin/lessons/new?moduleId=${mod.id}`} className="btn-primary btn-sm">New lesson in this module</Link>
      </div>
      <ul className="card divide-y divide-slate-100">
        {ls.map((l) => (
          <li key={l.id} className="flex items-center justify-between p-3 text-sm">
            <span><span className="mr-2 font-mono text-slate-400">{l.displayOrder}</span><Link href={`/admin/lessons/${l.id}`} className="text-brand-700 underline">{l.title}</Link></span>
            <StatusBadge status={l.status} />
          </li>
        ))}
        {!ls.length && <li className="p-3 text-sm text-slate-500">No lessons yet.</li>}
      </ul>
    </AdminPage>
  );
}
