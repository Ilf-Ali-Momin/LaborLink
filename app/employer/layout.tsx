import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

/**
 * Employer app shell. Employer surfaces are white-dominant (DESIGN.md) —
 * same components as the student side, opposite ground.
 */
export default async function EmployerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/employer");
  if (session.role !== "employer") redirect("/dashboard");

  const nav = [
    { href: "/employer", label: "Overview" },
    { href: "/employer/listings", label: "Listings" },
    { href: "/employer/applicants", label: "Applicants" },
    { href: "/employer/hours", label: "Hours" },
    { href: "/employer/billing", label: "Billing" },
    { href: "/employer/profile", label: "Company" },
  ];

  return (
    <div className="min-h-screen bg-paper text-void" data-ground="paper">
      <header className="border-b-2 border-void">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-[-0.02em]"
          >
            Labor<span className="text-signal-dk">Link</span>
            <span className="ml-3 align-middle font-body text-sm font-normal text-smoke">
              Employer
            </span>
          </Link>
          <nav aria-label="Employer" className="flex flex-wrap items-center gap-6">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="link-grow text-void">
                {item.label}
              </Link>
            ))}
            <Link href="/pricing" className="link-grow text-smoke">
              Pricing
            </Link>
            <form action={signOut}>
              <button type="submit" className="link-grow text-smoke">
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
