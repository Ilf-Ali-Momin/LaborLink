import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyEmployer } from "@/lib/employer";
import { updateListing } from "@/app/actions/listings";
import { ListingForm } from "@/components/employer/ListingForm";

export const metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const supabase = await createClient();
  // RLS scopes this to the caller's own employer.
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, type, description, city, remote, hourly_wage_cents, hours_per_week, status")
    .eq("id", id)
    .eq("employer_id", employer.id)
    .maybeSingle();

  if (!listing) notFound();

  return (
    <div>
      <h1 className="font-display text-display-m">Edit listing.</h1>
      {listing.status === "active" ? (
        <p className="mt-3 max-w-[55ch] text-smoke">
          This listing is live. Changes apply as soon as you save.
        </p>
      ) : null}
      <ListingForm
        action={updateListing}
        submitLabel="Save changes"
        errorCode={query.error}
        defaults={{
          id: listing.id,
          title: listing.title,
          type: listing.type,
          description: listing.description,
          city: listing.city,
          remote: listing.remote,
          wage: listing.hourly_wage_cents / 100,
          hours: Number(listing.hours_per_week),
        }}
      />
    </div>
  );
}
