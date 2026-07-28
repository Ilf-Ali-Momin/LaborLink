import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyEmployer } from "@/lib/employer";
import { updateEmployer } from "@/app/actions/employers";

export const metadata = { title: "Company profile" };

const inputClass =
  "mt-1.5 w-full border border-hairline bg-paper p-3 rounded-r outline-none focus:border-void disabled:bg-hairline/30 disabled:text-smoke";

const errors: Record<string, string> = {
  name: "A company name is required.",
  website: "The website must start with http:// or https://.",
  owner: "Only the account owner can change the company profile.",
  failed: "Saving failed. Try again.",
};

export default async function CompanyProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const isOwner = employer.member_role === "owner";
  const error = params.error ? (errors[params.error] ?? errors.failed) : null;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-display-m">Company profile.</h1>
      <p className="mt-3 max-w-[60ch] text-smoke">
        This is what students see on your public page and next to every role
        you post. Write it in plain words.
      </p>

      {params.saved ? (
        <p className="mt-6 border-l-2 border-signal-dk pl-4">Profile saved.</p>
      ) : null}
      {error ? (
        <p className="mt-6 border-l-2 border-over pl-4">{error}</p>
      ) : null}
      {!isOwner ? (
        <p className="mt-6 border-l-2 border-near pl-4">
          You can see the company profile, but only the account owner can
          change it.
        </p>
      ) : null}

      <form action={updateEmployer} className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Company name
          </label>
          <input
            id="name"
            name="name"
            required
            disabled={!isOwner}
            defaultValue={employer.name}
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              disabled={!isOwner}
              defaultValue={employer.city ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="website" className="text-sm font-medium">
              Website (optional)
            </label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              disabled={!isOwner}
              defaultValue={employer.website ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">
            About the company
          </label>
          <p className="text-sm text-smoke">
            What you do, how big the team is, what working with you is like.
          </p>
          <textarea
            id="description"
            name="description"
            rows={6}
            maxLength={4000}
            disabled={!isOwner}
            defaultValue={employer.description ?? ""}
            className={inputClass}
          />
        </div>

        {/* The slug is the company's public address and never changes on
            rename — students may have the link open or bookmarked. */}
        <div className="border border-hairline p-5 rounded-r">
          <p className="eyebrow text-smoke">Public address</p>
          <p className="mt-2 font-mono text-sm break-all">
            /companies/{employer.slug}
          </p>
          <p className="mt-2 text-sm text-smoke">
            This stays the same if you rename the company, so links students
            already have keep working.{" "}
            <Link
              href={`/companies/${employer.slug}`}
              className="link-grow text-void"
            >
              View public page
            </Link>
          </p>
        </div>

        {isOwner ? (
          <button
            type="submit"
            className="rounded-r border border-void bg-signal px-6 py-3 font-medium text-void transition-colors duration-200 hover:bg-void hover:text-signal"
          >
            Save changes
          </button>
        ) : null}
      </form>
    </div>
  );
}
