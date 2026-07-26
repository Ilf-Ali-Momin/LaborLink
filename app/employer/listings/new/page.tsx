import { redirect } from "next/navigation";
import { getMyEmployer } from "@/lib/employer";
import { createListing } from "@/app/actions/listings";
import { ListingForm } from "@/components/employer/ListingForm";

export const metadata = { title: "New listing" };

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  return (
    <div>
      <h1 className="font-display text-display-m">New listing.</h1>
      <p className="mt-3 max-w-[55ch] text-smoke">
        The role is checked against the legal limits before it can go live.
        It is created as a draft — you publish it from the listings page.
      </p>
      <ListingForm
        action={createListing}
        submitLabel="Create draft"
        errorCode={params.error}
      />
    </div>
  );
}
