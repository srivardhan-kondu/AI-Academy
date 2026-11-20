import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscriptions, type AccessTier } from "@/lib/db/schema";
import type { CurrentUser } from "@/lib/auth/session";

/**
 * Premium entitlement is ALWAYS computed on the server from the subscriptions
 * table. There is no client-side premium flag.
 */
export async function hasPremium(user: CurrentUser | null): Promise<boolean> {
  if (!user) return false;
  if (user.role === "admin" || user.role === "editor") return true;
  const active = (await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.status, "active"),
        gt(subscriptions.currentPeriodEnd, new Date()),
      ),
    )
    )[0];
  return Boolean(active);
}

export async function canAccess(user: CurrentUser | null, tier: AccessTier): Promise<boolean> {
  return tier === "free" || await hasPremium(user);
}

export const isStaff = (user: CurrentUser | null) =>
  user?.role === "admin" || user?.role === "editor";
