"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

export type ActionState = { ok?: boolean; message?: string; errors?: Record<string, string> } | null;

export function SubmitButton({
  children,
  className = "btn-primary",
  pendingText = "Saving…",
  name,
  value,
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-disabled={pending} name={name} value={value}>
      {pending ? pendingText : children}
    </button>
  );
}

/** A form wired to a server action that returns `ActionState` for inline feedback. */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      <FormMessage state={state} />
    </form>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state?.message && !state?.errors) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={`mt-3 rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
    >
      {state.message}
      {state.errors && (
        <ul className="mt-1 list-disc pl-5">
          {Object.entries(state.errors).map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong> {v}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
