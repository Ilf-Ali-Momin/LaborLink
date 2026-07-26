import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { saveStudentProfile } from "@/app/actions/profile";

export const metadata = { title: "Profile" };

const inputClass =
  "mt-1.5 w-full border border-ash bg-transparent p-3 rounded-r outline-none focus:border-signal";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; complete?: string; welcome?: string; then?: string }>;
}) {
  const params = await searchParams;
  const session = (await getSessionProfile())!;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-display-m">
        {params.welcome ? "Welcome. Tell us who you are." : "Profile."}
      </h1>
      <p className="mt-3 max-w-[55ch] text-paper/70">
        This is what an employer sees when you apply — and only when you
        apply, only for that application, only with your tick of consent.
      </p>

      {params.complete ? (
        <p className="mt-6 border-l-2 border-near pl-4">
          Add your name first. Then your application can go out.
        </p>
      ) : null}
      {params.saved ? (
        <p className="mt-6 border-l-2 border-signal pl-4">Profile saved.</p>
      ) : null}
      {params.error === "name" ? (
        <p className="mt-6 border-l-2 border-over pl-4">
          A first name is required.
        </p>
      ) : params.error === "failed" ? (
        <p className="mt-6 border-l-2 border-over pl-4">
          Saving failed. Try again.
        </p>
      ) : null}

      <form action={saveStudentProfile} className="mt-8 space-y-5">
        {params.then ? <input type="hidden" name="then" value={params.then} /> : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="text-sm font-medium">
              First name
            </label>
            <input
              id="first_name"
              name="first_name"
              required
              defaultValue={p?.first_name ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="last_name" className="text-sm font-medium">
              Last name
            </label>
            <input
              id="last_name"
              name="last_name"
              defaultValue={p?.last_name ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="university" className="text-sm font-medium">
              University
            </label>
            <input
              id="university"
              name="university"
              defaultValue={p?.university ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="degree_program" className="text-sm font-medium">
              Degree program
            </label>
            <input
              id="degree_program"
              name="degree_program"
              defaultValue={p?.degree_program ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="semester" className="text-sm font-medium">
              Semester
            </label>
            <input
              id="semester"
              name="semester"
              type="number"
              min={1}
              max={30}
              defaultValue={p?.semester ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="city" className="text-sm font-medium">
              City
            </label>
            <input id="city" name="city" defaultValue={p?.city ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="languages" className="text-sm font-medium">
              Languages (comma-separated)
            </label>
            <input
              id="languages"
              name="languages"
              placeholder="English, German"
              defaultValue={(p?.languages ?? []).join(", ")}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="text-sm font-medium">
            About you (optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={2000}
            defaultValue={p?.bio ?? ""}
            className={inputClass}
            placeholder="Two or three sentences. What you can do, what you are looking for."
          />
        </div>

        <fieldset className="border border-ash p-5 rounded-r">
          <legend className="px-2 text-sm font-medium">
            Work authorization
          </legend>
          <p className="text-sm text-paper/60">
            Employers see a yes/no answer computed from this — never a
            document. Self-declared for now; document verification comes
            later.
          </p>
          <div className="mt-4 space-y-3">
            {(
              [
                ["eu_citizen", "I am an EU or EEA citizen — no permit needed"],
                ["permit_verified", "I have a residence permit that allows student work"],
                ["permit_pending", "My permit or extension is in process"],
                ["unknown", "I am not sure yet"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-start gap-3 text-sm">
                <input
                  type="radio"
                  name="work_auth"
                  value={value}
                  defaultChecked={(p?.work_auth ?? "unknown") === value}
                  className="mt-0.5 accent-[var(--color-signal)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded-r bg-signal px-6 py-3 font-medium text-void transition-colors duration-200 hover:bg-paper"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}
