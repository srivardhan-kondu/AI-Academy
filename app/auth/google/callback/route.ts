import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  GOOGLE_NEXT_COOKIE,
  GOOGLE_STATE_COOKIE,
  GOOGLE_VERIFIER_COOKIE,
  exchangeCodeForProfile,
  isGoogleEnabled,
  upsertGoogleUser,
} from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Google redirects here after the user signs in. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const jar = await cookies();
  const expectedState = jar.get(GOOGLE_STATE_COOKIE)?.value;
  const codeVerifier = jar.get(GOOGLE_VERIFIER_COOKIE)?.value;
  const next = jar.get(GOOGLE_NEXT_COOKIE)?.value;
  for (const name of [GOOGLE_STATE_COOKIE, GOOGLE_VERIFIER_COOKIE, GOOGLE_NEXT_COOKIE]) jar.delete({ name, path: "/auth/google" });

  if (!isGoogleEnabled()) redirect("/login?error=google_unavailable");
  if (params.get("error")) redirect("/login?error=google_cancelled"); // e.g. user pressed Cancel
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state || !expectedState || !codeVerifier || !safeEqual(state, expectedState)) {
    redirect("/login?error=google_state");
  }

  let destination: string;
  try {
    const profile = await exchangeCodeForProfile(code, codeVerifier);
    const { userId, isNew } = await upsertGoogleUser(profile);
    await createSession(userId);
    destination = next ?? (isNew ? "/get-started" : "/dashboard");
  } catch (e) {
    console.error("[google-auth]", e instanceof Error ? e.message : e);
    destination = "/login?error=google_failed";
  }
  redirect(destination);
}
