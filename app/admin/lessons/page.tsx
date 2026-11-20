import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons, modules, schools } from "@/lib/db/schema";
import { AdminPage } from "@/components/admin/fields";
import { StatusBadge, TierBadge } from "@/components/ui/badges";
import { formatDate } from "@/lib/utils";

export default async function AdminLessons({ searchParams }: PageProps<"/admin/lessons">) {
  const filter = (await searchParams).status;
  const rows = (await db
    .select({ l: lessons, moduleTitle: modules.title, schoolTitle: schools.title })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .orderBy(asc(schools.level), asc(schools.displayOrder), asc(modules.displayOrder), asc(lessons.displayOrder))
    )
    .filter((r) => !filter || r.l.status === filter);
  const now = new Date();
  return (
    <AdminPage title="Lessons" actions={<Link href="/admin/lessons/new" className="btn-primary">New lesson</Link>}>
      <nav className="mb-4 flex gap-2 text-sm" aria-label="Filter by status">
        {["", "draft", "published", "archived"].map((s) => (
          <Link key={s} href={s ? `/admin/lessons?status=${s}` : "/admin/lessons"} className={filter === s || (!filter && !s) ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>{s || "All"}</Link>
        ))}
      </nav>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Lesson</th><th>Module</th><th>Access</th><th>Status</th><th>v</th><th>Reviewed</th></tr></thead>
          <tbody>
            {rows.map(({ l, moduleTitle, schoolTitle }) => (
              <tr key={l.id}>
                <td><Link href={`/admin/lessons/${l.id}`} className="font-medium text-brand-700 underline">{l.title}</Link></td>
                <td className="text-slate-600">{schoolTitle} › {moduleTitle}</td>
                <td><TierBadge tier={l.accessTier} /></td>
                <td><StatusBadge status={l.status === "published" && l.publishedAt && l.publishedAt > now ? "scheduled" : l.status} /></td>
                <td>{l.version}</td>
                <td>{formatDate(l.lastReviewedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
