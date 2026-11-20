import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = (await searchParams).next;
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="container-page max-w-md py-16">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome back</h1>
      <LoginForm next={typeof next === "string" ? next : undefined} />
    </div>
  );
}
