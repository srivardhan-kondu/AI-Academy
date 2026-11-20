import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { interactiveComponents } from "@/lib/db/schema";
import { saveLab } from "@/app/actions/admin";
import { AdminPage, Field, Area, Select, STATUS_OPTIONS, TIER_OPTIONS } from "@/components/admin/fields";
import { ActionForm, SubmitButton } from "@/components/ui/form";

export default async function AdminLabs() {
  const labs = (await db.select().from(interactiveComponents).orderBy(asc(interactiveComponents.displayOrder)));
  return (
    <AdminPage title="Interactive labs" description="Labs are registered React components. Configure their catalogue entry here, and place them in lessons with a “visualization” block.">
      <div className="space-y-4">
        {labs.map((lab) => (
          <details key={lab.id} className="card p-4">
            <summary className="cursor-pointer font-semibold">
              {lab.title} <span className="ml-2 font-mono text-xs font-normal text-slate-500">{lab.componentKey}</span> <span className="text-xs font-normal text-slate-500">· {lab.status} · {lab.accessTier}</span>
            </summary>
            <ActionForm action={saveLab} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={lab.id} />
              <div className="grid gap-3 md:grid-cols-2">
                <Field name="title" label="Title" defaultValue={lab.title} required />
                <Field name="concept" label="Concept" defaultValue={lab.concept} />
              </div>
              <Area name="description" label="Description" defaultValue={lab.description} rows={2} />
              <div className="grid gap-3 md:grid-cols-3">
                <Select name="accessTier" label="Access" defaultValue={lab.accessTier} options={TIER_OPTIONS} />
                <Select name="status" label="Status" defaultValue={lab.status} options={STATUS_OPTIONS} />
                <Field name="displayOrder" label="Order" type="number" defaultValue={lab.displayOrder} />
              </div>
              <div className="flex gap-2"><SubmitButton className="btn-secondary btn-sm">Save lab</SubmitButton><Link href={`/labs/${lab.slug}`} className="btn-ghost btn-sm">Open</Link></div>
            </ActionForm>
          </details>
        ))}
      </div>
    </AdminPage>
  );
}
