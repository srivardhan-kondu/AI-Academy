import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectSubmissions, users } from "@/lib/db/schema";
import { reviewSubmission } from "@/app/actions/admin";
import { AdminPage, Select } from "@/components/admin/fields";
import { ProjectForm } from "@/components/admin/entity-forms";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { formatDate } from "@/lib/utils";

export default async function EditProject({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const project = (await db.select().from(projects).where(eq(projects.id, id)))[0];
  if (!project) notFound();
  const subs = (await db.select({ s: projectSubmissions, email: users.email }).from(projectSubmissions).innerJoin(users, eq(users.id, projectSubmissions.userId)).where(eq(projectSubmissions.projectId, id)).orderBy(desc(projectSubmissions.submittedAt)));
  return (
    <AdminPage title={`Edit project: ${project.title}`} actions={<Link href={`/projects/${project.slug}`} className="btn-secondary">View public page</Link>}>
      <ProjectForm project={project} />
      <h2 className="mb-3 mt-10 text-lg font-semibold">Submissions ({subs.length})</h2>
      <div className="space-y-4">
        {subs.map(({ s, email }) => (
          <div key={s.id} className="card p-5">
            <p className="text-sm"><strong>{email}</strong> · {formatDate(s.submittedAt)} · <a href={s.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline">{s.submissionUrl}</a></p>
            {s.notes && <p className="mt-2 rounded bg-slate-50 p-2 text-sm text-slate-700">{s.notes}</p>}
            <ActionForm action={reviewSubmission} className="mt-3 space-y-3">
              <input type="hidden" name="submissionId" value={s.id} />
              <Select name="status" label="Status" defaultValue={s.status} options={[{ value: "submitted", label: "Awaiting review" }, { value: "reviewed", label: "Reviewed" }, { value: "needs_changes", label: "Needs changes" }]} />
              <div>
                <label htmlFor={`fb-${s.id}`} className="label">Feedback for the learner</label>
                <textarea id={`fb-${s.id}`} name="feedback" defaultValue={s.feedback ?? ""} rows={3} className="input" />
              </div>
              <SubmitButton className="btn-secondary btn-sm">Save feedback</SubmitButton>
            </ActionForm>
          </div>
        ))}
        {!subs.length && <p className="text-sm text-slate-500">No submissions yet.</p>}
      </div>
    </AdminPage>
  );
}
