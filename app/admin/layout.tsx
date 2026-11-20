import Link from "next/link";
import type { Metadata } from "next";
import { requireEditor } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/schools", label: "Schools" },
  { href: "/admin/paths", label: "Learning paths" },
  { href: "/admin/modules", label: "Modules" },
  { href: "/admin/lessons", label: "Lessons" },
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/labs", label: "Labs" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/users", label: "Users", adminOnly: true },
  { href: "/admin/audit", label: "Audit log", adminOnly: true },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireEditor();
  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
      <aside>
        <p className="eyebrow">Content admin</p>
        <p className="mt-1 text-xs text-slate-500">Signed in as {user.role}</p>
        <nav aria-label="Admin" className="mt-4 flex flex-row flex-wrap gap-1 lg:flex-col">
          {NAV.filter((n) => !n.adminOnly || user.role === "admin").map((n) => (
            <Link key={n.href} href={n.href} className="btn-ghost justify-start">{n.label}</Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
