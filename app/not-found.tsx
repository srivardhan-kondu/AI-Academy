import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page max-w-xl py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-slate-600">It may have moved, or it may not be published yet.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/academy" className="btn-primary">Go to the Academy</Link>
        <Link href="/search" className="btn-secondary">Search</Link>
      </div>
    </div>
  );
}
