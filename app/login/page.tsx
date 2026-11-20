import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { isGoogleEnabled } from "@/lib/auth/google";
import { LoginForm } from "@/components/auth-forms";
import { AuthError, GoogleSignInButton } from "@/components/google-sign-in";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  if (await getCurrentUser()) redirect("/dashboard");
  const nextPath = typeof next === "string" ? next : undefined;
  return (
    <div className="container-page max-w-md py-16">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome back</h1>
      <AuthError code={typeof error === "string" ? error : undefined} />
      {isGoogleEnabled() && <GoogleSignInButton next={nextPath} />}
      <LoginForm next={nextPath} />
    </div>
  );
}
