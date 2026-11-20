import { AdminPage } from "@/components/admin/fields";
import { LessonForm } from "@/components/admin/lesson-form";
import { lessonFormOptions } from "../options";

export default async function NewLesson({ searchParams }: PageProps<"/admin/lessons/new">) {
  const moduleId = (await searchParams).moduleId;
  const opts = await lessonFormOptions();
  return (
    <AdminPage title="New lesson" description="Create the lesson draft first, then add content blocks, quizzes and publish.">
      <LessonForm {...opts} defaultModuleId={typeof moduleId === "string" ? moduleId : undefined} />
    </AdminPage>
  );
}
