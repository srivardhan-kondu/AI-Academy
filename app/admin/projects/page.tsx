import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectSubmissions } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { StatusBadge, TierBadge } from "@/components/ui/badges";
import { ProjectForm } from "@/components/admin/entity-forms";

export default async function AdminProjects() {
  const rows = (await db.select().from(projects).orderBy(asc(projects.displayOrder)));
  const pending = new Map((await db.select({ id: projectSubmissions.projectId, n: count() }).from(projectSubmissions).where(eq(projectSubmissions.status, "submitted")).groupBy(projectSubmissions.projectId)).map((r) => [r.id, r.n]));
  return (
    <AdminPage title="Projects">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Project</th><th>Access</th><th>Awaiting review</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/projects/${p.id}`} className="font-medium text-brand-700 underline">{p.title}</Link></td>
                <td><TierBadge tier={p.accessTier} /></td>
                <td>{pending.get(p.id) ?? 0}</td>
                <td><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mb-3 mt-10 text-lg font-semibold">Create a project</h2>
      <ProjectForm />
    </AdminPage>
  );
}
