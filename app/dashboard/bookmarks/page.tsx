import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarks, lessons, projects, learningPaths, interactiveComponents } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { BookmarkButton } from "@/components/lesson/lesson-actions";

export const metadata: Metadata = { title: "Bookmarks", robots: { index: false } };

export default async function BookmarksPage() {
  const user = await requireUser("/dashboard/bookmarks");
  const rows = (await db.select().from(bookmarks).where(eq(bookmarks.userId, user.id)).orderBy(desc(bookmarks.createdAt)));
  const ids = (t: string) => rows.filter((r) => r.resourceType === t).map((r) => r.resourceId);
  const lookup = new Map<string, { title: string; href: string }>();
  const lessonIds = ids("lesson");
  if (lessonIds.length) (await db.select().from(lessons).where(inArray(lessons.id, lessonIds))).forEach((l) => lookup.set(l.id, { title: l.title, href: `/academy/lessons/${l.slug}` }));
  const projectIds = ids("project");
  if (projectIds.length) (await db.select().from(projects).where(inArray(projects.id, projectIds))).forEach((p) => lookup.set(p.id, { title: p.title, href: `/projects/${p.slug}` }));
  const pathIds = ids("path");
  if (pathIds.length) (await db.select().from(learningPaths).where(inArray(learningPaths.id, pathIds))).forEach((p) => lookup.set(p.id, { title: p.title, href: `/academy/paths/${p.slug}` }));
  const labIds = ids("lab");
  if (labIds.length) (await db.select().from(interactiveComponents).where(inArray(interactiveComponents.id, labIds))).forEach((p) => lookup.set(p.id, { title: p.title, href: `/labs/${p.slug}` }));

  const items = rows.map((r) => ({ ...r, target: lookup.get(r.resourceId) })).filter((r) => r.target);
  return (
    <section>
      <h2 className="text-xl font-bold">Bookmarks</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No bookmarks yet. Use the Bookmark button on any lesson to save it here.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((b) => (
            <li key={b.id} className="card flex items-center justify-between gap-3 p-4">
              <span>
                <span className="badge bg-slate-100 capitalize text-slate-700">{b.resourceType}</span>
                <Link href={b.target!.href} className="ml-2 font-medium text-slate-900 hover:text-brand-700">{b.target!.title}</Link>
              </span>
              <BookmarkButton type={b.resourceType} id={b.resourceId} initial signedIn />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
