"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireEmployer, getMyEmployer } from "@/lib/employer";
import { slugify, randomSuffix } from "@/lib/slug";

/** Shared field parsing for create and update. */
function parseCompanyFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 200);
  const city = String(formData.get("city") ?? "").trim().slice(0, 100);
  const website = String(formData.get("website") ?? "").trim().slice(0, 300);
  const description = String(formData.get("description") ?? "").trim().slice(0, 4000);

  if (!name) return { error: "name" as const };
  if (website && !/^https?:\/\//.test(website)) {
    return { error: "website" as const };
  }
  return {
    values: {
      name,
      city: city || null,
      website: website || null,
      description: description || null,
    },
  };
}

/**
 * Updates the public company profile. Owner-only: RLS enforces it at the
 * database level (employers_update_owner), and this checks first so a
 * non-owner gets a clear message instead of a silent no-op.
 *
 * The slug is deliberately NOT regenerated on rename. It is the company's
 * public address — students may have it open or bookmarked, and listings
 * link through it. A rename changes the displayed name, not the URL.
 */
export async function updateEmployer(formData: FormData) {
  const { supabase } = await requireEmployer();
  const employer = await getMyEmployer();
  if (!employer) redirect("/employer");
  if (employer.member_role !== "owner") {
    redirect("/employer/profile?error=owner");
  }

  const parsed = parseCompanyFields(formData);
  if ("error" in parsed) {
    redirect(`/employer/profile?error=${parsed.error}`);
  }

  const { data: updated, error } = await supabase
    .from("employers")
    .update(parsed.values)
    .eq("id", employer.id)
    .select("id");

  if (error) {
    console.error("updateEmployer failed", { code: error.code });
    redirect("/employer/profile?error=failed");
  }
  // RLS returning zero rows means the policy refused the write.
  if (!updated || updated.length === 0) {
    redirect("/employer/profile?error=owner");
  }

  revalidatePath("/employer/profile");
  revalidatePath("/employer");
  revalidatePath(`/companies/${employer.slug}`);
  revalidatePath("/companies");
  redirect("/employer/profile?saved=1");
}

export async function createEmployer(formData: FormData) {
  const { supabase, userId } = await requireEmployer();

  const parsed = parseCompanyFields(formData);
  if ("error" in parsed) redirect(`/employer?error=${parsed.error}`);
  const { name, city, website, description } = parsed.values;

  let slug = slugify(name);
  const { data: existing } = await supabase
    .from("employers")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = `${slug}-${randomSuffix()}`;

  const { data: employer, error } = await supabase
    .from("employers")
    .insert({ name, slug, city, website, description, created_by: userId })
    .select("id")
    .single();

  if (error || !employer) {
    console.error("createEmployer failed", { code: error?.code });
    redirect("/employer?error=failed");
  }

  const { error: memberError } = await supabase.from("employer_members").insert({
    employer_id: employer.id,
    user_id: userId,
    member_role: "owner",
  });

  if (memberError) {
    console.error("createEmployer membership failed", { code: memberError.code });
    redirect("/employer?error=failed");
  }

  revalidatePath("/employer");
  redirect("/employer");
}
