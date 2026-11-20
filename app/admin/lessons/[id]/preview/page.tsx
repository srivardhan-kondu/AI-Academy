import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth/session";
import { getLesson } from "@/lib/content/queries";
import { loadLessonPageData } from "@/lib/content/lesson-page";
import { LessonView } from "@/components/lesson/lesson-view";

export default async function PreviewLesson({ params }: PageProps<"/admin/lessons/[id]/preview">) {
  const user = await requireEditor();
  const { id } = await params;
  const data = await getLesson({ id }, { preview: true });
  if (!data) notFound();
  const page = await loadLessonPageData(id, user);
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <div className="sticky top-16 z-30 flex items-center justify-between bg-amber-100 px-4 py-2 text-sm text-amber-900">
        <span><strong>Preview</strong> — status: {data.lesson.status}. Invalid blocks are flagged in red (learners never see them).</span>
        <Link href={`/admin/lessons/${id}`} className="font-semibold underline">Back to editor</Link>
      </div>
      <LessonView data={data} user={user} {...page} preview />
    </div>
  );
}
