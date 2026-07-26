import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signUp } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionProfile();
  if (session) {
    redirect(session.role === "employer" ? "/employer" : "/dashboard");
  }

  const role =
    params.role === "employer" || params.role === "student" ? params.role : null;

  return (
    <div className="bg-void text-paper">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-0">
        {role === null ? (
          <>
            <h1 className="font-display text-display-l">
              Who are you here as?
            </h1>
            <p className="mt-4 max-w-[55ch] text-body-l text-paper/70">
              The two sides of LaborLink see different things. This choice is
              permanent for the account — pick the one that is really you.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <Link
                href="/signup?role=student"
                className="card-lift block border border-ash bg-ash/50 p-8 rounded-r"
              >
                <p className="eyebrow text-signal">Student</p>
                <h2 className="mt-3 font-display text-display-m">
                  I want to work.
                </h2>
                <p className="mt-4 text-paper/70">
                  Find roles that fit your limits, apply, and track your
                  hours. Free, always.
                </p>
              </Link>
              <Link
                href="/signup?role=employer"
                className="card-lift block border border-paper bg-paper p-8 rounded-r text-void"
              >
                <p className="eyebrow text-signal-dk">Employer</p>
                <h2 className="mt-3 font-display text-display-m">
                  I want to hire.
                </h2>
                <p className="mt-4 text-smoke">
                  Post roles that pass the legal checks and meet students who
                  fit them. First listing free.
                </p>
              </Link>
            </div>
            <p className="mt-10 text-paper/60">
              Already have an account?{" "}
              <Link href="/login" className="link-grow text-paper">
                Log in
              </Link>
            </p>
          </>
        ) : (
          <div className="mx-auto max-w-md">
            <p className="eyebrow text-signal">
              {role === "student" ? "Student account" : "Employer account"}
            </p>
            <h1 className="mt-3 font-display text-display-l">
              Create your account.
            </h1>
            <p className="mt-3 text-paper/70">
              {role === "student"
                ? "Free, and it stays free."
                : "Your first active listing is free."}
            </p>

            {params.error === "invalid" ? (
              <p className="mt-6 border-l-2 border-over pl-4 text-sm">
                Enter a valid email and a password with at least 8 characters.
              </p>
            ) : params.error === "failed" ? (
              <p className="mt-6 border-l-2 border-over pl-4 text-sm">
                The account could not be created. If you already have one,{" "}
                <Link href="/login" className="link-grow text-paper">
                  log in
                </Link>
                .
              </p>
            ) : null}

            <form action={signUp} className="mt-8 space-y-5">
              <input type="hidden" name="role" value={role} />
              {params.next ? (
                <input type="hidden" name="next" value={params.next} />
              ) : null}
              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1.5 w-full border border-ash bg-transparent p-3 rounded-r outline-none focus:border-signal"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium">
                  Password (at least 8 characters)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="mt-1.5 w-full border border-ash bg-transparent p-3 rounded-r outline-none focus:border-signal"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-r bg-signal px-6 py-3 font-medium text-void transition-colors duration-200 hover:bg-paper"
              >
                Create account
              </button>
            </form>
            <p className="mt-6 text-sm text-paper/60">
              Not a {role}?{" "}
              <Link href="/signup" className="link-grow text-paper">
                Choose the other side
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
