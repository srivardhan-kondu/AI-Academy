import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { isGoogleEnabled } from "@/lib/auth/google";
import { SignupForm } from "@/components/auth-forms";
import { AuthError, GoogleSignInButton } from "@/components/google-sign-in";

export const metadata: Metadata = { title: "Create your free account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next, error } = await searchParams;
  if (await getCurrentUser()) redirect("/dashboard");
  const nextPath = typeof next === "string" ? next : undefined;
  return (
    <div className="container-page max-w-md py-16">
      <h1 className="text-center text-3xl font-bold">Start learning free</h1>
      <p className="mb-6 mt-2 text-center text-slate-600">Track progress, save bookmarks and pick up where you left off.</p>
      <AuthError code={typeof error === "string" ? error : undefined} />
      {isGoogleEnabled() && <GoogleSignInButton next={nextPath} label="Sign up with Google" />}
      <SignupForm next={nextPath} />
    </div>
  );
}
