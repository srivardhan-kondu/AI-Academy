import Link from "next/link";
import { asc, eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { schools, modules, lessons } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { StatusBadge } from "@/components/ui/badges";
import { ModuleForm } from "@/components/admin/entity-forms";

export default async function AdminModules() {
  const rows = (await db
    .select({ m: modules, schoolTitle: schools.title, schoolLevel: schools.level, schoolOrder: schools.displayOrder })
    .from(modules)
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .orderBy(asc(schools.level), asc(schools.displayOrder), asc(modules.displayOrder))
    );
  const lessonCounts = new Map((await db.select({ id: lessons.moduleId, n: count() }).from(lessons).groupBy(lessons.moduleId)).map((r) => [r.id, r.n]));
  const schoolOptions = (await db.select().from(schools).orderBy(asc(schools.level), asc(schools.displayOrder))).map((s) => ({ value: s.id, label: s.title }));
  return (
    <AdminPage title="Modules">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Module</th><th>School</th><th>Lessons</th><th>Order</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(({ m, schoolTitle }) => (
              <tr key={m.id}>
                <td><Link href={`/admin/modules/${m.id}`} className="font-medium text-brand-700 underline">{m.title}</Link></td>
                <td>{schoolTitle}</td>
                <td>{lessonCounts.get(m.id) ?? 0}</td>
                <td>{m.displayOrder}</td>
                <td><StatusBadge status={m.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 mt-10 text-lg font-semibold">Create a module</h2>
      <ModuleForm schoolOptions={schoolOptions} />
    </AdminPage>
  );
}
