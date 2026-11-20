import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { schools } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { StatusBadge } from "@/components/ui/badges";
import { SchoolForm } from "@/components/admin/entity-forms";

export default async function AdminSchools() {
  const rows = (await db.select().from(schools).orderBy(asc(schools.level), asc(schools.displayOrder)));
  return (
    <AdminPage title="Schools">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>#</th><th>Title</th><th>Level</th><th>Topics</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.displayOrder}</td>
                <td><Link href={`/admin/schools/${s.id}`} className="font-medium text-brand-700 underline">{s.title}</Link></td>
                <td>{s.level}</td>
                <td>{s.outline.length}</td>
                <td><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 mt-10 text-lg font-semibold">Create a school</h2>
      <SchoolForm />
    </AdminPage>
  );
}
