import { ActionForm, SubmitButton } from "@/components/ui/form";
import { Field, Area, Select, TIER_OPTIONS, DIFFICULTY_OPTIONS } from "./fields";
import { saveLesson } from "@/app/actions/admin";
import type { lessons } from "@/lib/db/schema";

type Lesson = typeof lessons.$inferSelect;

export function LessonForm({
  lesson,
  moduleOptions,
  lessonOptions,
  defaultModuleId,
}: {
  lesson?: Lesson;
  moduleOptions: { value: string; label: string }[];
  lessonOptions: { value: string; label: string }[];
  defaultModuleId?: string;
}) {
  return (
    <ActionForm action={saveLesson} className="card space-y-4 p-6">
      <input type="hidden" name="id" value={lesson?.id ?? ""} />
      <Select name="moduleId" label="Module" defaultValue={lesson?.moduleId ?? defaultModuleId} options={moduleOptions} required />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Title" required defaultValue={lesson?.title} />
        <Field name="slug" label="Slug" defaultValue={lesson?.slug} hint="Leave blank to generate from the title." />
      </div>
      <Area name="summary" label="Summary" defaultValue={lesson?.summary} rows={2} />
      <div className="grid gap-4 md:grid-cols-3">
        <Select name="difficulty" label="Difficulty" defaultValue={lesson?.difficulty ?? "beginner"} options={DIFFICULTY_OPTIONS} />
        <Field name="estimatedMinutes" label="Estimated minutes" type="number" min={1} defaultValue={lesson?.estimatedMinutes ?? 15} />
        <Select name="accessTier" label="Access" defaultValue={lesson?.accessTier ?? "free"} options={TIER_OPTIONS} />
        <Field name="displayOrder" label="Order in module" type="number" defaultValue={lesson?.displayOrder ?? 0} />
        <Field name="lastReviewedAt" label="Last reviewed" type="date" defaultValue={lesson?.lastReviewedAt?.toISOString().slice(0, 10)} />
      </div>
      <Area name="learningObjectives" label="Learning objectives (one per line)" defaultValue={lesson?.learningObjectives.join("\n")} rows={4} />
      <div>
        <label htmlFor="f-prereqs" className="label">Prerequisite lessons</label>
        <select id="f-prereqs" name="prerequisiteLessonIds" multiple defaultValue={lesson?.prerequisiteLessonIds ?? []} className="input h-32">
          {lessonOptions.filter((o) => o.value !== lesson?.id).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <p className="mt-1 text-xs text-slate-500">Hold Ctrl/Cmd to select several.</p>
      </div>
      <Area name="references" label="References (one per line: Title | https://url)" defaultValue={lesson?.references.map((r) => `${r.title} | ${r.url}`).join("\n")} rows={3} mono />
      <SubmitButton>{lesson ? "Save details" : "Create lesson draft"}</SubmitButton>
    </ActionForm>
  );
}
