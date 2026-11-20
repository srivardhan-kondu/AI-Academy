"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/actions/auth";
import { FormMessage, SubmitButton } from "@/components/ui/form";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Signing in…">Sign in</SubmitButton>
      <FormMessage state={state} />
      <p className="text-center text-sm text-slate-600">
        New here? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700">Create a free account</Link>
      </p>
    </form>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signUp, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="displayName" className="label">Your name</label>
        <input id="displayName" name="displayName" required maxLength={80} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="input" aria-describedby="pw-hint" />
        <p id="pw-hint" className="mt-1 text-xs text-slate-500">At least 10 characters.</p>
      </div>
      <SubmitButton className="btn-primary w-full" pendingText="Creating account…">Create free account</SubmitButton>
      <FormMessage state={state} />
      <p className="text-center text-xs text-slate-500">We store only what we need: your name, email and learning progress. You can delete your account at any time.</p>
      <p className="text-center text-sm text-slate-600">
        Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700">Sign in</Link>
      </p>
    </form>
  );
}
