import Link from "next/link";
import { site } from "@/lib/site";

const groups = [
  {
    title: "Learn",
    links: [
      { href: "/academy", label: "AI Academy" },
      { href: "/academy/paths", label: "Learning paths" },
      { href: "/labs", label: "Interactive labs" },
      { href: "/projects", label: "Project lab" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/get-started", label: "Find your path" },
      { href: "/pricing", label: "Free & Premium" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <p className="font-bold text-slate-900">{site.name}</p>
          <p className="mt-2 text-sm text-slate-600">{site.tagline}</p>
          <p className="mt-1 text-sm text-slate-500">{site.promise}</p>
        </div>
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <p className="text-sm font-semibold text-slate-900">{g.title}</p>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {site.name}. Educational content is reviewed and dated; fast-moving topics may change.
      </div>
    </footer>
  );
}
