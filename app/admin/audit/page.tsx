import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/components/admin/fields";

export default async function AdminAudit() {
  await requireAdmin();
  const rows = (await db.select({ a: auditLogs, email: users.email }).from(auditLogs).leftJoin(users, eq(users.id, auditLogs.userId)).orderBy(desc(auditLogs.createdAt)).limit(300));
  return (
    <AdminPage title="Audit log" description="Every administrative change is recorded.">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
          <tbody>
            {rows.map(({ a, email }) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap">{a.createdAt.toLocaleString()}</td>
                <td>{email ?? "—"}</td>
                <td>{a.action}</td>
                <td>{a.entityType}</td>
                <td className="max-w-xs truncate font-mono text-xs">{a.details ? JSON.stringify(a.details) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
