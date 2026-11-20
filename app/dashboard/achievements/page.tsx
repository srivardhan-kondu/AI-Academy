import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Award, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { achievements, userAchievements } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Milestones", robots: { index: false } };

export default async function AchievementsPage() {
  const user = await requireUser("/dashboard/achievements");
  const all = (await db.select().from(achievements));
  const mine = new Map((await db.select().from(userAchievements).where(eq(userAchievements.userId, user.id))).map((u) => [u.achievementId, u.awardedAt]));
  return (
    <section>
      <h2 className="text-xl font-bold">Learning milestones</h2>
      <p className="mt-1 text-sm text-slate-600">Milestones mark real learning progress, completing lessons and passing knowledge checks, not time spent clicking.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((a) => {
          const at = mine.get(a.id);
          return (
            <li key={a.id} className={`card flex gap-3 p-4 ${at ? "" : "opacity-60"}`}>
              {at ? <Award aria-hidden className="h-6 w-6 shrink-0 text-amber-500" /> : <Lock aria-hidden className="h-6 w-6 shrink-0 text-slate-400" />}
              <span>
                <span className="block font-semibold">{a.title}</span>
                <span className="block text-sm text-slate-600">{a.description}</span>
                <span className="mt-1 block text-xs text-slate-500">{at ? `Earned ${formatDate(at)}` : "Not yet earned"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
