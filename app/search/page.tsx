import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { db } from "@/lib/db";
import { searchMisses } from "@/lib/db/schema";
import { searchContent } from "@/lib/content/queries";
import { PageHeader } from "@/components/academy/cards";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (typeof raw === "string" ? raw : "").trim().slice(0, 100);
  const results = q.length >= 2 ? await searchContent(q) : [];
  // Record searches with no results so editors know what content is missing.
  if (q.length >= 2 && results.length === 0) (await db.insert(searchMisses).values({ query: q.toLowerCase() }));

  return (
    <>
      <PageHeader eyebrow="Search" title="Search the platform">
        <form role="search" className="flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">Search lessons, paths, labs and projects</label>
          <input id="q" name="q" defaultValue={q} placeholder="e.g. gradient descent, tokens, RAG…" className="input" autoFocus />
          <button className="btn-primary" type="submit"><Search aria-hidden className="h-4 w-4" /> Search</button>
        </form>
      </PageHeader>
      <div className="container-page max-w-3xl py-10">
        {q.length >= 2 && (
          <p className="mb-4 text-sm text-slate-600" role="status">{results.length} result{results.length === 1 ? "" : "s"} for “{q}”</p>
        )}
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="card block p-4 hover:border-brand-300">
                <span className="badge bg-brand-50 text-brand-800 ring-1 ring-brand-200">{r.kind}</span>
                <span className="mt-1 block font-semibold text-slate-900">{r.title}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-slate-600">{r.snippet}</span>
              </Link>
            </li>
          ))}
        </ul>
        {q.length >= 2 && results.length === 0 && (
          <p className="rounded-xl bg-slate-50 p-5 text-slate-700">Nothing found yet. We log empty searches to decide what to write next. Try a broader term, or <Link href="/academy" className="font-semibold text-brand-700 underline">browse the Academy</Link>.</p>
        )}
      </div>
    </>
  );
}
