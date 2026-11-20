import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";

export default async function AdminMessages() {
  const rows = (await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200));
  return (
    <AdminPage title="Messages" description="Contact form submissions, content-error reports and Premium waitlist requests.">
      <ul className="space-y-3">
        {rows.map((m) => (
          <li key={m.id} className="card p-4">
            <p className="text-sm"><span className="badge mr-2 bg-slate-100 text-slate-700">{m.topic}</span><strong>{m.name}</strong> &lt;{m.email}&gt; · {m.createdAt.toLocaleString()}</p>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{m.message}</p>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-slate-500">No messages yet.</li>}
      </ul>
    </AdminPage>
  );
}
