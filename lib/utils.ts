import clsx, { type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "n/a";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(d);
}

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const LEVEL_NAMES: Record<number, string> = {
  1: "Foundations",
  2: "Core AI Engineering",
  3: "Modern AI Engineering",
  4: "Production and Specialization",
};
