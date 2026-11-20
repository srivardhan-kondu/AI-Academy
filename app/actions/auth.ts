"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, userProfiles } from "@/lib/db/schema";
import { createSession, destroySession } from "@/lib/auth/session";
import { hashPassword, verifyPassword, dummyHash } from "@/lib/auth/password";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { ActionState } from "@/components/ui/form";

const safeNext = (n: FormDataEntryValue | null) => {
  const s = typeof n === "string" ? n : "";
  // Only allow same-site relative redirects.
  return s.startsWith("/") && !s.startsWith("//") ? s : "/dashboard";
};

const signupSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(200),
});

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  if (!rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return { message: "Too many sign-up attempts. Please try again later." };
  }
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      message: "Please fix the following:",
      errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
    };
  }
  const { email, password, displayName } = parsed.data;
  const existing = (await db.select({ id: users.id }).from(users).where(eq(users.email, email)))[0];
  if (existing) return { message: "An account with this email already exists. Try signing in." };

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ id, email, passwordHash, role: "student" });
    await tx.insert(userProfiles).values({ userId: id, displayName });
  });
  await createSession(id);
  redirect(safeNext(formData.get("next")) === "/dashboard" ? "/get-started" : safeNext(formData.get("next")));
}

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!rateLimit(`signin:${ip}`, 10, 15 * 60 * 1000) || !rateLimit(`signin:${email}`, 8, 15 * 60 * 1000)) {
    return { message: "Too many sign-in attempts. Please wait a few minutes and try again." };
  }
  const user = (await db.select().from(users).where(eq(users.email, email)))[0];
  // Always run bcrypt to keep timing similar whether or not the account exists.
  const ok = await verifyPassword(password, user?.passwordHash ?? dummyHash());
  if (!user || !ok) return { message: "Incorrect email or password." };
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
