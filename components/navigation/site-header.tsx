import Link from "next/link";
import { Search, Sparkle, Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { mainNav, site } from "@/lib/site";
import { signOut } from "@/app/actions/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="container-page relative flex h-[4.1875rem] items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[1.1562rem] font-semibold tracking-[-0.01em] text-ink">
          <span className="grid h-[1.875rem] w-[1.875rem] place-items-center rounded-[8px] bg-brand text-surface">
            <Sparkle aria-hidden className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <span>{site.name}</span>
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-0.5 lg:flex min-[1140px]:absolute min-[1140px]:left-1/2 min-[1140px]:ml-0 min-[1140px]:-translate-x-1/2">
          {mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[9px] px-3.5 py-2 text-[1rem] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-1.5 lg:flex">
          <Link href="/search" className="btn-ghost" aria-label="Search">
            <Search aria-hidden className="h-4 w-4" strokeWidth={1.5} />
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
        <details className="relative ml-auto lg:hidden">
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
            <hr className="my-2 border-line" />
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
