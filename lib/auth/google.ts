import "server-only";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, userProfiles, oauthAccounts, sessions } from "@/lib/db/schema";
import { siteUrl } from "@/lib/utils";

/**
 * Google sign-in (OAuth 2.0 authorization code flow + OpenID Connect).
 * Protected with `state` (CSRF) and PKCE. The ID token is received directly
 * from Google's token endpoint over TLS, and its claims are validated
 * (OIDC Core §3.1.3.7).
 */

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

export const GOOGLE_STATE_COOKIE = "g_oauth_state";
export const GOOGLE_VERIFIER_COOKIE = "g_oauth_verifier";
export const GOOGLE_NEXT_COOKIE = "g_oauth_next";

export function isGoogleEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export const googleRedirectUri = () => `${siteUrl()}/auth/google/callback`;

const b64url = (buf: Buffer) => buf.toString("base64url");

export function createAuthorizationRequest() {
  const state = b64url(crypto.randomBytes(32));
  const codeVerifier = b64url(crypto.randomBytes(32));
  const codeChallenge = b64url(crypto.createHash("sha256").update(codeVerifier).digest());
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), state, codeVerifier };
}

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
};

type IdTokenClaims = {
  iss?: string;
  aud?: string;
  sub?: string;
  exp?: number;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

/** Validate ID-token claims. Exported for tests. */
export function validateIdTokenClaims(claims: IdTokenClaims, clientId: string, nowSeconds = Date.now() / 1000): GoogleProfile {
  if (!claims.iss || !ISSUERS.has(claims.iss)) throw new Error("Invalid token issuer");
  if (claims.aud !== clientId) throw new Error("Token was not issued for this application");
  if (!claims.exp || claims.exp < nowSeconds - 60) throw new Error("Token has expired");
  if (!claims.sub || !claims.email) throw new Error("Token is missing the account identifier or email");
  return {
    sub: claims.sub,
    email: claims.email.toLowerCase(),
    emailVerified: claims.email_verified === true || claims.email_verified === "true",
    name: claims.name?.slice(0, 80) ?? null,
    picture: claims.picture?.startsWith("https://") ? claims.picture : null,
  };
}

export async function exchangeCodeForProfile(code: string, codeVerifier: string): Promise<GoogleProfile> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      code_verifier: codeVerifier,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`);
  const body = (await res.json()) as { id_token?: string };
  const payload = body.id_token?.split(".")[1];
  if (!payload) throw new Error("Google did not return an ID token");
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as IdTokenClaims;
  return validateIdTokenClaims(claims, process.env.GOOGLE_CLIENT_ID!);
}

/**
 * Find or create the local user for a Google identity.
 *
 * 1. A linked Google account signs straight in.
 * 2. Otherwise, if a user with the same (Google-verified) email exists, link it.
 *    If that account's email was never verified, someone else could have
 *    registered it first ("pre-hijacking"), so its password and sessions are
 *    removed: only the verified Google owner keeps access.
 * 3. Otherwise create a new student account.
 */
export async function upsertGoogleUser(profile: GoogleProfile): Promise<{ userId: string; isNew: boolean }> {
  if (!profile.emailVerified) throw new Error("Your Google email address is not verified.");

  const [linked] = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(and(eq(oauthAccounts.provider, "google"), eq(oauthAccounts.providerAccountId, profile.sub)))
    .limit(1);
  if (linked) return { userId: linked.userId, isNew: false };

  const [existing] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
  if (existing) {
    await db.transaction(async (tx) => {
      if (!existing.emailVerifiedAt) {
        await tx.update(users).set({ passwordHash: null, emailVerifiedAt: new Date() }).where(eq(users.id, existing.id));
        await tx.delete(sessions).where(eq(sessions.userId, existing.id));
      }
      await tx.insert(oauthAccounts).values({ userId: existing.id, provider: "google", providerAccountId: profile.sub });
    });
    return { userId: existing.id, isNew: false };
  }

  const userId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ id: userId, email: profile.email, passwordHash: null, role: "student", emailVerifiedAt: new Date() });
    await tx.insert(userProfiles).values({ userId, displayName: profile.name ?? profile.email.split("@")[0], avatarUrl: profile.picture });
    await tx.insert(oauthAccounts).values({ userId, provider: "google", providerAccountId: profile.sub });
  });
  return { userId, isNew: true };
}
