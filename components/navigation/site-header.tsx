import Link from "next/link";
import { Search, Sparkles, Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { mainNav, site } from "@/lib/site";
import { signOut } from "@/app/actions/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Sparkles aria-hidden className="h-4 w-4" />
          </span>
          <span>{site.name}</span>
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="btn-ghost">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link href="/search" className="btn-ghost" aria-label="Search">
            <Search aria-hidden className="h-4 w-4" />
          </Link>
          {user ? (
            <>
              {isStaff(user) && (
                <Link href="/admin" className="btn-ghost">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-secondary">
                Dashboard
              </Link>
              <form action={signOut}>
                <button className="btn-ghost" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                Start learning free
              </Link>
            </>
          )}
        </div>

        {/* Mobile navigation — works without JavaScript */}
        <details className="relative ml-auto md:hidden">
          <summary className="btn-ghost list-none [&::-webkit-details-marker]:hidden" aria-label="Open menu">
            <Menu aria-hidden className="h-5 w-5" />
          </summary>
          <nav aria-label="Mobile" className="card absolute right-0 mt-2 flex w-60 flex-col p-2">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="btn-ghost justify-start">
                {item.label}
              </Link>
            ))}
            <Link href="/search" className="btn-ghost justify-start">
              Search
            </Link>
            <hr className="my-2 border-slate-200" />
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost justify-start">
                  Dashboard
                </Link>
                {isStaff(user) && (
                  <Link href="/admin" className="btn-ghost justify-start">
                    Admin
                  </Link>
                )}
                <form action={signOut}>
                  <button className="btn-ghost w-full justify-start" type="submit">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost justify-start">
                  Sign in
                </Link>
                <Link href="/signup" className="btn-primary">
                  Start learning free
                </Link>
              </>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
