import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { learningPaths } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { StatusBadge, TierBadge } from "@/components/ui/badges";
import { PathForm } from "@/components/admin/entity-forms";

export default async function AdminPaths() {
  const rows = (await db.select().from(learningPaths).orderBy(asc(learningPaths.displayOrder)));
  return (
    <AdminPage title="Learning paths">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Path</th><th>Difficulty</th><th>Access</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/paths/${p.id}`} className="font-medium text-brand-700 underline">{p.title}</Link></td>
                <td className="capitalize">{p.difficulty}</td>
                <td><TierBadge tier={p.accessTier} /></td>
                <td><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 mt-10 text-lg font-semibold">Create a learning path</h2>
      <PathForm />
    </AdminPage>
  );
}
