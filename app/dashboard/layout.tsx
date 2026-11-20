import Link from "next/link";
import { requireUser } from "@/lib/auth/session";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/bookmarks", label: "Bookmarks" },
  { href: "/dashboard/achievements", label: "Milestones" },
  { href: "/account", label: "Account" },
];

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  return (
    <div className="container-page py-10">
      <p className="eyebrow">Student dashboard</p>
      <h1 className="mt-1 text-3xl font-bold">Hi, {user.displayName}</h1>
      <nav aria-label="Dashboard" className="mt-6 flex flex-wrap gap-1 border-b border-slate-200">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-slate-900">
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="pt-8">{children}</div>
    </div>
  );
}
