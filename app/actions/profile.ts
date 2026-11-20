"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, userProfiles } from "@/lib/db/schema";
import { getCurrentUser, requireUser, destroySession } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionState } from "@/components/ui/form";

export async function saveGoal(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const goal = String(formData.get("goal") ?? "").slice(0, 60);
  const level = String(formData.get("level") ?? "").slice(0, 30);
  await db.update(userProfiles).set({ learningGoal: goal, experienceLevel: level }).where(eq(userProfiles.userId, user.id));
  const pathSlug = String(formData.get("pathSlug") ?? "");
  redirect(/^[a-z0-9-]+$/.test(pathSlug) ? `/academy/paths/${pathSlug}` : "/dashboard");
}

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required").max(80),
  learningGoal: z.string().trim().max(200).optional(),
  experienceLevel: z.enum(["", "beginner", "intermediate", "advanced"]).optional(),
});

export async function updateProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: parsed.error.issues[0]?.message };
  await db.update(userProfiles)
    .set({ displayName: parsed.data.displayName, learningGoal: parsed.data.learningGoal || null, experienceLevel: parsed.data.experienceLevel || null })
    .where(eq(userProfiles.userId, user.id))
    ;
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function changePassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!rateLimit(`pw:${user.id}`, 5, 15 * 60_000)) return { message: "Too many attempts. Try again later." };
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 10) return { message: "New password must be at least 10 characters." };
  const row = (await db.select().from(users).where(eq(users.id, user.id)))[0];
  if (!row || !(await verifyPassword(current, row.passwordHash))) return { message: "Current password is incorrect." };
  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, user.id));
  return { ok: true, message: "Password updated." };
}

/** Account and data deletion (docs/06 §5). Cascades to all user-owned records. */
export async function deleteAccount(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (String(formData.get("confirm") ?? "") !== "DELETE") return { message: 'Type DELETE to confirm.' };
  const row = (await db.select().from(users).where(eq(users.id, user.id)))[0];
  if (!row || !(await verifyPassword(String(formData.get("password") ?? ""), row.passwordHash))) return { message: "Password is incorrect." };
  if (row.role === "admin") {
    const admins = (await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")));
    if (admins.length <= 1) return { message: "You are the only administrator. Promote another admin before deleting this account." };
  }
  await destroySession();
  await db.delete(users).where(eq(users.id, user.id));
  redirect("/?deleted=1");
}
