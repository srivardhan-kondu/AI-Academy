import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { db } from "@/lib/db";
import { learningPaths, learningPathModules, modules, schools } from "@/lib/db/schema";
import { pathModuleAction } from "@/app/actions/admin";
import { AdminPage } from "@/components/admin/fields";
import { PathForm } from "@/components/admin/entity-forms";
import { StatusBadge } from "@/components/ui/badges";

export default async function EditPath({ params }: PageProps<"/admin/paths/[id]">) {
  const { id } = await params;
  const path = (await db.select().from(learningPaths).where(eq(learningPaths.id, id)))[0];
  if (!path) notFound();
  const rows = (await db
    .select({ row: learningPathModules, module: modules, school: schools })
    .from(learningPathModules)
    .innerJoin(modules, eq(modules.id, learningPathModules.moduleId))
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .where(eq(learningPathModules.learningPathId, id))
    .orderBy(asc(learningPathModules.displayOrder))
    );
  const used = new Set(rows.map((r) => r.module.id));
  const available = (await db
    .select({ id: modules.id, title: modules.title, school: schools.title })
    .from(modules)
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .orderBy(asc(schools.level), asc(schools.displayOrder), asc(modules.displayOrder))
    )
    .filter((m) => !used.has(m.id));

  const OpButton = ({ op, rowId, label, children }: { op: string; rowId: string; label: string; children: React.ReactNode }) => (
    <form action={pathModuleAction}>
      <input type="hidden" name="pathId" value={id} />
      <input type="hidden" name="rowId" value={rowId} />
      <button name="op" value={op} className="btn-ghost btn-sm" aria-label={label}>{children}</button>
    </form>
  );

  return (
    <AdminPage title={`Edit path: ${path.title}`} actions={<Link href={`/academy/paths/${path.slug}`} className="btn-secondary">View public page</Link>}>
      <PathForm path={path} />
      <h2 className="mb-3 mt-8 text-lg font-semibold">Ordered modules</h2>
      <ol className="card divide-y divide-slate-100">
        {rows.map(({ row, module, school }, i) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
            <span>
              <span className="mr-2 font-mono text-slate-400">{i + 1}.</span>
              <Link href={`/admin/modules/${module.id}`} className="text-brand-700 underline">{module.title}</Link>
              <span className="ml-2 text-slate-500">({school.title})</span> <StatusBadge status={module.status} />
            </span>
            <span className="flex items-center gap-1">
              <OpButton op="toggle" rowId={row.id} label="Toggle required">{row.isRequired ? "Required" : "Optional"}</OpButton>
              <OpButton op="up" rowId={row.id} label="Move up"><ArrowUp aria-hidden className="h-4 w-4" /></OpButton>
              <OpButton op="down" rowId={row.id} label="Move down"><ArrowDown aria-hidden className="h-4 w-4" /></OpButton>
              <OpButton op="remove" rowId={row.id} label="Remove from path"><X aria-hidden className="h-4 w-4" /></OpButton>
            </span>
          </li>
        ))}
        {!rows.length && <li className="p-3 text-sm text-slate-500">No modules yet.</li>}
      </ol>
      <form action={pathModuleAction} className="card mt-4 flex flex-wrap items-end gap-3 p-4">
        <input type="hidden" name="pathId" value={id} />
        <input type="hidden" name="op" value="add" />
        <div className="min-w-64 flex-1">
          <label htmlFor="moduleId" className="label">Add a module</label>
          <select id="moduleId" name="moduleId" className="input" required>
            {available.map((m) => <option key={m.id} value={m.id}>{m.school} — {m.title}</option>)}
          </select>
        </div>
        <button className="btn-primary" type="submit">Add to path</button>
      </form>
    </AdminPage>
  );
}
