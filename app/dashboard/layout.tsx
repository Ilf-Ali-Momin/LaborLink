import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

/**
 * Student app shell. Student surfaces are black-dominant (DESIGN.md).
 * The role check runs server-side on every request — middleware only
 * handles the redirect convenience.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/dashboard");
  if (session.role !== "student") redirect("/employer");

  const nav = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/hours", label: "Hours" },
    { href: "/dashboard/applications", label: "Applications" },
    { href: "/dashboard/payments", label: "Payments" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-void text-paper">
      <header className="border-b border-ash">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-[-0.02em]"
          >
            Labor<span className="text-signal">Link</span>
          </Link>
          <nav aria-label="Dashboard" className="flex flex-wrap items-center gap-6">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="link-grow text-paper">
                {item.label}
              </Link>
            ))}
            <Link href="/jobs" className="link-grow text-paper/60">
              Browse jobs
            </Link>
            <form action={signOut}>
              <button type="submit" className="link-grow text-paper/60">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {children}
      </main>
    </div>
  );
}
