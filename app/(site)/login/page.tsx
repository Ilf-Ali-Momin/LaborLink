import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signIn } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Log in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const session = await getSessionProfile();
  if (session) {
    redirect(session.role === "employer" ? "/employer" : "/dashboard");
  }

  return (
    <div className="bg-void text-paper">
      <div className="mx-auto max-w-md px-6 py-20 lg:px-0">
        <h1 className="font-display text-display-l">Log in.</h1>

        {params.error === "unconfirmed" ? (
          <p className="mt-6 border-l-2 border-near pl-4 text-sm">
            Your password is correct, but this email is not confirmed yet.
            Open the confirmation link we sent you, then log in again.
          </p>
        ) : params.error ? (
          <p className="mt-6 border-l-2 border-over pl-4 text-sm">
            Email or password is wrong. Check both and try again.
          </p>
        ) : null}

        <form action={signIn} className="mt-8 space-y-5">
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
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1.5 w-full border border-ash bg-transparent p-3 rounded-r outline-none focus:border-signal"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-r bg-signal px-6 py-3 font-medium text-void transition-colors duration-200 hover:bg-paper"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-sm text-paper/60">
          New here?{" "}
          <Link href="/signup" className="link-grow text-paper">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
