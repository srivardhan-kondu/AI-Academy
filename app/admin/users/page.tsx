import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, userProfiles, subscriptions } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { setUserRole, setPremium } from "@/app/actions/admin";
import { AdminPage } from "@/components/admin/fields";
import { formatDate } from "@/lib/utils";

export default async function AdminUsers() {
  const me = await requireAdmin();
  const rows = (await db.select({ u: users, name: userProfiles.displayName }).from(users).leftJoin(userProfiles, eq(userProfiles.userId, users.id)).orderBy(asc(users.createdAt)));
  const premium = new Set(
    (await db.select({ id: subscriptions.userId }).from(subscriptions).where(and(eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, new Date())))).map((r) => r.id),
  );
  return (
    <AdminPage title="Users" description="Role changes sign the user out everywhere. Manual Premium grants last one year (until a payment provider is connected).">
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>User</th><th>Joined</th><th>Role</th><th>Premium</th></tr></thead>
          <tbody>
            {rows.map(({ u, name }) => (
              <tr key={u.id}>
                <td><p className="font-medium">{name ?? "n/a"}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <form action={setUserRole} className="flex gap-1">
                    <input type="hidden" name="userId" value={u.id} />
                    <label htmlFor={`role-${u.id}`} className="sr-only">Role</label>
                    <select id={`role-${u.id}`} name="role" defaultValue={u.role} className="input w-auto py-1">
                      <option value="student">Student</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="btn-secondary btn-sm" type="submit" disabled={u.id === me.id}>Set</button>
                  </form>
                </td>
                <td>
                  <form action={setPremium}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="grant" value={premium.has(u.id) ? "0" : "1"} />
                    <button className="btn-secondary btn-sm" type="submit">{premium.has(u.id) ? "Revoke Premium" : "Grant Premium"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
