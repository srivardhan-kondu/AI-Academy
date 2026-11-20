import type { ReactNode } from "react";

type Base = { name: string; label: string; hint?: string; required?: boolean };

export function Field({ name, label, hint, required, defaultValue, type = "text", ...rest }: Base & { defaultValue?: string | number | null; type?: string; min?: number; max?: number; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label}{required && <span className="text-red-600"> *</span>}</label>
      <input id={`f-${name}`} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} className="input" {...rest} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Area({ name, label, hint, required, defaultValue, rows = 4, mono = false }: Base & { defaultValue?: string | null; rows?: number; mono?: boolean }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label}{required && <span className="text-red-600"> *</span>}</label>
      <textarea id={`f-${name}`} name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className={`input ${mono ? "font-mono text-xs" : ""}`} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Select({ name, label, hint, defaultValue, options, required }: Base & { defaultValue?: string | number | null; options: { value: string | number; label: string }[] }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label}</label>
      <select id={`f-${name}`} name={name} defaultValue={defaultValue ?? undefined} required={required} className="input">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];
export const TIER_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
];
export const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function AdminPage({ title, actions, children, description }: { title: string; actions?: ReactNode; children: ReactNode; description?: string }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
