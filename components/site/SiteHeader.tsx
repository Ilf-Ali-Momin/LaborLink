import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { HeaderShell } from "./HeaderShell";

const linkClass = "link-grow text-paper";

/**
 * Role-aware navigation: a logged-out visitor, a student, and an employer
 * each get a nav that makes sense for them — not one nav with items
 * greyed out (KICKOFF.md).
 */
export async function SiteHeader() {
  const session = await getSessionProfile();

  const brand = (
    <Link
      href="/"
      className="font-display text-xl font-bold tracking-[-0.02em] text-paper"
    >
      Labor<span className="text-signal">Link</span>
    </Link>
  );

  const publicLinks = (
    <>
      <Link className={linkClass} href="/jobs">
        Jobs
      </Link>
      <Link className={linkClass} href="/companies">
        Companies
      </Link>
      <Link className={linkClass} href="/compliance">
        The rules
      </Link>
    </>
  );

  if (!session) {
    return (
      <HeaderShell
        brand={brand}
        links={
          <>
            {publicLinks}
            <Link className={linkClass} href="/for-employers">
              For employers
            </Link>
          </>
        }
        actions={
          <>
            <Link className={linkClass} href="/login">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-r bg-signal px-4 py-2 font-medium text-void transition-colors duration-200 hover:bg-paper"
            >
              Create account
            </Link>
          </>
        }
      />
    );
  }

  const appHome = session.role === "student" ? "/dashboard" : "/employer";
  const appLabel = session.role === "student" ? "Dashboard" : "Employer area";

  return (
    <HeaderShell
      brand={brand}
      links={publicLinks}
      actions={
        <>
          <Link
            href={appHome}
            className="rounded-r bg-signal px-4 py-2 font-medium text-void transition-colors duration-200 hover:bg-paper"
          >
            {appLabel}
          </Link>
          <form action={signOut}>
            <button type="submit" className={linkClass}>
              Log out
            </button>
          </form>
        </>
      }
    />
  );
}
