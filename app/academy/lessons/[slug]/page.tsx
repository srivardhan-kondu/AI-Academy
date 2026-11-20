import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLesson } from "@/lib/content/queries";
import { loadLessonPageData } from "@/lib/content/lesson-page";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccess } from "@/lib/permissions";
import { LessonView, LockedLesson } from "@/components/lesson/lesson-view";

export async function generateMetadata({ params }: PageProps<"/academy/lessons/[slug]">): Promise<Metadata> {
  const data = await getLesson({ slug: (await params).slug });
  return data ? { title: data.lesson.title, description: data.lesson.summary } : {};
}

export default async function LessonPage({ params }: PageProps<"/academy/lessons/[slug]">) {
  const { slug } = await params;
  const data = await getLesson({ slug });
  if (!data) notFound();
  const user = await getCurrentUser();

  // Server-side entitlement check: premium content is never sent to unentitled users.
  if (!await canAccess(user, data.lesson.accessTier)) return <LockedLesson data={data} />;

  const page = await loadLessonPageData(data.lesson.id, user);
  return <LessonView data={data} user={user} {...page} />;
}
