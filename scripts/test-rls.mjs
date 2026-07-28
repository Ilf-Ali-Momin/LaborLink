/**
 * RLS policy test matrix (SECURITY.md: "an untested policy is an
 * unwritten policy"). Runs against the LOCAL Supabase stack only.
 *
 *   node scripts/test-rls.mjs
 *
 * Creates throwaway users via the admin API, then exercises every
 * tenant boundary as the OTHER side: another student, another employer,
 * and an anonymous session.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
// Standard local demo keys (public by design, local only).
const ANON =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

if (!URL.includes("127.0.0.1") && !URL.includes("localhost")) {
  console.error("Refusing to run RLS tests against a non-local Supabase.");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function makeUser(role, tag) {
  const email = `rls-${tag}-${Date.now()}@test.local`;
  const password = "test-password-123";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });
  if (error) throw new Error(`createUser ${tag}: ${error.message}`);
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`signIn ${tag}: ${signInError.message}`);
  return { id: data.user.id, client };
}

const studentA = await makeUser("student", "studentA");
const studentB = await makeUser("student", "studentB");
const employerA = await makeUser("employer", "employerA");
const employerB = await makeUser("employer", "employerB");
const anon = createClient(URL, ANON, { auth: { persistSession: false } });

console.log("\nSetup as the legitimate owners:");

// Student A completes a profile and logs hours.
{
  const { error } = await studentA.client.from("student_profiles").insert({
    user_id: studentA.id,
    first_name: "Ada",
    last_name: "Test",
    university: "TU Berlin",
    work_auth: "eu_citizen",
  });
  check("studentA creates own profile", !error, error?.message);
  const { error: hoursError } = await studentA.client.from("hour_entries").insert({
    student_id: studentA.id,
    worked_on: "2026-07-20",
    hours: 6,
  });
  check("studentA logs own hours", !hoursError, hoursError?.message);
}

// Employer A creates org (bootstrap policy) and a listing, publishes it.
let orgA, listingA;
{
  const { data, error } = await employerA.client
    .from("employers")
    .insert({ name: "Org A", slug: `org-a-${Date.now()}`, created_by: employerA.id })
    .select("id")
    .single();
  check("employerA creates company", !error, error?.message);
  orgA = data?.id;
  const { error: memberError } = await employerA.client
    .from("employer_members")
    .insert({ employer_id: orgA, user_id: employerA.id, member_role: "owner" });
  check("employerA bootstraps own membership", !memberError, memberError?.message);
  const { data: listing, error: listingError } = await employerA.client
    .from("listings")
    .insert({
      employer_id: orgA,
      title: "RLS test role",
      slug: `rls-test-role-${Date.now()}`,
      type: "werkstudent",
      description: "test",
      hourly_wage_cents: 1500,
      hours_per_week: 15,
      status: "active",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  check("employerA creates listing", !listingError, listingError?.message);
  listingA = listing?.id;
}

// Employer B: their own org.
let orgB;
{
  const { data } = await employerB.client
    .from("employers")
    .insert({ name: "Org B", slug: `org-b-${Date.now()}`, created_by: employerB.id })
    .select("id")
    .single();
  orgB = data?.id;
  await employerB.client
    .from("employer_members")
    .insert({ employer_id: orgB, user_id: employerB.id, member_role: "owner" });
}

// Student A applies to listing A.
let applicationA;
{
  const { data, error } = await studentA.client
    .from("applications")
    .insert({
      listing_id: listingA,
      student_id: studentA.id,
      message: "hello",
      snapshot: { first_name: "Ada", work_authorized: true },
    })
    .select("id")
    .single();
  check("studentA applies to active listing", !error, error?.message);
  applicationA = data?.id;
}

console.log("\nAs ANOTHER STUDENT (studentB):");
{
  const { data } = await studentB.client
    .from("student_profiles")
    .select("*")
    .eq("user_id", studentA.id);
  check("cannot read studentA's profile", (data ?? []).length === 0);

  const { data: hours } = await studentB.client
    .from("hour_entries")
    .select("*")
    .eq("student_id", studentA.id);
  check("cannot read studentA's hours", (hours ?? []).length === 0);

  const { data: apps } = await studentB.client
    .from("applications")
    .select("*")
    .eq("student_id", studentA.id);
  check("cannot read studentA's applications", (apps ?? []).length === 0);

  const { error } = await studentB.client.from("applications").insert({
    listing_id: listingA,
    student_id: studentA.id, // forged
    snapshot: {},
  });
  check("cannot forge an application as studentA", !!error);

  const { error: orgError } = await studentB.client
    .from("employers")
    .insert({ name: "Fake Org", slug: `fake-${Date.now()}`, created_by: studentB.id });
  check("student cannot create an employer org", !!orgError);
}

console.log("\nAs ANOTHER EMPLOYER (employerB):");
{
  const { data: apps } = await employerB.client
    .from("applications")
    .select("*")
    .eq("listing_id", listingA);
  check("cannot read applications to orgA's listing", (apps ?? []).length === 0);

  const { data: updated } = await employerB.client
    .from("listings")
    .update({ title: "hijacked" })
    .eq("id", listingA)
    .select("id");
  check("cannot update orgA's listing", (updated ?? []).length === 0);

  const { data: members } = await employerB.client
    .from("employer_members")
    .select("*")
    .eq("employer_id", orgA);
  check("cannot enumerate orgA's members", (members ?? []).length === 0);

  // The company profile is publicly readable but owner-only writable.
  const { data: hijacked } = await employerB.client
    .from("employers")
    .update({ name: "Hijacked GmbH", description: "defaced" })
    .eq("id", orgA)
    .select("id");
  check("cannot edit orgA's company profile", (hijacked ?? []).length === 0);

  const { data: stillOk } = await anon
    .from("employers")
    .select("name")
    .eq("id", orgA)
    .maybeSingle();
  check("orgA's name is unchanged after the attempt", stillOk?.name === "Org A");

  const { error: memberError } = await employerB.client
    .from("employer_members")
    .insert({ employer_id: orgA, user_id: employerB.id, member_role: "owner" });
  check("cannot add self to orgA", !!memberError);

  const { data: subs } = await employerB.client
    .from("subscriptions")
    .select("*")
    .eq("employer_id", orgA);
  check("cannot read orgA's subscription", (subs ?? []).length === 0);
}

console.log("\nAs the LISTING'S EMPLOYER (employerA):");
{
  const { data: apps } = await employerA.client
    .from("applications")
    .select("id, status, snapshot")
    .eq("listing_id", listingA);
  check("can read applications to own listing", (apps ?? []).length === 1);

  const { data: updated, error } = await employerA.client
    .from("applications")
    .update({ status: "in_review" })
    .eq("id", applicationA)
    .select("id");
  check("can move application status", !error && (updated ?? []).length === 1, error?.message);

  const { error: snapshotError } = await employerA.client
    .from("applications")
    .update({ snapshot: { first_name: "Tampered" } })
    .eq("id", applicationA);
  check("cannot tamper with the consented snapshot", !!snapshotError);

  const { data: profile } = await employerA.client
    .from("student_profiles")
    .select("*")
    .eq("user_id", studentA.id);
  check("cannot read the student's live profile", (profile ?? []).length === 0);
}

console.log("\nAs the APPLICANT (studentA):");
{
  const { data: hijack } = await studentA.client
    .from("applications")
    .update({ status: "hired" })
    .eq("id", applicationA)
    .select("id");
  check("cannot set own application to hired", (hijack ?? []).length === 0);

  const { data: withdrawn, error } = await studentA.client
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", applicationA)
    .select("id");
  check("can withdraw own application", !error && (withdrawn ?? []).length === 1, error?.message);
}

console.log("\nHOURS: employer confirmation boundary");
{
  // studentA logged an hour entry with no listing (an outside employer).
  const { data: outside } = await studentA.client
    .from("hour_entries")
    .select("id, status, submitted_hours")
    .eq("student_id", studentA.id);
  check(
    "student's own entry starts as self_reported",
    outside?.[0]?.status === "self_reported",
  );
  check(
    "submitted_hours is captured on insert",
    Number(outside?.[0]?.submitted_hours) === 6,
  );

  // A student must not be able to confirm their own hours.
  const { data: selfConfirm } = await studentA.client
    .from("hour_entries")
    .update({ status: "confirmed", hours: 99 })
    .eq("id", outside[0].id)
    .select("status, hours");
  check(
    "student cannot self-confirm",
    !selfConfirm?.[0] || selfConfirm[0].status === "self_reported",
  );

  // Hours for an outside employer (listing_id null) are invisible to any
  // employer — nobody employs the student for them.
  const { data: seen } = await employerA.client
    .from("hour_entries")
    .select("id")
    .eq("student_id", studentA.id);
  check("employer cannot see hours with no listing", (seen ?? []).length === 0);

  // Now hire studentA for orgA's listing, then log hours against it.
  await employerA.client
    .from("applications")
    .update({ status: "hired" })
    .eq("id", applicationA);

  const { error: logErr } = await studentA.client.from("hour_entries").insert({
    student_id: studentA.id,
    worked_on: "2026-07-21",
    hours: 5,
    listing_id: listingA,
  });
  check("student can log hours against a job they were hired for", !logErr, logErr?.message);

  const { data: employerView } = await employerA.client
    .from("hour_entries")
    .select("id, submitted_hours")
    .eq("listing_id", listingA);
  check(
    "hiring employer sees those hours",
    (employerView ?? []).length === 1,
  );

  const { data: otherView } = await employerB.client
    .from("hour_entries")
    .select("id")
    .eq("listing_id", listingA);
  check("a different employer cannot see them", (otherView ?? []).length === 0);

  // Employer corrects the figure; the student's original must survive.
  const entryId = employerView[0].id;
  const { error: corrErr } = await employerA.client
    .from("hour_entries")
    .update({ hours: 3, employer_note: "left early" })
    .eq("id", entryId);
  check("hiring employer can correct hours", !corrErr, corrErr?.message);

  const { data: after } = await employerA.client
    .from("hour_entries")
    .select("hours, submitted_hours, status, confirmed_by")
    .eq("id", entryId)
    .maybeSingle();
  check("correction is marked as corrected", after?.status === "corrected");
  check("student's original figure is preserved", Number(after?.submitted_hours) === 5);
  check("correction records who made it", after?.confirmed_by === employerA.id);

  // Once confirmed, the student can no longer edit or delete it.
  const { data: studentEdit } = await studentA.client
    .from("hour_entries")
    .update({ hours: 12 })
    .eq("id", entryId)
    .select("id");
  check("student cannot edit a corrected entry", (studentEdit ?? []).length === 0);

  const { data: studentDel } = await studentA.client
    .from("hour_entries")
    .delete()
    .eq("id", entryId)
    .select("id");
  check("student cannot delete a corrected entry", (studentDel ?? []).length === 0);

  const { data: otherEdit } = await employerB.client
    .from("hour_entries")
    .update({ hours: 1 })
    .eq("id", entryId)
    .select("id");
  check("a different employer cannot alter them", (otherEdit ?? []).length === 0);
}

console.log("\nAs ANONYMOUS:");
{
  const { data: listings, error } = await anon
    .from("listings")
    .select("slug")
    .eq("status", "active")
    .limit(1);
  check("can read active listings", !error && (listings ?? []).length > 0, error?.message);

  const { data: drafts } = await anon.from("listings").select("id").eq("status", "draft");
  check("cannot read draft listings", (drafts ?? []).length === 0);

  const { error: profileError, data: profiles } = await anon
    .from("student_profiles")
    .select("*");
  check(
    "cannot read student profiles",
    !!profileError || (profiles ?? []).length === 0,
  );

  const { error: appsError, data: apps } = await anon.from("applications").select("*");
  check("cannot read applications", !!appsError || (apps ?? []).length === 0);

  const { error: hoursError, data: hours } = await anon.from("hour_entries").select("*");
  check("cannot read hour entries", !!hoursError || (hours ?? []).length === 0);
}

// Cleanup: remove everything this run created, so test rows never linger
// on the local jobs board. Deleting the employers cascades listings and
// applications; deleting the users cascades profiles and hour entries.
for (const org of [orgA, orgB]) {
  if (org) {
    const { error } = await admin.from("employers").delete().eq("id", org);
    if (error) console.error(`cleanup: could not delete employer ${org}: ${error.message}`);
  }
}
for (const user of [studentA, studentB, employerA, employerB]) {
  await admin.auth.admin.deleteUser(user.id);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
