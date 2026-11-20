import { ActionForm, SubmitButton } from "@/components/ui/form";
import { Field, Area, Select, STATUS_OPTIONS, TIER_OPTIONS, DIFFICULTY_OPTIONS } from "./fields";
import { saveSchool, saveModule, savePath, saveProject } from "@/app/actions/admin";
import type { schools, modules, learningPaths, projects } from "@/lib/db/schema";

type School = typeof schools.$inferSelect;
type Module = typeof modules.$inferSelect;
type Path = typeof learningPaths.$inferSelect;
type Project = typeof projects.$inferSelect;

export function SchoolForm({ school }: { school?: School }) {
  return (
    <ActionForm action={saveSchool} className="card space-y-4 p-6">
      <input type="hidden" name="id" value={school?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Title" required defaultValue={school?.title} />
        <Field name="slug" label="Slug" defaultValue={school?.slug} hint="Leave blank to generate from the title." />
      </div>
      <Area name="description" label="Description" defaultValue={school?.description} />
      <div className="grid gap-4 md:grid-cols-3">
        <Select name="level" label="Level" defaultValue={school?.level ?? 1} options={[1, 2, 3, 4].map((l) => ({ value: l, label: `Level ${l}` }))} />
        <Field name="displayOrder" label="School number / order" type="number" defaultValue={school?.displayOrder ?? 0} />
        <Select name="status" label="Status" defaultValue={school?.status ?? "draft"} options={STATUS_OPTIONS} />
      </div>
      <Area name="outline" label="Curriculum outline (one topic per line)" rows={8} defaultValue={school?.outline.join("\n")} />
      <SubmitButton>{school ? "Save school" : "Create school"}</SubmitButton>
    </ActionForm>
  );
}

export function ModuleForm({ mod, schoolOptions }: { mod?: Module; schoolOptions: { value: string; label: string }[] }) {
  return (
    <ActionForm action={saveModule} className="card space-y-4 p-6">
      <input type="hidden" name="id" value={mod?.id ?? ""} />
      <Select name="schoolId" label="School" defaultValue={mod?.schoolId} options={schoolOptions} required />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Title" required defaultValue={mod?.title} />
        <Field name="slug" label="Slug" defaultValue={mod?.slug} hint="Leave blank to generate from the title." />
      </div>
      <Area name="description" label="Description" defaultValue={mod?.description} />
      <div className="grid gap-4 md:grid-cols-3">
        <Select name="difficulty" label="Difficulty" defaultValue={mod?.difficulty ?? "beginner"} options={DIFFICULTY_OPTIONS} />
        <Field name="displayOrder" label="Order within school" type="number" defaultValue={mod?.displayOrder ?? 0} />
        <Select name="status" label="Status" defaultValue={mod?.status ?? "draft"} options={STATUS_OPTIONS} />
      </div>
      <Area name="prerequisites" label="Prerequisites (one per line)" defaultValue={mod?.prerequisites.join("\n")} rows={3} />
      <SubmitButton>{mod ? "Save module" : "Create module"}</SubmitButton>
    </ActionForm>
  );
}

export function PathForm({ path }: { path?: Path }) {
  return (
    <ActionForm action={savePath} className="card space-y-4 p-6">
      <input type="hidden" name="id" value={path?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Title" required defaultValue={path?.title} />
        <Field name="slug" label="Slug" defaultValue={path?.slug} hint="Leave blank to generate from the title." />
      </div>
      <Area name="description" label="Description" defaultValue={path?.description} />
      <Field name="audience" label="Intended audience" defaultValue={path?.audience} />
      <div className="grid gap-4 md:grid-cols-3">
        <Select name="difficulty" label="Difficulty" defaultValue={path?.difficulty ?? "beginner"} options={DIFFICULTY_OPTIONS} />
        <Field name="estimatedMinutes" label="Estimated effort (minutes)" type="number" defaultValue={path?.estimatedMinutes ?? 600} />
        <Select name="accessTier" label="Access" defaultValue={path?.accessTier ?? "free"} options={TIER_OPTIONS} />
        <Field name="displayOrder" label="Display order" type="number" defaultValue={path?.displayOrder ?? 0} />
        <Select name="status" label="Status" defaultValue={path?.status ?? "draft"} options={STATUS_OPTIONS} />
      </div>
      <Area name="prerequisites" label="Prerequisites (one per line)" defaultValue={path?.prerequisites.join("\n")} rows={3} />
      <Area name="learningOutcomes" label="Learning outcomes (one per line)" defaultValue={path?.learningOutcomes.join("\n")} rows={4} />
      <Area name="capstone" label="Capstone project" defaultValue={path?.capstone} rows={2} />
      <SubmitButton>{path ? "Save path" : "Create path"}</SubmitButton>
    </ActionForm>
  );
}

export function ProjectForm({ project }: { project?: Project }) {
  return (
    <ActionForm action={saveProject} className="card space-y-4 p-6">
      <input type="hidden" name="id" value={project?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Title" required defaultValue={project?.title} />
        <Field name="slug" label="Slug" defaultValue={project?.slug} hint="Leave blank to generate from the title." />
      </div>
      <Area name="description" label="Short description" defaultValue={project?.description} rows={2} />
      <div className="grid gap-4 md:grid-cols-3">
        <Select name="difficulty" label="Difficulty" defaultValue={project?.difficulty ?? "beginner"} options={DIFFICULTY_OPTIONS} />
        <Field name="estimatedHours" label="Estimated hours" type="number" defaultValue={project?.estimatedHours ?? 4} />
        <Select name="accessTier" label="Access" defaultValue={project?.accessTier ?? "free"} options={TIER_OPTIONS} />
        <Field name="displayOrder" label="Display order" type="number" defaultValue={project?.displayOrder ?? 0} />
        <Select name="status" label="Status" defaultValue={project?.status ?? "draft"} options={STATUS_OPTIONS} />
        <Field name="sourceUrl" label="Starter resources URL" defaultValue={project?.sourceUrl} placeholder="https://" />
      </div>
      <Area name="prerequisites" label="Prerequisites (one per line)" defaultValue={project?.prerequisites.join("\n")} rows={3} />
      <Area name="expectedOutcomes" label="Expected outcomes (one per line)" defaultValue={project?.expectedOutcomes.join("\n")} rows={3} />
      <Area name="instructions" label="Instructions & milestones (Markdown)" defaultValue={project?.instructions} rows={14} mono />
      <SubmitButton>{project ? "Save project" : "Create project"}</SubmitButton>
    </ActionForm>
  );
}
