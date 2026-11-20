import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import crypto from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users, userProfiles, type Role } from "@/lib/db/schema";
import { siteUrl } from "@/lib/utils";

const COOKIE = "academy_session";
const SESSION_DAYS = 30;

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export type CurrentUser = {
  id: string;
  email: string;
  role: Role;
  displayName: string;
};

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  // Opportunistic cleanup of expired sessions.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure cookies whenever the site is served over HTTPS (always in real deployments).
    secure: siteUrl().startsWith("https://"),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) (await db.delete(sessions).where(eq(sessions.id, hashToken(token))));
  jar.delete(COOKIE);
}

export async function destroyAllSessionsFor(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Resolve the signed-in user for this request (memoised per request). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = (await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      displayName: userProfiles.displayName,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    )[0];
  if (!row) return null;
  return { ...row, displayName: row.displayName ?? row.email.split("@")[0] };
});

export async function requireUser(next?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Editors and admins can manage content; only admins manage users. */
export async function requireRole(roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!roles.includes(user.role)) redirect("/dashboard?error=forbidden");
  return user;
}

export const requireEditor = () => requireRole(["editor", "admin"]);
export const requireAdmin = () => requireRole(["admin"]);
