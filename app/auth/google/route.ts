import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { GOOGLE_NEXT_COOKIE, GOOGLE_STATE_COOKIE, GOOGLE_VERIFIER_COOKIE, createAuthorizationRequest, isGoogleEnabled } from "@/lib/auth/google";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/utils";

/** Starts Google sign-in: sets short-lived state/PKCE cookies and redirects to Google. */
export async function GET(request: NextRequest) {
  if (!isGoogleEnabled()) redirect("/login?error=google_unavailable");
  if (!rateLimit(`google:${await clientIp()}`, 20, 15 * 60_000)) redirect("/login?error=rate_limited");

  const { url, state, codeVerifier } = createAuthorizationRequest();
  const next = request.nextUrl.searchParams.get("next") ?? "";
  const jar = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const, // must survive the top-level redirect back from Google
    secure: siteUrl().startsWith("https://"),
    path: "/auth/google",
    maxAge: 10 * 60,
  };
  jar.set(GOOGLE_STATE_COOKIE, state, opts);
  jar.set(GOOGLE_VERIFIER_COOKIE, codeVerifier, opts);
  // Only same-site relative paths are allowed as post-login destinations.
  if (next.startsWith("/") && !next.startsWith("//")) jar.set(GOOGLE_NEXT_COOKIE, next, opts);
  else jar.delete({ name: GOOGLE_NEXT_COOKIE, path: "/auth/google" });
  redirect(url);
}
