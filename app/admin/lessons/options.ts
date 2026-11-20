import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessons, modules, schools } from "@/lib/db/schema";

export async function lessonFormOptions() {
  const moduleOptions = (await db
    .select({ id: modules.id, title: modules.title, school: schools.title })
    .from(modules)
    .innerJoin(schools, eq(schools.id, modules.schoolId))
    .orderBy(asc(schools.level), asc(schools.displayOrder), asc(modules.displayOrder))
    )
    .map((m) => ({ value: m.id, label: `${m.school} / ${m.title}` }));
  const lessonOptions = (await db.select({ id: lessons.id, title: lessons.title }).from(lessons).orderBy(asc(lessons.title))).map((l) => ({ value: l.id, label: l.title }));
  return { moduleOptions, lessonOptions };
}
