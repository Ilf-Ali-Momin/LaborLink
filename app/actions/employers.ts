"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireEmployer } from "@/lib/employer";
import { slugify, randomSuffix } from "@/lib/slug";

export async function createEmployer(formData: FormData) {
  const { supabase, userId } = await requireEmployer();

  const name = String(formData.get("name") ?? "").trim().slice(0, 200);
  const city = String(formData.get("city") ?? "").trim().slice(0, 100);
  const website = String(formData.get("website") ?? "").trim().slice(0, 300);
  const description = String(formData.get("description") ?? "").trim().slice(0, 4000);

  if (!name) redirect("/employer?error=name");
  if (website && !/^https?:\/\//.test(website)) {
    redirect("/employer?error=website");
  }

  let slug = slugify(name);
  const { data: existing } = await supabase
    .from("employers")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = `${slug}-${randomSuffix()}`;

  const { data: employer, error } = await supabase
    .from("employers")
    .insert({
      name,
      slug,
      city: city || null,
      website: website || null,
      description: description || null,
      created_by: userId,
    })
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
