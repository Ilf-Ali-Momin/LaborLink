"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireEmployer, getMyEmployer } from "@/lib/employer";
import { slugify, randomSuffix } from "@/lib/slug";
import { activeListingLimit } from "@/lib/entitlements";
import {
  MINIMUM_WAGE,
  MINIJOB_MONTHLY_CEILING,
  WERKSTUDENT_WEEKLY_HOURS,
} from "@/lib/compliance/config";

const TYPES = ["werkstudent", "minijob", "kurzfristig"] as const;
type ListingTypeInput = (typeof TYPES)[number];

interface ParsedListing {
  title: string;
  type: ListingTypeInput;
  description: string;
  city: string | null;
  remote: boolean;
  hourly_wage_cents: number;
  hours_per_week: number;
}

/**
 * Legal validation happens here, against the config module — a listing
 * that cannot be legal never reaches the database as "active".
 * Returns an error slug (for the redirect) or the parsed values.
 */
function parseAndValidate(formData: FormData): { error: string } | { values: ParsedListing } {
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const typeRaw = String(formData.get("type") ?? "");
  const description = String(formData.get("description") ?? "").trim().slice(0, 10000);
  const city = String(formData.get("city") ?? "").trim().slice(0, 100);
  const remote = formData.get("remote") === "on";
  const wageEur = Number(String(formData.get("wage") ?? "").replace(",", "."));
  const hours = Number(String(formData.get("hours") ?? "").replace(",", "."));

  if (!title || !description) return { error: "missing" };
  if (!TYPES.includes(typeRaw as ListingTypeInput)) return { error: "missing" };
  const type = typeRaw as ListingTypeInput;

  if (!Number.isFinite(wageEur) || !Number.isFinite(hours) || hours <= 0 || hours > 48) {
    return { error: "numbers" };
  }
  if (wageEur < MINIMUM_WAGE.value) return { error: "minwage" };
  if (type === "werkstudent" && hours > WERKSTUDENT_WEEKLY_HOURS.value) {
    return { error: "werkstudent-hours" };
  }
  if (type === "minijob" && wageEur * hours * 4.33 > MINIJOB_MONTHLY_CEILING.value) {
    return { error: "minijob-ceiling" };
  }

  return {
    values: {
      title,
      type,
      description,
      city: city || null,
      remote,
      hourly_wage_cents: Math.round(wageEur * 100),
      hours_per_week: Math.round(hours * 10) / 10,
    },
  };
}

export async function createListing(formData: FormData) {
  const { supabase } = await requireEmployer();
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const parsed = parseAndValidate(formData);
  if ("error" in parsed) redirect(`/employer/listings/new?error=${parsed.error}`);

  let slug = `${employer.slug}-${slugify(parsed.values.title)}`;
  const { data: existing } = await supabase
    .from("listings")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = `${slug}-${randomSuffix()}`;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({ ...parsed.values, slug, employer_id: employer.id })
    .select("id")
    .single();

  if (error || !listing) {
    console.error("createListing failed", { code: error?.code });
    redirect("/employer/listings/new?error=failed");
  }

  revalidatePath("/employer/listings");
  redirect(`/employer/listings?created=1`);
}

export async function updateListing(formData: FormData) {
  const { supabase } = await requireEmployer();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/employer/listings");

  const parsed = parseAndValidate(formData);
  if ("error" in parsed) redirect(`/employer/listings/${id}/edit?error=${parsed.error}`);

  // RLS restricts the update to listings of the caller's own employer.
  const { error } = await supabase
    .from("listings")
    .update({ ...parsed.values, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("updateListing failed", { code: error.code });
    redirect(`/employer/listings/${id}/edit?error=failed`);
  }

  revalidatePath("/employer/listings");
  redirect("/employer/listings?saved=1");
}

export async function setListingStatus(formData: FormData) {
  const { supabase } = await requireEmployer();
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "active", "closed"].includes(status)) {
    redirect("/employer/listings");
  }

  if (status === "active") {
    // Entitlement check, server-side, from the database — never from the
    // client or a checkout redirect.
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier, status")
      .eq("employer_id", employer.id)
      .maybeSingle();
    const tier = sub?.status === "active" ? sub.tier : "free";
    const limit = activeListingLimit(tier);

    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("employer_id", employer.id)
      .eq("status", "active")
      .neq("id", id);

    if ((count ?? 0) >= limit) {
      redirect("/employer/listings?error=limit");
    }
  }

  const { error } = await supabase
    .from("listings")
    .update({
      status: status as "draft" | "active" | "closed",
      published_at: status === "active" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("setListingStatus failed", { code: error.code });
  }

  revalidatePath("/employer/listings");
  revalidatePath("/jobs");
  redirect("/employer/listings");
}

const EMPLOYER_STATUSES = ["in_review", "interview", "offer", "hired", "rejected"] as const;

export async function updateApplicationStatus(formData: FormData) {
  const { supabase } = await requireEmployer();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !EMPLOYER_STATUSES.includes(status as (typeof EMPLOYER_STATUSES)[number])) {
    redirect("/employer/applicants");
  }

  // RLS: only applications on the caller's own listings are updatable.
  const { error } = await supabase
    .from("applications")
    .update({ status: status as (typeof EMPLOYER_STATUSES)[number] })
    .eq("id", id);

  if (error) {
    console.error("updateApplicationStatus failed", { code: error.code });
  }

  revalidatePath("/employer/applicants");
  redirect("/employer/applicants");
}
